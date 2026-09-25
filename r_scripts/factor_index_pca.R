# ==============================================================================
# R Script: Neighborhood & Macro Risk Index Engine (Under the Hood)
# Algorithm: Unsupervised Learning - Principal Component Analysis (prcomp)
# ==============================================================================

args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/properties_master.csv")

data <- read.csv(csv_file)
features <- data[, c("LocationScore", "CrimeRate", "SchoolRating", "WalkScore", "CapRate")]

pca <- prcomp(features, center = TRUE, scale. = TRUE)
var_explained <- (pca$sdev^2) / sum(pca$sdev^2)

cat(sprintf("PC1 Var: %.2f%%, PC2 Var: %.2f%%\n", var_explained[1]*100, var_explained[2]*100))
