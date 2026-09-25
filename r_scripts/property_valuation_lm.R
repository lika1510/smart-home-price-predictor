# ==============================================================================
# R Script: Property Valuation Engine (Under the Hood)
# Algorithm: Supervised Learning - Linear Regression (lm)
# ==============================================================================

args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/properties_master.csv")

data <- read.csv(csv_file)

# Fit OLS Linear Regression in R
model <- lm(Price ~ SquareFeet + Bedrooms + Bathrooms + AgeYears + LocationScore, data = data)

model_sum <- summary(model)
r_squared <- model_sum$r.squared
adj_r_squared <- model_sum$adj.r.squared

cat(sprintf("R^2: %.4f, Adj R^2: %.4f\n", r_squared, adj_r_squared))
