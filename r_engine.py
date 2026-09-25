import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Load dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "static", "data", "housing.csv")

def run_all_4_algorithms(inputs):
    """
    Runs all 4 Machine Learning Algorithms (2 Supervised + 2 Unsupervised)
    on the user's property inputs.
    """
    df = pd.read_csv(DATA_PATH)

    # Input parameters
    sqft = float(inputs.get("sqft", 1800))
    beds = float(inputs.get("beds", 3))
    age = float(inputs.get("age", 10))
    loc = float(inputs.get("loc", 7.5))
    crime = float(inputs.get("crime", 2.2))
    cap = float(inputs.get("cap", 7.2))

    # Apply optional renovation upgrade boost
    if inputs.get("renovated", False):
        loc = min(10.0, loc + 1.0)

    # -------------------------------------------------------------
    # 1. Supervised Algo 1: Linear Regression (lm) -> Price Valuation
    # -------------------------------------------------------------
    X_lin = df[["SquareFeet", "Bedrooms", "AgeYears", "LocationScore"]]
    y_lin = df["Price"]
    lin_model = LinearRegression().fit(X_lin, y_lin)
    
    predicted_price = float(lin_model.predict([[sqft, beds, age, loc]])[0])
    price_per_sqft = round(predicted_price / sqft, 2)
    conf_low = round(predicted_price * 0.94, 2)
    conf_high = round(predicted_price * 1.06, 2)

    # -------------------------------------------------------------
    # 2. Supervised Algo 2: Logistic Regression (glm) -> Deal Approval
    # -------------------------------------------------------------
    X_log = df[["LocationScore", "CrimeRate", "CapRate"]]
    y_log = df["Approved"]
    log_model = LogisticRegression().fit(X_log, y_log)

    approval_prob = round(float(log_model.predict_proba([[loc, crime, cap]])[0][1]) * 100, 1)
    is_approved = approval_prob >= 50
    risk_status = "APPROVED (LOW RISK)" if is_approved else "REJECTED (HIGH RISK)"

    # -------------------------------------------------------------
    # 3. Unsupervised Algo 1: K-Means Clustering -> Property Category
    # -------------------------------------------------------------
    X_km = df[["Price", "LocationScore", "CapRate"]]
    km_scaler = StandardScaler()
    X_km_scaled = km_scaler.fit_transform(X_km)
    km_model = KMeans(n_clusters=3, random_state=42, n_init=10).fit(X_km_scaled)

    user_km_scaled = km_scaler.transform([[predicted_price, loc, cap]])
    cluster_id = int(km_model.predict(user_km_scaled)[0])
    categories = {0: "Budget Fixer Plot", 1: "Suburban Family Home", 2: "High-Growth Luxury Villa"}
    property_category = categories.get(cluster_id, "Standard Residential")

    # -------------------------------------------------------------
    # 4. Unsupervised Algo 2: PCA -> Neighborhood Quality Score
    # -------------------------------------------------------------
    X_pca = df[["LocationScore", "CrimeRate", "CapRate"]]
    pca_scaler = StandardScaler()
    X_pca_scaled = pca_scaler.fit_transform(X_pca)
    pca_model = PCA(n_components=1).fit(X_pca_scaled)

    user_pca_score = float(pca_model.transform(pca_scaler.transform([[loc, crime, cap]]))[0][0])
    neighborhood_quality = round(min(99, max(10, 50 + user_pca_score * 25)), 1)

    # Rental Yield Calculations
    annual_rent = round(predicted_price * (cap / 100), 2)
    monthly_rent = round(annual_rent / 12, 2)

    return {
        "price": round(predicted_price, 2),
        "price_per_sqft": price_per_sqft,
        "conf_low": conf_low,
        "conf_high": conf_high,
        "approval_prob": approval_prob,
        "risk_status": risk_status,
        "is_approved": is_approved,
        "property_category": property_category,
        "neighborhood_quality": neighborhood_quality,
        "annual_rent": annual_rent,
        "monthly_rent": monthly_rent,
        "inputs": {"sqft": sqft, "beds": beds, "age": age, "loc": loc, "crime": crime, "cap": cap}
    }
