"""
Test script for predict.py
This script makes a test prediction to verify the model works correctly.
"""

import json
from predict import predict_price

def test_prediction():
    """Test the prediction function with sample data."""
    
    # Sample input data
    test_data = {
        'year': 2024,
        'month': 6,
        'season': 'Kharif',
        'state': 'Karnataka',
        'crop_category': 'Vegetable',
        'crop_name': 'Tomato',
        'variety_name': 'Tomato Var-001'
    }
    
    print("Testing crop price prediction...")
    print(f"Input data: {json.dumps(test_data, indent=2)}")
    print("\n" + "=" * 60)
    
    try:
        predicted_price = predict_price(test_data)
        
        print("\n" + "=" * 60)
        print("✅ Prediction successful!")
        print("=" * 60)
        print(f"Predicted Price: ₹{predicted_price:.2f} per quintal")
        print("=" * 60)
        
        return predicted_price
    
    except FileNotFoundError as e:
        print("\n❌ Error: Model files not found!")
        print(f"   {str(e)}")
        print("\nPlease run 'python train.py' first to train the model.")
        return None
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    test_prediction()











