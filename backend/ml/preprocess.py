"""
Preprocessing Utilities Module
===============================
Helper functions for data preprocessing that can be reused across scripts.
"""

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def create_preprocessor(numerical_features, categorical_features):
    """
    Create a preprocessing pipeline for the given features.
    
    Args:
        numerical_features: List of numerical feature names
        categorical_features: List of categorical feature names
        
    Returns:
        ColumnTransformer: Configured preprocessing pipeline
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(
                drop='first',
                sparse_output=False,
                handle_unknown='ignore'
            ), categorical_features)
        ],
        remainder='drop'
    )
    
    return preprocessor


def handle_missing_values(df, numerical_cols=None, categorical_cols=None):
    """
    Handle missing values in the dataset.
    
    Args:
        df: DataFrame to process
        numerical_cols: List of numerical column names (auto-detected if None)
        categorical_cols: List of categorical column names (auto-detected if None)
        
    Returns:
        pd.DataFrame: DataFrame with missing values filled
    """
    df_processed = df.copy()
    
    # Auto-detect column types if not provided
    if numerical_cols is None:
        numerical_cols = df_processed.select_dtypes(include=[np.number]).columns.tolist()
    
    if categorical_cols is None:
        categorical_cols = df_processed.select_dtypes(include=['object']).columns.tolist()
    
    # Fill numerical columns with median
    for col in numerical_cols:
        if col in df_processed.columns and df_processed[col].isnull().sum() > 0:
            median_val = df_processed[col].median()
            df_processed[col].fillna(median_val, inplace=True)
    
    # Fill categorical columns with mode
    for col in categorical_cols:
        if col in df_processed.columns and df_processed[col].isnull().sum() > 0:
            mode_val = df_processed[col].mode()[0] if not df_processed[col].mode().empty else 'Unknown'
            df_processed[col].fillna(mode_val, inplace=True)
    
    return df_processed


def get_feature_names(preprocessor, numerical_features, categorical_features):
    """
    Get feature names after preprocessing.
    
    Args:
        preprocessor: Fitted ColumnTransformer
        numerical_features: List of numerical feature names
        categorical_features: List of categorical feature names
        
    Returns:
        list: List of feature names after preprocessing
    """
    feature_names = []
    
    # Add numerical feature names
    feature_names.extend(numerical_features)
    
    # Add categorical feature names (from OneHotEncoder)
    cat_encoder = preprocessor.named_transformers_['cat']
    for i, col in enumerate(categorical_features):
        categories = cat_encoder.categories_[i]
        for cat in categories[1:]:  # Skip first category (drop='first')
            feature_names.append(f"{col}_{cat}")
    
    return feature_names











