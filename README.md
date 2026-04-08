# Massive Predictor AI

Institutional-grade stock value prediction powered by Machine Learning. This project provides a full-stack, responsive web application that fetches historical stock data, visualizes it using interactive charts, predicts future prices, and aggregates the latest market news.

## Features

- **Real-Time Data Extraction**: Fetches historical stock data using external APIs (e.g., Massive API) with a robust simulated fallback mechanism.
- **Machine Learning Predictions**: Includes a robust regression model (`scikit-learn`, `pandas`, `numpy`) utilizing a Random Forest Regressor to project future price trends.
- **Market News Feed**: Aggregates the latest market news corresponding to the entered US stock ticker.
- **Glassmorphism UI**: Beautiful, premium Vanilla CSS UI with a modern design aesthetic.
- **Interactive Visualizations**: High-performance charting powered by **Chart.js** to show past data alongside predicted price paths.
- **FastAPI Backend**: Rapid, reliable, and easily extensible backend endpoints.

## How It Works

The application operates seamlessly by connecting a modern frontend directly to a powerful Python machine learning backend. Here is the step-by-step workflow of the application:

1. **User Input**: A user enters a stock ticker (e.g., "AAPL") into the frontend UI.
2. **API Request**: The frontend makes an asynchronous GET request to the `/api/predict/{ticker}` FastAPI endpoint.
3. **Data Acquisition**: 
   - The backend attempts to fetch historical data from the Massive API. 
   - *Resilience*: If the API is unreachable, times out, or triggers rate limits, the system automatically falls back to an internal mathematical simulation that generates realistic historical price data using volatility modeling to ensure the bot continues to work.
4. **Machine Learning Processing**:
   - The data is loaded into a Pandas DataFrame.
   - The backend engineers "lag features" (using the past 3 days of closing prices to predict the next sequence).
   - A Scikit-learn `RandomForestRegressor` model is trained dynamically on this historical context.
   - The trained model autoregressively predicts the closing prices for the next 14 days, injecting minor probabilistic noise derived from historical standard deviation to ensure realistic, non-linear variations.
5. **News Aggregation**: Synchronously, the backend fetches the newest market articles related to the supplied ticker.
6. **Data Presentation**: The aggregated response (historical data, predictions, and news) is sent back to the frontend, which dynamically maps the data cleanly onto a `Chart.js` graph, populates the news feed, and updates key metrics on the dashboard.

## Project Structure

```bash
📦 new prediction model
 ┣ 📂 backend
 ┃ ┣ 📜 main.py               # Main FastAPI application and API routes
 ┃ ┣ 📜 massive_client.py     # Integrations for historical stock data with fallback simulation
 ┃ ┣ 📜 ml_model.py           # Core ML predictive logic using RandomForestRegressor
 ┃ ┣ 📜 news_client.py        # Client for fetching ticker news
 ┃ ┗ 📜 requirements.txt      # Python backend dependencies
 ┣ 📂 frontend
 ┃ ┣ 📜 app.js                # Frontend Vanilla JS logic & API consumption
 ┃ ┣ 📜 index.html            # Main UI entry point
 ┃ ┗ 📜 styles.css            # Custom CSS using modern glassmorphism design paradigms
 ┣ 📂 venv                    # Python Virtual Environment (created during setup)
 ┗ 📜 README.md               # Project documentation
```

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- Optional: Virtual environment tool (e.g., `venv`)

## Installation & Setup

1. **Navigate to the Project Directory**
   Ensure you are in the root directory (`new prediction model`).

2. **Set Up a Virtual Environment (Recommended)**
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install Dependencies**
   Install the required Python packages defined in the backend requirements.
   ```bash
   pip install -r backend/requirements.txt
   ```

## Running the Application

1. **Start the FastAPI Server**
   Run the backend using `uvicorn`. The frontend is statically mounted to the backend, so both will be served from the below command.
   ```bash
   uvicorn backend.main:app --reload
   ```

2. **Access the Application**
   Open your preferred web browser and navigate to:
   [http://localhost:8000/](http://localhost:8000/)

## API Endpoints

- `GET /api/predict/{ticker}?days_history=60&days_predict=14`
  Fetches historical data, runs the local ML prediction model over the specified window, retrieves recent news, and returns a compiled JSON response spanning all data segments.

## Configuration

If an API key is required (e.g., for Massive endpoints), you might need to configure it within `backend/massive_client.py` and `backend/news_client.py` or set it via environment variables before launching the server:

```bash
export MASSIVE_API_KEY="your_api_key_here"
```

---
*Built with modern web standards and high-performance Python architectures.*
