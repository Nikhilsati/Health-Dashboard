#!/bin/bash
# Exit on error
set -e

echo "Building project..."
pnpm run build

echo "Deploying to GitHub Pages..."
# Go to the build output directory
cd artifacts/health-dashboard/dist/public

# Initialize a temporary git repository cleanly
rm -rf .git
git init
git add -A
git commit -m "Deploy to GitHub Pages"

# Get the remote URL of the parent repository
REMOTE_URL=$(git -C ../../../.. remote get-url origin)

echo "Pushing to gh-pages branch of $REMOTE_URL..."
git push -f "$REMOTE_URL" HEAD:gh-pages

echo "Successfully deployed to GitHub Pages!"
