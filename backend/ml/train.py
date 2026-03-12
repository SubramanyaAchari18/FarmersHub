# """
# Crop Price Prediction Model Training Script
# ============================================
# This script trains a Random Forest Regression model for crop price prediction.
# It includes data loading, preprocessing, model training with GridSearchCV, 
# evaluation, and model persistence.
# """

# import json
# import os
# import pickle
# import warnings
# from pathlib import Path

# import numpy as np
# import pandas as pd
# from sklearn.compose import ColumnTransformer
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
# from sklearn.model_selection import GridSearchCV, train_test_split
# from sklearn.preprocessing import OneHotEncoder, StandardScaler

# # Suppress warnings for cleaner output
# warnings.filterwarnings('ignore')

# # Configuration
# BASE_DIR = Path(__file__).parent
# DATA_DIR = BASE_DIR / "data"
# MODELS_DIR = BASE_DIR / "models"
# CSV_FILE = DATA_DIR / "india_crop_prices_expanded_2022_2025.csv"

# # Ensure models directory exists
# MODELS_DIR.mkdir(exist_ok=True)


# def load_dataset():
#     """
#     Load the crop price dataset from CSV file.
    
#     Returns:
#         pd.DataFrame: Loaded dataset
#     """
#     print("=" * 60)
#     print("STEP 1: LOADING DATASET")
#     print("=" * 60)
    
#     if not CSV_FILE.exists():
#         raise FileNotFoundError(f"Dataset not found at {CSV_FILE}")
    
#     print(f"Loading dataset from: {CSV_FILE}")
#     df = pd.read_csv(CSV_FILE)
    
#     print(f"\nDataset loaded successfully!")
#     print(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
#     # Display first 10 rows
#     print("\n" + "=" * 60)
#     print("First 10 rows:")
#     print("=" * 60)
#     print(df.head(10).to_string())
    
#     # Display summary statistics
#     print("\n" + "=" * 60)
#     print("Summary Statistics:")
#     print("=" * 60)
#     print(df.describe())
    
#     # Display data types
#     print("\n" + "=" * 60)
#     print("Data Types:")
#     print("=" * 60)
#     print(df.dtypes)
    
#     # Display missing values
#     print("\n" + "=" * 60)
#     print("Missing Values:")
#     print("=" * 60)
#     missing = df.isnull().sum()
#     missing_pct = (missing / len(df)) * 100
#     missing_df = pd.DataFrame({
#         'Missing Count': missing,
#         'Missing Percentage': missing_pct
#     })
#     print(missing_df[missing_df['Missing Count'] > 0])
    
#     if missing.sum() == 0:
#         print("No missing values found!")
    
#     return df


# def preprocess_data(df):
#     """
#     Preprocess the dataset: handle missing values, encode categorical features,
#     and prepare features for training.
    
#     Args:
#         df: Raw dataset DataFrame
        
#     Returns:
#         tuple: (X, y, preprocessor, feature_names)
#             - X: Feature matrix
#             - y: Target variable (price_modal)
#             - preprocessor: Fitted preprocessing pipeline
#             - feature_names: List of feature names after preprocessing
#     """
#     print("\n" + "=" * 60)
#     print("STEP 2: PREPROCESSING DATA")
#     print("=" * 60)
    
#     # Create a copy to avoid modifying original
#     df_processed = df.copy()
    
#     # Handle missing values
#     print("\nHandling missing values...")
#     missing_before = df_processed.isnull().sum().sum()
    
#     # Fill missing values in numerical columns with median
#     numerical_cols = df_processed.select_dtypes(include=[np.number]).columns.tolist()
#     for col in numerical_cols:
#         if df_processed[col].isnull().sum() > 0:
#             median_val = df_processed[col].median()
#             df_processed[col].fillna(median_val, inplace=True)
#             print(f"  - Filled {col} with median: {median_val:.2f}")
    
#     # Fill missing values in categorical columns with mode
#     categorical_cols = df_processed.select_dtypes(include=['object']).columns.tolist()
#     for col in categorical_cols:
#         if df_processed[col].isnull().sum() > 0:
#             mode_val = df_processed[col].mode()[0] if not df_processed[col].mode().empty else 'Unknown'
#             df_processed[col].fillna(mode_val, inplace=True)
#             print(f"  - Filled {col} with mode: {mode_val}")
    
#     missing_after = df_processed.isnull().sum().sum()
#     print(f"\nMissing values: {missing_before} → {missing_after}")
    
#     # Define target variable (using price_modal as the target)
#     target_col = 'price_modal'
#     if target_col not in df_processed.columns:
#         raise ValueError(f"Target column '{target_col}' not found in dataset")
    
#     y = df_processed[target_col].values
    
#     # Remove rows with invalid target values
#     valid_mask = ~pd.isna(y) & (y > 0)
#     df_processed = df_processed[valid_mask]
#     y = y[valid_mask]
    
#     print(f"\nValid samples after cleaning: {len(y)}")
    
#     # Define feature columns
#     # Exclude target, date (we'll use year/month separately), and unit (constant)
#     exclude_cols = ['date', 'price_min', 'price_modal', 'price_max', 'unit']
    
#     # Categorical features for encoding
#     categorical_features = ['season', 'state', 'crop_category', 'crop_name', 'variety_name']
    
#     # Numerical features (year, month are already numerical)
#     numerical_features = ['year', 'month']
    
#     # Ensure all features exist
#     available_categorical = [col for col in categorical_features if col in df_processed.columns]
#     available_numerical = [col for col in numerical_features if col in df_processed.columns]
    
#     print(f"\nCategorical features: {available_categorical}")
#     print(f"Numerical features: {available_numerical}")
    
#     # Create preprocessing pipeline
#     preprocessor = ColumnTransformer(
#         transformers=[
#             ('num', StandardScaler(), available_numerical),
#             ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), 
#              available_categorical)
#         ],
#         remainder='drop'
#     )
    
#     # Prepare feature matrix
#     feature_cols = available_numerical + available_categorical
#     X = df_processed[feature_cols]
    
#     # Fit and transform the data
#     print("\nFitting preprocessing pipeline...")
#     X_processed = preprocessor.fit_transform(X)
    
#     # Get feature names after preprocessing
#     feature_names = []
    
#     # Numerical feature names
#     feature_names.extend(available_numerical)
    
#     # Categorical feature names (from OneHotEncoder)
#     cat_encoder = preprocessor.named_transformers_['cat']
#     cat_feature_names = []
#     for i, col in enumerate(available_categorical):
#         categories = cat_encoder.categories_[i]
#         for cat in categories[1:]:  # Skip first category (drop='first')
#             cat_feature_names.append(f"{col}_{cat}")
#     feature_names.extend(cat_feature_names)
    
#     print(f"\nTotal features after preprocessing: {len(feature_names)}")
#     print(f"Feature matrix shape: {X_processed.shape}")
    
#     return X_processed, y, preprocessor, feature_names


# def train_model(X_train, y_train):
#     """
#     Train Random Forest model with GridSearchCV for hyperparameter tuning.
    
#     Args:
#         X_train: Training feature matrix
#         y_train: Training target values
        
#     Returns:
#         sklearn.ensemble.RandomForestRegressor: Best trained model
#     """
#     print("\n" + "=" * 60)
#     print("STEP 3: TRAINING MODEL")
#     print("=" * 60)
    
#     # Base Random Forest model
#     rf_model = RandomForestRegressor(
#         random_state=42,
#         n_jobs=-1,  # Use all available cores
#         verbose=0
#     )
    
#     # Hyperparameter grid for GridSearchCV
#     param_grid = {
#         'n_estimators': [100, 200, 300],
#         'max_depth': [10, 20, 30, None],
#         'min_samples_split': [2, 5, 10],
#         'min_samples_leaf': [1, 2, 4],
#         'max_features': ['sqrt', 'log2']
#     }
    
#     print("\nPerforming GridSearchCV...")
#     print("This may take several minutes...")
    
#     # GridSearchCV with cross-validation
#     grid_search = GridSearchCV(
#         estimator=rf_model,
#         param_grid=param_grid,
#         cv=5,  # 5-fold cross-validation
#         scoring='neg_mean_squared_error',
#         n_jobs=-1,
#         verbose=1
#     )
    
#     grid_search.fit(X_train, y_train)
    
#     print("\n" + "=" * 60)
#     print("Best Hyperparameters:")
#     print("=" * 60)
#     for param, value in grid_search.best_params_.items():
#         print(f"  {param}: {value}")
    
#     print(f"\nBest CV Score (neg MSE): {grid_search.best_score_:.2f}")
    
#     return grid_search.best_estimator_


# def evaluate_model(model, X_test, y_test):
#     """
#     Evaluate the trained model and print metrics.
    
#     Args:
#         model: Trained model
#         X_test: Test feature matrix
#         y_test: Test target values
        
#     Returns:
#         dict: Dictionary containing evaluation metrics
#     """
#     print("\n" + "=" * 60)
#     print("STEP 4: MODEL EVALUATION")
#     print("=" * 60)
    
#     # Make predictions
#     y_pred = model.predict(X_test)
    
#     # Calculate metrics
#     mae = mean_absolute_error(y_test, y_pred)
#     mse = mean_squared_error(y_test, y_pred)
#     rmse = np.sqrt(mse)
#     r2 = r2_score(y_test, y_pred)
    
#     # Print metrics
#     print("\nEvaluation Metrics:")
#     print("-" * 60)
#     print(f"Mean Absolute Error (MAE):     {mae:.2f}")
#     print(f"Mean Squared Error (MSE):      {mse:.2f}")
#     print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
#     print(f"R² Score:                      {r2:.4f}")
#     print("-" * 60)
    
#     # Additional statistics
#     print("\nPrediction Statistics:")
#     print("-" * 60)
#     print(f"Actual Price Range:    {y_test.min():.2f} - {y_test.max():.2f}")
#     print(f"Predicted Price Range: {y_pred.min():.2f} - {y_pred.max():.2f}")
#     print(f"Mean Actual Price:     {y_test.mean():.2f}")
#     print(f"Mean Predicted Price:  {y_pred.mean():.2f}")
#     print("-" * 60)
    
#     metrics = {
#         'mae': float(mae),
#         'mse': float(mse),
#         'rmse': float(rmse),
#         'r2': float(r2)
#     }
    
#     return metrics


# def save_model_artifacts(model, preprocessor, feature_names, metrics):
#     """
#     Save the trained model, preprocessor, and feature names to disk.
    
#     Args:
#         model: Trained model
#         preprocessor: Fitted preprocessing pipeline
#         feature_names: List of feature names
#         metrics: Evaluation metrics dictionary
#     """
#     print("\n" + "=" * 60)
#     print("STEP 5: SAVING MODEL ARTIFACTS")
#     print("=" * 60)
    
#     # Save model
#     model_path = MODELS_DIR / "model.pkl"
#     with open(model_path, 'wb') as f:
#         pickle.dump(model, f)
#     print(f"✓ Model saved to: {model_path}")
    
#     # Save preprocessor
#     preprocessor_path = MODELS_DIR / "preprocessor.pkl"
#     with open(preprocessor_path, 'wb') as f:
#         pickle.dump(preprocessor, f)
#     print(f"✓ Preprocessor saved to: {preprocessor_path}")
    
#     # Save feature names
#     features_path = MODELS_DIR / "features.json"
#     with open(features_path, 'w') as f:
#         json.dump(feature_names, f, indent=2)
#     print(f"✓ Features saved to: {features_path}")
    
#     # Save metrics
#     metrics_path = MODELS_DIR / "metrics.json"
#     with open(metrics_path, 'w') as f:
#         json.dump(metrics, f, indent=2)
#     print(f"✓ Metrics saved to: {metrics_path}")
    
#     print("\n" + "=" * 60)
#     print("All artifacts saved successfully!")
#     print("=" * 60)


# def main():
#     """Main training pipeline."""
#     try:
#         # Load dataset
#         df = load_dataset()
        
#         # Preprocess data
#         X, y, preprocessor, feature_names = preprocess_data(df)
        
#         # Split into training and testing sets
#         print("\n" + "=" * 60)
#         print("Splitting dataset into training and testing sets...")
#         print("=" * 60)
#         X_train, X_test, y_train, y_test = train_test_split(
#             X, y, test_size=0.2, random_state=42
#         )
#         print(f"Training set: {X_train.shape[0]} samples")
#         print(f"Testing set: {X_test.shape[0]} samples")
        
#         # Train model
#         model = train_model(X_train, y_train)
        
#         # Evaluate model
#         metrics = evaluate_model(model, X_test, y_test)
        
#         # Save artifacts
#         save_model_artifacts(model, preprocessor, feature_names, metrics)
        
#         print("\n" + "=" * 60)
#         print("TRAINING COMPLETE!")
#         print("=" * 60)
#         print("\nNext steps:")
#         print("1. Use predict.py to make predictions on new data")
#         print("2. Integrate with your backend API")
        
#     except Exception as e:
#         print(f"\n❌ Error during training: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise


# if __name__ == "__main__":
#     main()

"""
Crop Price Prediction Model Training Script
============================================
This script trains a Random Forest Regression model for crop price prediction.
It includes data loading, preprocessing, model training, 
evaluation, and model persistence.
"""

import json
import os
import pickle
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
CSV_FILE = DATA_DIR / "india_crop_prices_expanded_2022_2025.csv"

# Ensure models directory exists
MODELS_DIR.mkdir(exist_ok=True)


def load_dataset():
    """
    Load the crop price dataset from CSV file.
    
    Returns:
        pd.DataFrame: Loaded dataset
    """
    print("=" * 60)
    print("STEP 1: LOADING DATASET")
    print("=" * 60)
    
    if not CSV_FILE.exists():
        raise FileNotFoundError(f"Dataset not found at {CSV_FILE}")
    
    print(f"Loading dataset from: {CSV_FILE}")
    df = pd.read_csv(CSV_FILE)
    
    print(f"\nDataset loaded successfully!")
    print(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    # Display first 10 rows
    print("\n" + "=" * 60)
    print("First 10 rows:")
    print("=" * 60)
    print(df.head(10).to_string())
    
    # Display summary statistics
    print("\n" + "=" * 60)
    print("Summary Statistics:")
    print("=" * 60)
    print(df.describe())
    
    # Display data types
    print("\n" + "=" * 60)
    print("Data Types:")
    print("=" * 60)
    print(df.dtypes)
    
    # Display missing values
    print("\n" + "=" * 60)
    print("Missing Values:")
    print("=" * 60)
    missing = df.isnull().sum()
    missing_pct = (missing / len(df)) * 100
    missing_df = pd.DataFrame({
        'Missing Count': missing,
        'Missing Percentage': missing_pct
    })
    print(missing_df[missing_df['Missing Count'] > 0])
    
    if missing.sum() == 0:
        print("No missing values found!")
    
    return df


def preprocess_data(df):
    """
    Preprocess the dataset: handle missing values, encode categorical features,
    and prepare features for training.
    
    Args:
        df: Raw dataset DataFrame
        
    Returns:
        tuple: (X, y, preprocessor, feature_names)
            - X: Feature matrix
            - y: Target variable (price_modal)
            - preprocessor: Fitted preprocessing pipeline
            - feature_names: List of feature names after preprocessing
    """
    print("\n" + "=" * 60)
    print("STEP 2: PREPROCESSING DATA")
    print("=" * 60)
    
    # Create a copy to avoid modifying original
    df_processed = df.copy()
    
    # Handle missing values
    print("\nHandling missing values...")
    missing_before = df_processed.isnull().sum().sum()
    
    # Fill missing values in numerical columns with median
    numerical_cols = df_processed.select_dtypes(include=[np.number]).columns.tolist()
    for col in numerical_cols:
        if df_processed[col].isnull().sum() > 0:
            median_val = df_processed[col].median()
            df_processed[col].fillna(median_val, inplace=True)
            print(f"  - Filled {col} with median: {median_val:.2f}")
    
    # Fill missing values in categorical columns with mode
    categorical_cols = df_processed.select_dtypes(include=['object']).columns.tolist()
    for col in categorical_cols:
        if df_processed[col].isnull().sum() > 0:
            mode_val = df_processed[col].mode()[0] if not df_processed[col].mode().empty else 'Unknown'
            df_processed[col].fillna(mode_val, inplace=True)
            print(f"  - Filled {col} with mode: {mode_val}")
    
    missing_after = df_processed.isnull().sum().sum()
    print(f"\nMissing values: {missing_before} → {missing_after}")
    
    # Define target variable (using price_modal as the target)
    target_col = 'price_modal'
    if target_col not in df_processed.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset")
    
    y = df_processed[target_col].values
    
    # Remove rows with invalid target values
    valid_mask = ~pd.isna(y) & (y > 0)
    df_processed = df_processed[valid_mask]
    y = y[valid_mask]
    
    print(f"\nValid samples after cleaning: {len(y)}")
    
    # Define feature columns
    # Exclude target, date (we'll use year/month separately), and unit (constant)
    exclude_cols = ['date', 'price_min', 'price_modal', 'price_max', 'unit']
    
    # Categorical features for encoding
    categorical_features = ['season', 'state', 'crop_category', 'crop_name', 'variety_name']
    
    # Numerical features (year, month are already numerical)
    numerical_features = ['year', 'month']
    
    # Ensure all features exist
    available_categorical = [col for col in categorical_features if col in df_processed.columns]
    available_numerical = [col for col in numerical_features if col in df_processed.columns]
    
    print(f"\nCategorical features: {available_categorical}")
    print(f"Numerical features: {available_numerical}")
    
    # Create preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), available_numerical),
            ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), 
             available_categorical)
        ],
        remainder='drop'
    )
    
    # Prepare feature matrix
    feature_cols = available_numerical + available_categorical
    X = df_processed[feature_cols]
    
    # Fit and transform the data
    print("\nFitting preprocessing pipeline...")
    X_processed = preprocessor.fit_transform(X)
    
    # Get feature names after preprocessing
    feature_names = []
    
    # Numerical feature names
    feature_names.extend(available_numerical)
    
    # Categorical feature names (from OneHotEncoder)
    cat_encoder = preprocessor.named_transformers_['cat']
    cat_feature_names = []
    for i, col in enumerate(available_categorical):
        categories = cat_encoder.categories_[i]
        for cat in categories[1:]:  # Skip first category (drop='first')
            cat_feature_names.append(f"{col}_{cat}")
    feature_names.extend(cat_feature_names)
    
    print(f"\nTotal features after preprocessing: {len(feature_names)}")
    print(f"Feature matrix shape: {X_processed.shape}")
    
    return X_processed, y, preprocessor, feature_names


def train_model(X_train, y_train):
    """
    Train a single RandomForestRegressor without GridSearchCV
    to avoid out-of-memory errors on large datasets.
    
    Args:
        X_train: Training feature matrix
        y_train: Training target values
        
    Returns:
        RandomForestRegressor: Trained model
    """
    print("\n" + "=" * 60)
    print("STEP 3: TRAINING MODEL (Simple RandomForest, no GridSearch)")
    print("=" * 60)

    # A reasonable Random Forest configuration
    model = RandomForestRegressor(
        n_estimators=100,      # number of trees
        max_depth=20,          # limit depth to reduce memory/overfitting
        min_samples_split=10,
        min_samples_leaf=4,
        max_features="sqrt",
        n_jobs=-1,
        random_state=42
    )

    print("\nFitting RandomForestRegressor...")
    model.fit(X_train, y_train)
    print("Model training completed successfully!")

    return model


def evaluate_model(model, X_test, y_test):
    """
    Evaluate the trained model and print metrics.
    
    Args:
        model: Trained model
        X_test: Test feature matrix
        y_test: Test target values
        
    Returns:
        dict: Dictionary containing evaluation metrics
    """
    print("\n" + "=" * 60)
    print("STEP 4: MODEL EVALUATION")
    print("=" * 60)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    # Print metrics
    print("\nEvaluation Metrics:")
    print("-" * 60)
    print(f"Mean Absolute Error (MAE):     {mae:.2f}")
    print(f"Mean Squared Error (MSE):      {mse:.2f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
    print(f"R² Score:                      {r2:.4f}")
    print("-" * 60)
    
    # Additional statistics
    print("\nPrediction Statistics:")
    print("-" * 60)
    print(f"Actual Price Range:    {y_test.min():.2f} - {y_test.max():.2f}")
    print(f"Predicted Price Range: {y_pred.min():.2f} - {y_pred.max():.2f}")
    print(f"Mean Actual Price:     {y_test.mean():.2f}")
    print(f"Mean Predicted Price:  {y_pred.mean():.2f}")
    print("-" * 60)
    
    metrics = {
        'mae': float(mae),
        'mse': float(mse),
        'rmse': float(rmse),
        'r2': float(r2)
    }
    
    return metrics


def save_model_artifacts(model, preprocessor, feature_names, metrics):
    """
    Save the trained model, preprocessor, and feature names to disk.
    
    Args:
        model: Trained model
        preprocessor: Fitted preprocessing pipeline
        feature_names: List of feature names
        metrics: Evaluation metrics dictionary
    """
    print("\n" + "=" * 60)
    print("STEP 5: SAVING MODEL ARTIFACTS")
    print("=" * 60)
    
    # Save model
    model_path = MODELS_DIR / "model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"✓ Model saved to: {model_path}")
    
    # Save preprocessor
    preprocessor_path = MODELS_DIR / "preprocessor.pkl"
    with open(preprocessor_path, 'wb') as f:
        pickle.dump(preprocessor, f)
    print(f"✓ Preprocessor saved to: {preprocessor_path}")
    
    # Save feature names
    features_path = MODELS_DIR / "features.json"
    with open(features_path, 'w') as f:
        json.dump(feature_names, f, indent=2)
    print(f"✓ Features saved to: {features_path}")
    
    # Save metrics
    metrics_path = MODELS_DIR / "metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"✓ Metrics saved to: {metrics_path}")
    
    print("\n" + "=" * 60)
    print("All artifacts saved successfully!")
    print("=" * 60)


def main():
    """Main training pipeline."""
    try:
        # Load dataset
        df = load_dataset()
        
        # Preprocess data
        X, y, preprocessor, feature_names = preprocess_data(df)
        
        # Split into training and testing sets
        print("\n" + "=" * 60)
        print("Splitting dataset into training and testing sets...")
        print("=" * 60)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        print(f"Training set: {X_train.shape[0]} samples")
        print(f"Testing set: {X_test.shape[0]} samples")
        
        # Train model
        model = train_model(X_train, y_train)
        
        # Evaluate model
        metrics = evaluate_model(model, X_test, y_test)
        
        # Save artifacts
        save_model_artifacts(model, preprocessor, feature_names, metrics)
        
        print("\n" + "=" * 60)
        print("TRAINING COMPLETE!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Use predict.py to make predictions on new data")
        print("2. Integrate with your backend API")
        
    except Exception as e:
        print(f"\n❌ Error during training: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
