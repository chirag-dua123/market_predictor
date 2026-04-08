from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.massive_client import get_historical_data
from backend.ml_model import predict_future_prices
from backend.news_client import get_market_news
import os

app = FastAPI(title="Stock Prediction Bot API")

class PredictionResponse(BaseModel):
    ticker: str
    historical: List[Dict[str, Any]]
    predictions: List[float]
    projected_dates: List[str]
    news: List[Dict[str, Any]]

@app.get("/api/predict/{ticker}", response_model=PredictionResponse)
def get_prediction(ticker: str, days_history: int = 60, days_predict: int = 14):
    """
    Fetches historical data from Massive API and runs a local prediction model.
    """
    ticker = ticker.upper()
    
    # 1. Fetch data
    data = get_historical_data(ticker, days=days_history)
    if not data or 'history' not in data:
        raise HTTPException(status_code=404, detail="Could not fetch data for this ticker.")
        
    history = data['history']
    
    # 2. Predict Future
    future_prices = predict_future_prices(history, days_to_predict=days_predict)
    
    # Generate projected dates
    from datetime import datetime, timedelta
    last_date_str = history[-1]['date']
    last_date = datetime.strptime(last_date_str, '%Y-%m-%d')
    projected_dates = [(last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(days_predict)]
    
    # 3. Fetch News
    news = get_market_news(ticker)
    
    return PredictionResponse(
        ticker=ticker,
        historical=history,
        predictions=future_prices,
        projected_dates=projected_dates,
        news=news
    )

# Mount the static frontend files
# This needs to be done AFTER the API routes to avoid path conflicts
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"Warning: Frontend directory not found at {frontend_path}")
