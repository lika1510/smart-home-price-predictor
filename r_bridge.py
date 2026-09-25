import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "static", "data")
MASTER_CSV = os.path.join(DATA_DIR, "properties_master.csv")

def load_master_data():
    return pd.read_csv(MASTER_CSV)

# ==============================================================================
# UNIFIED INTELLIGENCE ENGINE (4 ALGORITHMS WORKING BEHIND THE SCENES - INR CURRENCY)
# ==============================================================================

class PropertyIntelligenceEngine:
    def __init__(self):
        self.reload_models()

    def reload_models(self):
        self.df = load_master_data()
        
        # 1. Linear Regression Model (Valuation Engine)
        self.lin_features = ["SquareFeet", "Bedrooms", "Bathrooms", "AgeYears", "LocationScore"]
        X_lin = self.df[self.lin_features]
        # Scale prices to INR standard (e.g., multiplying baseline values to INR scale: 1 USD ~ 80 INR scale or INR representation)
        y_lin = self.df["Price"] * 80
        self.lin_model = LinearRegression()
        self.lin_model.fit(X_lin, y_lin)

        # 2. Logistic Regression Model (Deal Approval & Risk Engine)
        self.log_features = ["LocationScore", "CrimeRate", "SchoolRating", "CapRate", "AgeYears"]
        X_log = self.df[self.log_features]
        y_log = self.df["DealApproved"]
        self.log_model = LogisticRegression(max_iter=1000)
        self.log_model.fit(X_log, y_log)

        # 3. K-Means Model (Market Tier & Clustering Engine)
        self.km_features = ["Price", "LocationScore", "CapRate", "WalkScore"]
        X_km = self.df[self.km_features]
        self.km_scaler = StandardScaler()
        X_km_scaled = self.km_scaler.fit_transform(X_km)
        self.km_model = KMeans(n_clusters=4, random_state=42, n_init=25)
        self.km_model.fit(X_km_scaled)

        # Map cluster IDs to human-readable investment market tiers
        self.tier_names = {
            0: "Stable Cashflow Generator",
            1: "High Growth Luxury Tier",
            2: "Moderate Urban Growth",
            3: "Value-Add Opportunity"
        }

        # 4. PCA Model (Neighborhood Growth & Volatility Factor Index)
        self.pca_features = ["LocationScore", "CrimeRate", "SchoolRating", "WalkScore", "CapRate"]
        X_pca = self.df[self.pca_features]
        self.pca_scaler = StandardScaler()
        X_pca_scaled = self.pca_scaler.fit_transform(X_pca)
        self.pca_model = PCA(n_components=2)
        self.pca_scores = self.pca_model.fit_transform(X_pca_scaled)

    def evaluate_property(self, prop_data):
        """
        Evaluate a property using all 4 algorithms behind the scenes with INR currency (₹).
        """
        sqft = float(prop_data.get("SquareFeet", 1800))
        beds = float(prop_data.get("Bedrooms", 3))
        baths = float(prop_data.get("Bathrooms", 2.0))
        age = float(prop_data.get("AgeYears", 10))
        loc = float(prop_data.get("LocationScore", 7.5))
        crime = float(prop_data.get("CrimeRate", 2.2))
        school = float(prop_data.get("SchoolRating", 8.0))
        walk = float(prop_data.get("WalkScore", 75))
        cap = float(prop_data.get("CapRate", 7.2))

        # -------------------------------------------------------------
        # ALGO 1: Linear Regression (Property Valuation in INR ₹)
        # -------------------------------------------------------------
        X_val = np.array([[sqft, beds, baths, age, loc]])
        estimated_price_inr = float(self.lin_model.predict(X_val)[0])
        price_per_sqft = estimated_price_inr / sqft
        conf_low = estimated_price_inr * 0.94
        conf_high = estimated_price_inr * 1.06

        # -------------------------------------------------------------
        # ALGO 2: Logistic Regression (Investment Risk & Approval)
        # -------------------------------------------------------------
        X_risk = np.array([[loc, crime, school, cap, age]])
        approval_prob = float(self.log_model.predict_proba(X_risk)[0][1]) * 100
        
        if approval_prob >= 75:
            recommendation = "STRONG BUY"
            risk_rating = "LOW RISK"
            badge_color = "success"
        elif approval_prob >= 45:
            recommendation = "MODERATE HOLD / NEGOTIATE"
            risk_rating = "MEDIUM RISK"
            badge_color = "warning"
        else:
            recommendation = "AVOID / REJECT DEAL"
            risk_rating = "HIGH RISK"
            badge_color = "danger"

        # -------------------------------------------------------------
        # ALGO 3: K-Means Clustering (Market Segment Assignment)
        # -------------------------------------------------------------
        raw_price_usd = estimated_price_inr / 80
        X_tier = np.array([[raw_price_usd, loc, cap, walk]])
        X_tier_scaled = self.km_scaler.transform(X_tier)
        cluster_id = int(self.km_model.predict(X_tier_scaled)[0])
        market_tier = self.tier_names.get(cluster_id, "Standard Residential")

        # -------------------------------------------------------------
        # ALGO 4: PCA (Composite Growth & Volatility Indices)
        # -------------------------------------------------------------
        X_pca_in = np.array([[loc, crime, school, walk, cap]])
        X_pca_in_scaled = self.pca_scaler.transform(X_pca_in)
        pca_coords = self.pca_model.transform(X_pca_in_scaled)[0]
        
        neighborhood_growth_index = min(99, max(10, float(50 + pca_coords[0] * 20)))
        market_volatility_index = min(99, max(10, float(50 - pca_coords[1] * 20)))

        # Annual cash flow projection in INR (₹)
        annual_gross_rent = estimated_price_inr * (cap / 100)
        monthly_rent = annual_gross_rent / 12

        return {
            "estimated_price": round(estimated_price_inr, 2),
            "price_per_sqft": round(price_per_sqft, 2),
            "conf_low": round(conf_low, 2),
            "conf_high": round(conf_high, 2),
            "approval_prob": round(approval_prob, 1),
            "recommendation": recommendation,
            "risk_rating": risk_rating,
            "badge_color": badge_color,
            "market_tier": market_tier,
            "neighborhood_growth_index": round(neighborhood_growth_index, 1),
            "market_volatility_index": round(market_volatility_index, 1),
            "annual_gross_rent": round(annual_gross_rent, 2),
            "monthly_rent": round(monthly_rent, 2),
            "input_summary": {
                "SquareFeet": sqft,
                "Bedrooms": beds,
                "Bathrooms": baths,
                "AgeYears": age,
                "LocationScore": loc,
                "CrimeRate": crime,
                "SchoolRating": school,
                "WalkScore": walk,
                "CapRate": cap
            }
        }

    def get_portfolio_overview(self):
        """
        Get portfolio statistics across all properties in INR (₹).
        """
        results = []
        for idx, row in self.df.iterrows():
            eval_res = self.evaluate_property(row.to_dict())
            results.append({
                "PropertyID": row["PropertyID"],
                "Address": row["Address"],
                "SquareFeet": row["SquareFeet"],
                "ActualPrice": row["Price"] * 80,
                "EstimatedPrice": eval_res["estimated_price"],
                "CapRate": row["CapRate"],
                "ApprovalProb": eval_res["approval_prob"],
                "Recommendation": eval_res["recommendation"],
                "BadgeColor": eval_res["badge_color"],
                "MarketTier": eval_res["market_tier"],
                "GrowthIndex": eval_res["neighborhood_growth_index"],
                "VolatilityIndex": eval_res["market_volatility_index"]
            })
        return results

engine = PropertyIntelligenceEngine()
