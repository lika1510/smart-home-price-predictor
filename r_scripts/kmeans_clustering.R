# ==============================================================================
# R Script: K-Means Clustering Engine for Customer Segmentation
# Algorithm: Unsupervised Learning - K-Means Clustering
# Standard R Functions: kmeans(), scale()
# ==============================================================================

args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/mall_customers.csv")
k_clusters <- ifelse(length(args) > 1, as.integer(args[2]), 4)

# Load dataset
data <- read.csv(csv_file)
features <- data[, c("Age", "AnnualIncome", "SpendingScore", "VisitFrequency")]

# Standardize features in R using scale()
scaled_features <- scale(features)

# Run K-Means Clustering algorithm in R
set.seed(42)
km_result <- kmeans(scaled_features, centers = k_clusters, nstart = 25)

# Calculate Elbow Curve metrics (WSS for k=1 to 8)
wss <- numeric(8)
for (k in 1:8) {
  km_temp <- kmeans(scaled_features, centers = k, nstart = 10)
  wss[k] <- km_temp$tot.withinss
}

# Output R Results
cat("--- R K-MEANS CLUSTERING OUTPUT ---\n")
cat(sprintf("Number of Clusters (K): %d\n", k_clusters))
cat(sprintf("Total Within-Cluster Sum of Squares: %.2f\n", km_result$tot.withinss))
cat(sprintf("Between-Cluster Sum of Squares Ratio: %.2f%%\n", (km_result$betweenss / km_result$totss) * 100))
cat("Cluster Sizes:\n")
print(km_result$size)
cat("Cluster Centroids (Original Scale):\n")
unscaled_centers <- aggregate(features, by=list(Cluster=km_result$cluster), mean)
print(unscaled_centers)
