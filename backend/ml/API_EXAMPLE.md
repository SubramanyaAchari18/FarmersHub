# Backend API Integration Example

This document provides examples for integrating the ML prediction model with your backend API.

## Node.js Express Integration

The price prediction route has been added to `backend/routes/pricePredictions.js`. 

### Endpoint

**POST** `/api/price-predictions/predict`

### Request Body

```json
{
  "year": 2024,
  "month": 6,
  "season": "Kharif",
  "state": "Karnataka",
  "crop_category": "Vegetable",
  "crop_name": "Tomato",
  "variety_name": "Tomato Var-001"  
}
```

### Success Response

```json
{
  "success": true,
  "predictedPrice": 1750.50,
  "unit": "INR/quintal",
  "input": {
    "year": 2024,
    "month": 6,
    "season": "Kharif",
    "state": "Karnataka",
    "crop_category": "Vegetable",
    "crop_name": "Tomato",
    "variety_name": "Tomato Var-001"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["year", "month", "season", "state", "crop_category", "crop_name"]
}
```

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:4000/api/price-predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "month": 6,
    "season": "Kharif",
    "state": "Karnataka",
    "crop_category": "Vegetable",
    "crop_name": "Tomato"
  }'
```

### JavaScript/TypeScript (Fetch API)

```javascript
const response = await fetch('http://localhost:4000/api/price-predictions/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    year: 2024,
    month: 6,
    season: 'Kharif',
    state: 'Karnataka',
    crop_category: 'Vegetable',
    crop_name: 'Tomato',
    variety_name: 'Tomato Var-001'
  })
});

const result = await response.json();
console.log('Predicted Price:', result.predictedPrice);
```

### React Example

```jsx
import { useState } from 'react';

function PricePredictionForm() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: 2024,
    month: 6,
    season: 'Kharif',
    state: 'Karnataka',
    crop_category: 'Vegetable',
    crop_name: 'Tomato'
  });

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/price-predictions/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPrediction(result);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to get prediction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePredict}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Price'}
      </button>
      
      {prediction && (
        <div>
          <h3>Predicted Price: ₹{prediction.predictedPrice.toFixed(2)} per quintal</h3>
        </div>
      )}
    </form>
  );
}
```

## Error Handling

The API handles various error scenarios:

1. **Missing Required Fields**: Returns 400 with list of required fields
2. **Invalid Data Types**: Returns 400 with validation error
3. **Python Script Errors**: Returns 500 with error details
4. **Model Not Found**: Returns 500 if model artifacts are missing (run `train.py` first)

## Prerequisites

1. Python 3.8+ installed and accessible via `python` or `python3` command
2. Python dependencies installed: `pip install -r backend/ml/requirements.txt`
3. Model trained: Run `python backend/ml/train.py` to generate model artifacts
4. Node.js backend running with the updated route

## Notes

- The API automatically detects whether to use `python` or `python3` command
- Predictions are returned in INR/quintal (as per the training data)
- The API validates all input before calling the Python script
- Error messages are user-friendly and include helpful details











