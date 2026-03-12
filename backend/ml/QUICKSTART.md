# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd backend/ml
pip install -r requirements.txt
```

### Step 2: Train the Model

```bash
python train.py
```

This will:
- Load and analyze the dataset
- Preprocess the data
- Train the Random Forest model with hyperparameter tuning
- Evaluate and save the model

**Expected time:** 10-30 minutes (depending on your machine)

### Step 3: Test Predictions

**Option 1: Using JSON file (Easiest - Works on all platforms):**
```bash
python predict.py < test_input.json
```

**Option 2: Using command-line (Windows CMD):**
```cmd
python predict.py "{\"year\": 2024, \"month\": 6, \"season\": \"Kharif\", \"state\": \"Karnataka\", \"crop_category\": \"Vegetable\", \"crop_name\": \"Tomato\"}"
```

**Option 3: Using command-line (Linux/Mac/PowerShell):**
```bash
python predict.py '{"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"}'
```

**Option 4: Using Python test script:**
```bash
python test_predict.py
```

**Using API:**
```bash
curl -X POST http://localhost:4000/api/price-predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 6, "season": "Kharif", "state": "Karnataka", "crop_category": "Vegetable", "crop_name": "Tomato"}'
```

## 📋 Required Input Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `year` | number | Year (2020-2030) | 2024 |
| `month` | number | Month (1-12) | 6 |
| `season` | string | Season name | "Kharif", "Rabi", "Zaid" |
| `state` | string | State name | "Karnataka" |
| `crop_category` | string | Crop category | "Vegetable", "Fruit" |
| `crop_name` | string | Crop name | "Tomato" |
| `variety_name` | string (optional) | Variety name | "Tomato Var-001" |

## 📁 File Structure

```
backend/ml/
├── data/
│   └── india_crop_prices_expanded_2022_2025.csv  ✅ Dataset
├── models/
│   ├── model.pkl              ✅ Generated after training
│   ├── preprocessor.pkl       ✅ Generated after training
│   ├── features.json          ✅ Generated after training
│   └── metrics.json           ✅ Generated after training
├── train.py                   ✅ Training script
├── predict.py                 ✅ Prediction script
├── preprocess.py              ✅ Preprocessing utilities
├── requirements.txt           ✅ Python dependencies
├── README.md                  ✅ Full documentation
├── API_EXAMPLE.md             ✅ API integration guide
└── QUICKSTART.md              ✅ This file
```

## ⚠️ Troubleshooting

**Problem:** `FileNotFoundError: Model artifacts not found`
- **Solution:** Run `python train.py` first to generate model files

**Problem:** `ModuleNotFoundError: No module named 'sklearn'`
- **Solution:** Install dependencies: `pip install -r requirements.txt`

**Problem:** API returns 500 error
- **Solution:** 
  1. Check Python is installed: `python --version`
  2. Verify model files exist in `models/` folder
  3. Check backend logs for detailed error messages

## 📊 Model Performance

After training, check `models/metrics.json` for:
- **MAE** (Mean Absolute Error)
- **MSE** (Mean Squared Error)  
- **RMSE** (Root Mean Squared Error)
- **R² Score** (Coefficient of Determination)

Typical R² scores: 0.7-0.9 (70-90% variance explained)

## 🔄 Retraining

To retrain with new data:
1. Update `data/india_crop_prices_expanded_2022_2025.csv`
2. Run `python train.py` again
3. New model will overwrite existing files

## 📚 More Information

- See `README.md` for detailed documentation
- See `API_EXAMPLE.md` for API integration examples
- Check model metrics in `models/metrics.json` after training

