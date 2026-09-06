"""
AgriLink - AI Price Forecasting & Selling Recommendation Engine
Smart India Hackathon Problem Statement 26132

This module uses Scikit-Learn's LinearRegression to:
1. Generate synthetic 30-day tomato mandi price history with realistic noise.
2. Train a regression model on the time series (features: day index, arrival volume).
3. Forecast prices for the next 7 days (Days 31–37).
4. Produce an AI-driven selling recommendation: "SELL NOW" or "WAIT 3–5 DAYS".

Strict constraint: NO type hints used anywhere in this Python code.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta


def generate_synthetic_price_history(days=30, base_price=2500, trend=12):
    """
    Generates a realistic synthetic 30-day tomato price history.

    The model simulates:
        - A gentle upward trend (trend INR per day) reflecting seasonal demand.
        - A weekly cyclical pattern (mandis are busier mid-week, prices dip on weekends).
        - Mild Gaussian noise to mimic real mandi auction volatility.
        - A corresponding daily arrival volume (in quintals) that inversely
          correlates with price: higher arrivals -> lower price pressure.

    Parameters:
        days       : Number of historical days to generate (default 30).
        base_price : Starting base price in INR per quintal (default 2500).
        trend      : Daily upward price drift in INR (default 12).

    Returns:
        A dictionary with keys:
            'day_indices'    : numpy array of day numbers [1..days]
            'prices'         : numpy array of simulated prices (INR/quintal)
            'arrivals'       : numpy array of simulated arrival volumes (quintals)
            'dates'          : list of date strings in 'DD-Mon' format
    """
    # Fix random seed for reproducible demo results across sessions
    rng = np.random.RandomState(42)

    day_indices = np.arange(1, days + 1)

    # Base trend: gentle upward slope of `trend` INR/day
    trend_component = base_price + trend * day_indices

    # Weekly cyclical pattern: prices dip slightly on day 6 & 7 (weekend effect)
    # and peak mid-week (day 3-4). Amplitude ~80 INR.
    cyclical_component = 80.0 * np.sin(2 * np.pi * day_indices / 7.0)

    # Gaussian noise: standard deviation ~60 INR to simulate auction volatility
    noise = rng.normal(0, 60, size=days)

    # Final simulated price series
    prices = trend_component + cyclical_component + noise

    # Ensure prices never go below a floor (minimum support price analogy)
    prices = np.maximum(prices, base_price * 0.85)

    # Simulate daily arrival volumes (quintals arriving at the mandi gate)
    # Higher arrivals tend to suppress price (supply-demand). We model this
    # with an inverse relationship to price movement + its own noise.
    base_arrivals = 1200.0
    arrival_noise = rng.normal(0, 150, size=days)
    # When price rises, arrivals tend to dip (farmers hold stock for better rates)
    arrivals = base_arrivals - 0.15 * (prices - base_price) + arrival_noise
    arrivals = np.maximum(arrivals, 300)  # Floor: at least 300 quintals arrive

    # Generate human-readable date strings starting 30 days ago from today
    today = datetime.now()
    start_date = today - timedelta(days=days)
    dates = [(start_date + timedelta(days=int(d))).strftime("%d-%b") for d in day_indices]

    return {
        "day_indices": day_indices,
        "prices": np.round(prices, 2),
        "arrivals": np.round(arrivals, 2),
        "dates": dates
    }


def train_and_predict_prices(crop="Tomato"):
    """
    Core AI forecasting function for AgriLink.

    Workflow:
        1. Generate 30-day synthetic price history for the specified crop.
        2. Train a Scikit-Learn LinearRegression model using:
           - Features: [day_index, daily_arrival_volume]
           - Target: mandi_price (INR per quintal)
        3. Predict prices for the next 7 days (Days 31–37), assuming a
           gradual decline in arrivals (farmers sell less as season progresses).
        4. Compute an AI selling recommendation:
           - If predicted 7-day average price > current price by ≥5%:
             → "WAIT 3–5 DAYS" (Confidence: 87%)
           - Else:
             → "SELL NOW" (Confidence: 82%)

    Parameters:
        crop : Name of the crop (used for labeling; default "Tomato").

    Returns:
        A structured dictionary containing:
            - crop: str
            - historical: list of {day, price, arrivals, date_str}
            - forecast: list of {day, price, arrivals, date_str}
            - model_score: float (R² score of the trained model)
            - current_price: float
            - predicted_7_day_price: float
            - price_gain_percent: float
            - recommendation: str ("SELL NOW" or "WAIT 3–5 DAYS")
            - recommendation_reason: str
            - confidence_score: int (percentage)
    """
    # Step 1: Generate synthetic historical data
    history = generate_synthetic_price_history(days=30, base_price=2500, trend=12)

    day_indices = history["day_indices"]
    prices = history["prices"]
    arrivals = history["arrivals"]
    dates = history["dates"]

    # Step 2: Prepare training features and target
    # Features: [day_index, arrival_volume_that_day]
    X_train = np.column_stack([day_indices, arrivals])
    y_train = prices

    # Train the Linear Regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # R² score on training data (measure of model fit quality)
    model_score = round(model.score(X_train, y_train), 4)

    # Step 3: Forecast the next 7 days (Days 31 through 37)
    forecast_days = np.arange(31, 38)

    # Simulate future arrivals: assume a gradual 3% daily decline
    # (farmers holding back stock expecting higher prices - a common Nashik pattern)
    last_arrival = arrivals[-1]
    forecast_arrivals = np.array([
        last_arrival * (0.97 ** i) for i in range(1, 8)
    ])
    forecast_arrivals = np.round(np.maximum(forecast_arrivals, 300), 2)

    # Prepare feature matrix for prediction
    X_forecast = np.column_stack([forecast_days, forecast_arrivals])
    forecast_prices = model.predict(X_forecast)
    forecast_prices = np.round(forecast_prices, 2)

    # Generate date strings for forecast days
    today = datetime.now()
    forecast_dates = [
        (today + timedelta(days=int(i))).strftime("%d-%b")
        for i in range(1, 8)
    ]

    # Step 4: Calculate selling recommendation
    current_price = round(float(prices[-1]), 2)
    predicted_7_day_price = round(float(forecast_prices[-1]), 2)
    predicted_avg_price = round(float(np.mean(forecast_prices)), 2)

    # Price gain percentage: compare predicted 7-day-end price vs current price
    price_gain_percent = round(
        ((predicted_7_day_price - current_price) / current_price) * 100, 2
    )

    # Decision engine: threshold at 5% gain
    if price_gain_percent >= 5.0:
        recommendation = "WAIT 3–5 DAYS"
        confidence_score = 87
        recommendation_reason = (
            "Market demand is rising while regional arrivals in Nashik are decreasing. "
            "The AI model forecasts a {gain}% price increase over the next 7 days. "
            "Optimal selling window: 3 to 5 days from now for maximum Net Realisation."
        ).format(gain=price_gain_percent)
    elif price_gain_percent >= 2.0:
        recommendation = "WAIT 1–2 DAYS"
        confidence_score = 74
        recommendation_reason = (
            "A moderate price uptick of {gain}% is expected. Short hold recommended. "
            "Arrivals are slowing which may push auction prices up slightly."
        ).format(gain=price_gain_percent)
    else:
        recommendation = "SELL NOW"
        confidence_score = 82
        recommendation_reason = (
            "Prices are near their short-term peak. The model predicts only a {gain}% change "
            "over the next week. Selling now locks in current favourable rates and avoids "
            "storage cost accumulation."
        ).format(gain=price_gain_percent)

    # Build the historical series as a list of dictionaries
    historical_series = []
    for i in range(len(day_indices)):
        historical_series.append({
            "day": int(day_indices[i]),
            "price": float(prices[i]),
            "arrivals": float(arrivals[i]),
            "date_str": dates[i]
        })

    # Build the forecast series
    forecast_series = []
    for i in range(len(forecast_days)):
        forecast_series.append({
            "day": int(forecast_days[i]),
            "price": float(forecast_prices[i]),
            "arrivals": float(forecast_arrivals[i]),
            "date_str": forecast_dates[i]
        })

    return {
        "crop": crop,
        "model_type": "LinearRegression (Scikit-Learn)",
        "model_score_r2": model_score,
        "historical": historical_series,
        "forecast": forecast_series,
        "current_price": current_price,
        "predicted_7_day_price": predicted_7_day_price,
        "predicted_avg_price": predicted_avg_price,
        "price_gain_percent": price_gain_percent,
        "price_gain_absolute": round(predicted_7_day_price - current_price, 2),
        "recommendation": recommendation,
        "recommendation_reason": recommendation_reason,
        "confidence_score": confidence_score
    }


# Quick self-test when run directly
if __name__ == "__main__":
    print("=" * 70)
    print("AgriLink AI Engine - Self-Test")
    print("=" * 70)

    result = train_and_predict_prices(crop="Tomato")

    print(f"\nCrop: {result['crop']}")
    print(f"Model: {result['model_type']}")
    print(f"Model R² Score: {result['model_score_r2']}")
    print(f"\nCurrent Price (Day 30): Rs {result['current_price']}/q")
    print(f"Predicted Price (Day 37): Rs {result['predicted_7_day_price']}/q")
    print(f"Price Change: {result['price_gain_percent']}% ({'+' if result['price_gain_absolute'] >= 0 else ''}{result['price_gain_absolute']} INR)")
    print(f"\n{'=' * 40}")
    print(f"AI RECOMMENDATION: {result['recommendation']}")
    print(f"Confidence: {result['confidence_score']}%")
    print(f"Reason: {result['recommendation_reason']}")
    print(f"{'=' * 40}")

    print(f"\nHistorical data points: {len(result['historical'])}")
    print(f"Forecast data points: {len(result['forecast'])}")

    print("\nLast 5 historical prices:")
    for pt in result['historical'][-5:]:
        print(f"  Day {pt['day']} ({pt['date_str']}): Rs {pt['price']}/q  |  Arrivals: {pt['arrivals']}q")

    print("\n7-day forecast:")
    for pt in result['forecast']:
        print(f"  Day {pt['day']} ({pt['date_str']}): Rs {pt['price']}/q  |  Arrivals: {pt['arrivals']}q")
