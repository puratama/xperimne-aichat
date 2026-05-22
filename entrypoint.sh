#!/bin/sh
set -e

echo "Running database push..."
node /app/node_modules/prisma/build/index.js db push --accept-data-loss

echo "Starting server..."
exec node server.js
