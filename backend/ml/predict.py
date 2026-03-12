"""
Crop Price Prediction Inference Script
=======================================
This script loads the trained model and preprocessor to make predictions
on new crop price data. It accepts JSON input and returns predicted prices.
"""

import json
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# Configuration
BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "model.pkl"
PREPROCESSOR_PATH = MODELS_DIR / "preprocessor.pkl"
FEATURES_PATH = MODELS_DIR / "features.json"


def load_artifacts():
    """
    Load the trained model, preprocessor, and feature names.
    
    Returns:
        tuple: (model, preprocessor, feature_names)
    """
    try:
        # Load model
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        
        # Load preprocessor
        with open(PREPROCESSOR_PATH, 'rb') as f:
            preprocessor = pickle.load(f)
        
        # Load feature names
        with open(FEATURES_PATH, 'r') as f:
            feature_names = json.load(f)
        
        return model, preprocessor, feature_names
    
    except FileNotFoundError as e:
        raise FileNotFoundError(
            f"Model artifacts not found. Please run train.py first.\n"
            f"Missing file: {e.filename}"
        )
    except Exception as e:
        raise Exception(f"Error loading model artifacts: {str(e)}")


def validate_input(data):
    """
    Validate input data structure and required fields.
    
    Args:
        data: Dictionary containing input features
        
    Returns:
        dict: Validated and normalized input data
    """
    required_fields = ['year', 'month', 'season', 'state', 'crop_category', 'crop_name']
    
    # Check for required fields
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
    
    # Validate data types and ranges
    if not isinstance(data['year'], (int, float)) or data['year'] < 2020 or data['year'] > 2030:
        raise ValueError("year must be a number between 2020 and 2030")
    
    if not isinstance(data['month'], (int, float)) or data['month'] < 1 or data['month'] > 12:
        raise ValueError("month must be a number between 1 and 12")
    
    if not isinstance(data['season'], str):
        raise ValueError("season must be a string")
    
    if not isinstance(data['state'], str):
        raise ValueError("state must be a string")
    
    if not isinstance(data['crop_category'], str):
        raise ValueError("crop_category must be a string")
    
    if not isinstance(data['crop_name'], str):
        raise ValueError("crop_name must be a string")
    
    # Optional field: variety_name
    if 'variety_name' not in data:
        data['variety_name'] = 'Unknown'
    
    return data


def preprocess_input(data, preprocessor):
    """
    Preprocess input data using the fitted preprocessor.
    
    Args:
        data: Dictionary containing input features
        preprocessor: Fitted preprocessing pipeline
        
    Returns:
        np.ndarray: Preprocessed feature array
    """
    # Create DataFrame from input data
    df = pd.DataFrame([data])
    
    # Extract feature columns (same order as training)
    # Numerical features
    numerical_features = ['year', 'month']
    
    # Categorical features
    categorical_features = ['season', 'state', 'crop_category', 'crop_name', 'variety_name']
    
    # Select only the features used during training
    feature_cols = numerical_features + categorical_features
    available_cols = [col for col in feature_cols if col in df.columns]
    
    X = df[available_cols]
    
    # Transform using preprocessor
    X_processed = preprocessor.transform(X)
    
    return X_processed


def predict_price(data):
    """
    Predict crop price from input data.
    
    Args:
        data: Dictionary containing input features:
            - year (int): Year (2020-2030)
            - month (int): Month (1-12)
            - season (str): Season (e.g., 'Rabi', 'Kharif', 'Zaid')
            - state (str): State name
            - crop_category (str): Crop category (e.g., 'Vegetable', 'Fruit')
            - crop_name (str): Crop name
            - variety_name (str, optional): Variety name
    
    Returns:
        float: Predicted price per quintal
    """
    try:
        # Load model artifacts
        model, preprocessor, feature_names = load_artifacts()
        
        # Validate input
        validated_data = validate_input(data)
        
        # Preprocess input
        X_processed = preprocess_input(validated_data, preprocessor)
        
        # Make prediction
        prediction = model.predict(X_processed)[0]
        
        # Ensure prediction is positive
        prediction = max(0, prediction)
        
        return float(prediction)
    
    except Exception as e:
        raise Exception(f"Prediction error: {str(e)}")


def main():
    """
    Main function for command-line usage.
    Accepts JSON input from stdin or command-line argument.
    Handles Windows CMD quote escaping issues.
    """
    try:
        # Read input JSON
        if len(sys.argv) > 1:
            # Input from command-line argument
            # Join all arguments in case they were split (Windows CMD issue)
            input_str = ' '.join(sys.argv[1:])
            
            # Handle Windows CMD quote escaping
            # Remove outer quotes if present (Windows CMD adds them)
            if input_str.startswith('"') and input_str.endswith('"'):
                input_str = input_str[1:-1]
            elif input_str.startswith("'") and input_str.endswith("'"):
                input_str = input_str[1:-1]
            
            # Replace escaped quotes if any
            input_str = input_str.replace('\\"', '"').replace("\\'", "'")
            
            try:
                input_data = json.loads(input_str)
            except json.JSONDecodeError:
                # If parsing fails, try without any quote handling
                input_data = json.loads(sys.argv[1])
        else:
            # Input from stdin
            input_str = sys.stdin.read()
            if not input_str.strip():
                raise ValueError("No input provided. Please provide JSON data via stdin or command-line argument.")
            input_data = json.loads(input_str)
        
        # Make prediction
        predicted_price = predict_price(input_data)
        
        # Output result as JSON
        result = {
            'predicted_price': predicted_price,
            'unit': 'INR/quintal',
            'input': input_data
        }
        
        print(json.dumps(result, indent=2))
        
        return predicted_price
    
    except json.JSONDecodeError as e:
        error_msg = {
            'error': 'Invalid JSON input',
            'message': str(e),
            'hint': 'On Windows, try: python predict.py "{\\"year\\": 2024, \\"month\\": 6, ...}"'
        }
        print(json.dumps(error_msg, indent=2), file=sys.stderr)
        sys.exit(1)
    
    except Exception as e:
        print(json.dumps({
            'error': 'Prediction failed',
            'message': str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

