import os
import requests
from typing import List, Dict, Any

API_TOKEN = os.environ.get("MARKETAUX_API_TOKEN", "gS3TJP3vdfIaAGWfFsJkueFMEhYWqX8Np59AU4Ab")
BASE_URL = "https://api.marketaux.com/v1"

def get_market_news(ticker: str) -> List[Dict[str, Any]]:
    """
    Fetches recent news related to the given ticker from MarketAux API.
    """
    endpoint = f"{BASE_URL}/news/all"
    params = {
        'symbols': ticker,
        'filter_entities': 'true',
        'language': 'en',
        'api_token': API_TOKEN
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Extract relevant fields
            articles = data.get('data', [])
            
            # Format the output for the frontend
            formatted_news = []
            for article in articles[:5]: # limit to top 5
                formatted_news.append({
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "url": article.get("url"),
                    "source": article.get("source"),
                    "published_at": article.get("published_at")
                })
            return formatted_news
        else:
            print(f"Error fetching MarketAux data: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Exception fetching MarketAux data: {e}")
        return []
