# ⚠️ ML Model Training Required

## Error: 500 Internal Server Error

If you're seeing a **500 Internal Server Error** when trying to use the price prediction feature, it means the ML model hasn't been trained yet.

## Quick Fix

Train the model by running:

```bash
cd backend/ml
python train.py
```

This will:
1. Load and analyze the dataset
2. Preprocess the data
3. Train the Random Forest model
4. Save model files to `backend/ml/models/`

**Expected time:** 10-30 minutes (depending on your machine)

## After Training

Once training completes, you should see these files in `backend/ml/models/`:
- ✅ `model.pkl` - Trained model
- ✅ `preprocessor.pkl` - Preprocessing pipeline
- ✅ `features.json` - Feature names
- ✅ `metrics.json` - Model performance metrics

## Verify Training

After training, test the prediction:

```bash
cd backend/ml
python test_predict.py
```

Or use the API:
```bash
POST http://localhost:4000/api/price-predictions/predict
```

## Troubleshooting

**Problem:** `ModuleNotFoundError: No module named 'sklearn'`
- **Solution:** `pip install -r requirements.txt`

**Problem:** `FileNotFoundError: Dataset not found`
- **Solution:** Ensure `backend/ml/data/india_crop_prices_expanded_2022_2025.csv` exists

**Problem:** Training takes too long
- **Solution:** This is normal. The dataset is large (~184k rows). You can reduce `n_estimators` in `train.py` for faster training (less accurate).











