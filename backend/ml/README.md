# Crop Price Prediction ML Model

A production-ready Machine Learning model for predicting crop prices using Random Forest Regression.

## 📁 Folder Structure

```
backend/ml/
├── data/
│   └── india_crop_prices_expanded_2022_2025.csv
├── models/
│   ├── model.pkl              # Trained Random Forest model
│   ├── preprocessor.pkl       # Preprocessing pipeline
│   ├── features.json          # List of feature names
│   └── metrics.json           # Model evaluation metrics
├── train.py                   # Training script
├── predict.py                 # Inference script
├── preprocess.py              # Preprocessing utilities
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🚀 Setup

### 1. Install Python Dependencies

```bash
cd backend/ml
pip install -r requirements.txt
```

### 2. Verify Dataset

Ensure the CSV file is located at:
```
backend/ml/data/india_crop_prices_expanded_2022_2025.csv
```

## 📊 Training the Model

Run the training script to train the Random Forest model:

```bash
python train.py
```

This will:
- Load and analyze the dataset
- Preprocess the data (handle missing values, encode categorical features)
- Train a Random Forest model with GridSearchCV hyperparameter tuning
- Evaluate the model (MAE, MSE, RMSE, R² score)
- Save all artifacts to `models/` folder

**Expected Output:**
- `models/model.pkl` - Trained model
- `models/preprocessor.pkl` - Preprocessing pipeline
- `models/features.json` - Feature names
- `models/metrics.json` - Evaluation metrics

## 🔮 Making Predictions

### Command Line Usage

**Method 1: Using stdin (Works on all platforms)**
```bash
# Linux/Mac
echo '{"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"}' | python predict.py

# Windows CMD
echo {"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"} | python predict.py
```

**Method 2: Using command-line argument**

**Linux/Mac:**
```bash
python predict.py '{"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"}'
```

**Windows CMD (use double quotes and escape inner quotes):**
```cmd
python predict.py "{\"year\": 2024, \"month\": 6, \"season\": \"Kharif\", \"state\": \"Karnataka\", \"crop_category\": \"Vegetable\", \"crop_name\": \"Tomato\"}"
```

**Windows PowerShell:**
```powershell
python predict.py '{"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"}'
```

**Recommended: Create a JSON file for easier testing**
```bash
# Create test_input.json
echo {"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"} > test_input.json

# Use it
python predict.py < test_input.json
```

### Python API Usage

```python
from predict import predict_price

# Prepare input data
input_data = {
    'year': 2024,
    'month': 6,
    'season': 'Kharif',
    'state': 'Karnataka',
    'crop_category': 'Vegetable',
    'crop_name': 'Tomato',
    'variety_name': 'Tomato Var-001'  # Optional
}

# Make prediction
predicted_price = predict_price(input_data)
print(f"Predicted Price: ₹{predicted_price:.2f} per quintal")
```

### Input Format

The prediction function expects a dictionary with the following fields:

**Required Fields:**
- `year` (int): Year (2020-2030)
- `month` (int): Month (1-12)
- `season` (str): Season name (e.g., 'Rabi', 'Kharif', 'Zaid')
- `state` (str): State name
- `crop_category` (str): Crop category (e.g., 'Vegetable', 'Fruit')
- `crop_name` (str): Crop name

**Optional Fields:**
- `variety_name` (str): Variety name (defaults to 'Unknown' if not provided)

### Output Format

```json
{
  "predicted_price": 1750.50,
  "unit": "INR/quintal",
  "input": {
    "year": 2024,
    "month": 6,
    "season": "Kharif",
    "state": "Karnataka",
    "crop_category": "Vegetable",
    "crop_name": "Tomato"
  }
}
```

## 🔌 Backend Integration

### Node.js Express API Example

See `backend/routes/pricePredictions.js` for integration example, or use the following:

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

router.post('/predict-price', async (req, res, next) => {
  try {
    const inputData = {
      year: req.body.year,
      month: req.body.month,
      season: req.body.season,
      state: req.body.state,
      crop_category: req.body.crop_category,
      crop_name: req.body.crop_name,
      variety_name: req.body.variety_name || 'Unknown'
    };

    // Call Python prediction script
    const { stdout } = await execAsync(
      `python backend/ml/predict.py '${JSON.stringify(inputData)}'`
    );

    const result = JSON.parse(stdout);
    res.json({
      success: true,
      predictedPrice: result.predicted_price,
      unit: result.unit
    });
  } catch (err) {
    next(err);
  }
});
```

## 📈 Model Performance

After training, check `models/metrics.json` for evaluation metrics:
- **MAE** (Mean Absolute Error)
- **MSE** (Mean Squared Error)
- **RMSE** (Root Mean Squared Error)
- **R² Score** (Coefficient of Determination)

## 🔧 Troubleshooting

### Model artifacts not found
- Ensure you've run `train.py` first to generate the model files
- Check that `models/` folder contains `model.pkl`, `preprocessor.pkl`, and `features.json`

### Import errors
- Install dependencies: `pip install -r requirements.txt`
- Ensure you're using Python 3.8+

### Prediction errors
- Verify input data matches the expected format
- Check that all required fields are provided
- Ensure categorical values (season, state, crop_category, crop_name) match training data values

## 📝 Notes

- The model uses `price_modal` as the target variable
- Categorical features are encoded using OneHotEncoder
- Numerical features are scaled using StandardScaler
- The model handles unknown categories gracefully (using `handle_unknown='ignore'`)
- Training uses 5-fold cross-validation for hyperparameter tuning

## 🎯 Next Steps

1. Train the model: `python train.py`
2. Test predictions: Use `predict.py` with sample data
3. Integrate with backend API
4. Monitor model performance and retrain periodically with new data

