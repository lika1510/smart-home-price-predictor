# ==============================================================================
# R Script: Investment Deal Approval & Risk Diagnostic Engine (Under the Hood)
# Algorithm: Supervised Learning - Logistic Regression (glm)
# ==============================================================================

args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/properties_master.csv")

data <- read.csv(csv_file)

# Fit Binomial Logistic Regression in R
model <- glm(DealApproved ~ LocationScore + CrimeRate + SchoolRating + CapRate + AgeYears, 
             family = binomial(link = "logit"), 
             data = data)

model_sum <- summary(model)
cat(sprintf("AIC: %.2f, Deviance: %.2f\n", model_sum$aic, model_sum$deviance))
