# ==============================================================================
# R Script: Logistic Regression Engine for Customer Churn Prediction
# Algorithm: Supervised Learning - Generalized Linear Model (Binomial Logistic Regression)
# Standard R Functions: glm(family = binomial), predict(type = "response")
# ==============================================================================

# Parse command line arguments
args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/customer_churn.csv")

# Load dataset
data <- read.csv(csv_file)

# Fit Logistic Regression Model in R
# Formula: Churn ~ TenureMonths + MonthlyCharges + SupportTickets + ContractType
model <- glm(Churn ~ TenureMonths + MonthlyCharges + SupportTickets + ContractType, 
             family = binomial(link = "logit"), 
             data = data)

# Extract Model Summary & Statistics
model_sum <- summary(model)
coefficients <- model_sum$coefficients
odds_ratios <- exp(coef(model)) # Odds ratios e^(beta)

# Calculate Predictions and Probabilities
probabilities <- predict(model, type = "response")
predictions <- ifelse(probabilities > 0.5, 1, 0)

# Confusion Matrix
conf_matrix <- table(Actual = data$Churn, Predicted = predictions)
accuracy <- sum(diag(conf_matrix)) / sum(conf_matrix)

# Print Summary for Backend Integration
cat("--- R LOGISTIC REGRESSION OUTPUT ---\n")
cat("Formula: Churn ~ TenureMonths + MonthlyCharges + SupportTickets + ContractType\n")
cat(sprintf("Model AIC: %.2f | Deviance: %.2f\n", model_sum$aic, model_sum$deviance))
cat(sprintf("Classification Accuracy: %.2f%%\n", accuracy * 100))
cat("Odds Ratios (Impact Factors):\n")
print(odds_ratios)
