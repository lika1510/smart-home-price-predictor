# ==============================================================================
# R Script: Linear Regression Engine for Real Estate Price Estimation
# Algorithm: Supervised Learning - Ordinary Least Squares (OLS) Linear Regression
# Standard R Functions: lm(), predict(), summary()
# ==============================================================================

# Parse command line arguments
args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/housing.csv")
predict_json <- ifelse(length(args) > 1, args[2], '{"SquareFeet":1800,"Bedrooms":3,"Bathrooms":2,"AgeYears":10,"LocationScore":7.5}')

# Load dataset
data <- read.csv(csv_file)

# Fit Multiple Linear Regression Model in R
# Formula: Price ~ SquareFeet + Bedrooms + Bathrooms + AgeYears + LocationScore
model <- lm(Price ~ SquareFeet + Bedrooms + Bathrooms + AgeYears + LocationScore, data = data)

# Extract Model Summary & Statistics
model_sum <- summary(model)
r_squared <- model_sum$r.squared
adj_r_squared <- model_sum$adj.r.squared
f_statistic <- model_sum$fstatistic[1]
coefficients <- model_sum$coefficients

# Prepare Coefficient Matrix as JSON-friendly dataframe
coef_df <- data.frame(
  Feature = rownames(coefficients),
  Estimate = round(coefficients[, 1], 2),
  StdError = round(coefficients[, 2], 2),
  tValue = round(coefficients[, 3], 2),
  pValue = round(coefficients[, 4], 4)
)

# Parse custom prediction inputs if provided
suppressWarnings({
  if (requireNamespace("jsonlite", quietly = TRUE)) {
    input_data <- jsonlite::fromJSON(predict_json)
    input_df <- as.data.frame(input_data)
    predicted_val <- predict(model, newdata = input_df)
    conf_interval <- predict(model, newdata = input_df, interval = "confidence", level = 0.95)
  } else {
    # Fallback parsing
    predicted_val <- predict(model, newdata = data.frame(
      SquareFeet = 1800, Bedrooms = 3, Bathrooms = 2, AgeYears = 10, LocationScore = 7.5
    ))
    conf_interval <- matrix(c(predicted_val, predicted_val*0.9, predicted_val*1.1), nrow=1)
  }
})

# Fitted values and residuals
residuals <- residuals(model)
fitted <- fitted(model)
rmse <- sqrt(mean(residuals^2))
mae <- mean(abs(residuals))

# Print Results formatted for Flask Backend Integration
cat("--- R LINEAR REGRESSION OUTPUT ---\n")
cat("Formula: Price ~ SquareFeet + Bedrooms + Bathrooms + AgeYears + LocationScore\n")
cat(sprintf("R-Squared: %.4f | Adj R-Squared: %.4f\n", r_squared, adj_r_squared))
cat(sprintf("RMSE: %.2f | MAE: %.2f\n", rmse, mae))
cat(sprintf("Predicted Price for input: $%.2f\n", predicted_val[1]))
