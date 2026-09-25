# ==============================================================================
# R Script: Property Market Tiering Engine (Under the Hood)
# Algorithm: Unsupervised Learning - K-Means Clustering (kmeans)
# ==============================================================================

args <- commandArgs(trailingOnly = TRUE)
csv_file <- ifelse(length(args) > 0, args[1], "../static/data/properties_master.csv")

data <- read.csv(csv_file)
features <- data[, c("Price", "LocationScore", "CapRate", "WalkScore")]

scaled_features <- scale(features)
set.seed(42)
km <- kmeans(scaled_features, centers = 4, nstart = 25)

cat(sprintf("WSS: %.2f, Ratio: %.2f%%\n", km$tot.withinss, (km$betweenss/km$totss)*100))
