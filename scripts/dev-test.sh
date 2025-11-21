#!/bin/bash

# Start dev server with test environment variables
# This script is used by Playwright to ensure tests run with correct env vars

# Load test environment variables (filter out comments and empty lines)
export $(grep -v '^#' .env.test | grep -v '^$' | xargs)

# Run the dev server
concurrently "next dev" "wrangler pages dev --proxy 3000"
