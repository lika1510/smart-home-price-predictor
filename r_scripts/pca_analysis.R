# ==============================================================================
# R Script: PCA Engine for Multi-Metric Financial Asset Diagnostics
# Algorithm: Unsupervised Learning - Principal Component Analysis
# Standard R Functions: prcomp(center = TRUE, scale. = TRUE), summary()
# ==============================================================================

args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/financial_indicators.csv")

# Load dataset
data <- read.csv(csv_file)
# Exclude non-numeric identifier
numeric_data <- data[, setdiff(names(data), c("AssetID"))]

# Execute Principal Component Analysis in R
pca_result <- prcomp(numeric_data, center = TRUE, scale. = TRUE)

# Calculate Variance Explained
std_devs <- pca_result$sdev
var_explained <- std_devs^2 / sum(std_devs^2)
cum_var <- cumsum(var_explained)

# Component Loadings (Eigenvectors)
loadings <- pca_result$rotation

# Principal Component Scores
scores <- pca_result$x

cat("--- R PCA ANALYSIS OUTPUT ---\n")
cat("Proportion of Variance Explained by Principal Components:\n")
for (i in 1:length(var_explained)) {
  cat(sprintf("PC%d: %.2f%% (Cumulative: %.2f%%)\n", i, var_explained[i] * 100, cum_var[i] * 100))
}
cat("\nVariable Loadings on PC1 and PC2:\n")
print(round(loadings[, 1:2], 4))
