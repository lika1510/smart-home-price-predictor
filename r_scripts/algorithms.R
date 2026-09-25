# ==============================================================================
# Simple R Script: 4 Machine Learning Algorithms Engine
# ==============================================================================

data <- read.csv("../static/data/housing.csv")

# 1. Supervised Algo 1: Linear Regression (Property Valuation)
lm_model <- lm(Price ~ SquareFeet + Bedrooms + AgeYears + LocationScore, data = data)
print(summary(lm_model))

# 2. Supervised Algo 2: Logistic Regression (Deal Risk Approval)
glm_model <- glm(Approved ~ LocationScore + CrimeRate + CapRate, family = binomial, data = data)
print(summary(glm_model))

# 3. Unsupervised Algo 1: K-Means Clustering (Property Tiering)
features_km <- scale(data[, c("Price", "LocationScore", "CapRate")])
set.seed(42)
km_model <- kmeans(features_km, centers = 3, nstart = 20)
print(km_model$centers)

# 4. Unsupervised Algo 2: PCA Analysis (Neighborhood Quality Index)
features_pca <- data[, c("LocationScore", "CrimeRate", "CapRate")]
pca_model <- prcomp(features_pca, center = TRUE, scale. = TRUE)
print(summary(pca_model))
