#!/bin/sh
set -e

echo "Running database push..."
npx prisma db push --accept-data-loss

echo "Starting server..."
exec node server.js
