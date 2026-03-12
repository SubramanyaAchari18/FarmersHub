import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();
const execAsync = promisify(exec);

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/price-predictions
 * Get all saved price predictions
 */
router.get("/", async (_req, res, next) => {
  try {
    const rows = await prisma.pricePrediction.findMany({ orderBy: { createdAt: "desc" } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/price-predictions
 * Save a price prediction to database
 */
router.post("/", verifyJwt, async (req, res, next) => {
  try {
    const data = req.body;
    const created = await prisma.pricePrediction.create({
      data: {
        userId: req.userId,
        cropName: data.cropName,
        category: data.category,
        locationState: data.locationState,
        season: data.season,
        predictedPricePerKg: data.predictedPricePerKg,
        confidenceScore: data.confidenceScore || null,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/price-predictions/predict
 * Predict crop price using ML model
 * 
 * Request body:
 * {
 *   year: number (2020-2030),
 *   month: number (1-12),
 *   season: string (e.g., 'Rabi', 'Kharif', 'Zaid'),
 *   state: string (state name),
 *   crop_category: string (e.g., 'Vegetable', 'Fruit'),
 *   crop_name: string (crop name),
 *   variety_name?: string (optional, variety name)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   predictedPrice: number,
 *   unit: string,
 *   input: object
 * }
 */
router.post("/predict", async (req, res, next) => {
  try {
    const {
      year,
      month,
      season,
      state,
      crop_category,
      crop_name,
      variety_name
    } = req.body;

    // Validate required fields
    if (!year || !month || !season || !state || !crop_category || !crop_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: ["year", "month", "season", "state", "crop_category", "crop_name"]
      });
    }

    // Validate data types and ranges
    if (typeof year !== "number" || year < 2020 || year > 2030) {
      return res.status(400).json({
        success: false,
        error: "year must be a number between 2020 and 2030"
      });
    }

    if (typeof month !== "number" || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: "month must be a number between 1 and 12"
      });
    }

    // Prepare input data for Python script
    const inputData = {
      year: parseInt(year),
      month: parseInt(month),
      season: String(season),
      state: String(state),
      crop_category: String(crop_category),
      crop_name: String(crop_name),
      variety_name: variety_name ? String(variety_name) : "Unknown"
    };

    // Check if model files exist before attempting prediction
    const modelsDir = path.join(__dirname, "..", "ml", "models");
    const modelPath = path.join(modelsDir, "model.pkl");
    const preprocessorPath = path.join(modelsDir, "preprocessor.pkl");
    const featuresPath = path.join(modelsDir, "features.json");
    
    const fs = await import("fs");
    const missingFiles = [];
    if (!fs.existsSync(modelPath)) missingFiles.push("model.pkl");
    if (!fs.existsSync(preprocessorPath)) missingFiles.push("preprocessor.pkl");
    if (!fs.existsSync(featuresPath)) missingFiles.push("features.json");
    
    if (missingFiles.length > 0) {
      return res.status(503).json({
        success: false,
        error: "ML model not trained",
        message: `Model files not found. Please train the model first by running: cd backend/ml && python train.py`,
        missingFiles: missingFiles
      });
    }

    // Path to Python prediction script
    const pythonScriptPath = path.join(__dirname, "..", "ml", "predict.py");
    
    // Escape JSON string for command line (Windows-safe)
    // Use double quotes for Windows and escape inner quotes
    const jsonInput = JSON.stringify(inputData);
    
    // Determine Python command (try 'python3' first, fallback to 'python')
    let pythonCmd = "python";
    try {
      await execAsync("python3 --version");
      pythonCmd = "python3";
    } catch {
      // python3 not available, use python
      pythonCmd = "python";
    }

    // Execute Python prediction script
    // On Windows, we need to properly escape the JSON
    const isWindows = process.platform === "win32";
    let command;
    if (isWindows) {
      // Windows: Use double quotes and escape inner quotes
      const escapedJson = jsonInput.replace(/"/g, '\\"');
      command = `${pythonCmd} "${pythonScriptPath}" "${escapedJson}"`;
    } else {
      // Unix/Linux: Use single quotes around JSON
      command = `${pythonCmd} "${pythonScriptPath}" '${jsonInput}'`;
    }
    
    let stdout, stderr;
    try {
      const result = await execAsync(command, {
        cwd: path.join(__dirname, "..", "ml"),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        shell: isWindows ? true : false
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      // Check if Python script returned an error in stdout
      if (error.stdout) {
        try {
          const errorResult = JSON.parse(error.stdout.trim());
          if (errorResult.error) {
            return res.status(400).json({
              success: false,
              error: errorResult.error,
              message: errorResult.message || errorResult.error
            });
          }
        } catch {
          // Not JSON, continue with generic error
        }
      }
      
      console.error("Python script error:", error);
      console.error("Command:", command);
      console.error("Stdout:", error.stdout);
      console.error("Stderr:", error.stderr || error.message);
      
      // Provide more helpful error messages
      let errorMessage = "Failed to execute prediction script";
      if (error.stderr) {
        if (error.stderr.includes("FileNotFoundError") || error.stderr.includes("not found")) {
          errorMessage = "ML model files not found. Please train the model first.";
        } else if (error.stderr.includes("ModuleNotFoundError")) {
          errorMessage = "Python dependencies missing. Run: pip install -r backend/ml/requirements.txt";
        } else {
          errorMessage = error.stderr.substring(0, 200); // First 200 chars
        }
      }
      
      return res.status(500).json({
        success: false,
        error: "Prediction failed",
        message: errorMessage,
        details: error.stderr || error.message
      });
    }

    // Parse Python script output
    let result;
    try {
      result = JSON.parse(stdout.trim());
    } catch (parseError) {
      console.error("Failed to parse Python output:", stdout);
      return res.status(500).json({
        success: false,
        error: "Invalid response from prediction service",
        message: "Failed to parse prediction result"
      });
    }

    // Return successful prediction
    res.json({
      success: true,
      predictedPrice: result.predicted_price,
      unit: result.unit || "INR/quintal",
      input: result.input
    });

  } catch (err) {
    console.error("Price prediction error:", err);
    next(err);
  }
});

export default router;




