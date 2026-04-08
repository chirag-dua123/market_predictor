import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from typing import List, Dict, Any

def predict_future_prices(historical_data: List[Dict[str, Any]], days_to_predict: int = 7) -> List[float]:
    """
    Given an array of historical daily data [{'date': '...', 'close': float}], 
    predicts the closing price for the next `days_to_predict` days.
    """
    if not historical_data or len(historical_data) < 10:
        # Not enough data, return a flat line or error fallback
        last_price = historical_data[-1]['close'] if historical_data else 100.0
        return [last_price] * days_to_predict
        
    df = pd.DataFrame(historical_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    
    # Feature engineering: create lag features
    # Let's use the last 3 days to predict the next day
    df['lag_1'] = df['close'].shift(1)
    df['lag_2'] = df['close'].shift(2)
    df['lag_3'] = df['close'].shift(3)
    
    # Drop NA
    train_df = df.dropna().copy()
    
    X = train_df[['lag_1', 'lag_2', 'lag_3']].values
    y = train_df['close'].values
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Autoregressive Prediction
    predictions = []
    # get the latest 3 days
    current_lags = [
        df['close'].iloc[-1],
        df['close'].iloc[-2],
        df['close'].iloc[-3]
    ]
    
    for _ in range(days_to_predict):
        # Predict the next day
        X_pred = np.array([current_lags])
        next_pred = model.predict(X_pred)[0]
        
        # Add a tiny bit of noise based on historical std to make it look realistic 
        # (RandomForest can generate repeated values for extrapolated time-series)
        noise = np.random.normal(0, df['close'].std() * 0.02)
        next_pred += noise
        
        predictions.append(round(next_pred, 2))
        
        # Shift lags for next prediction
        current_lags = [next_pred, current_lags[0], current_lags[1]]
        
    return predictions
