#!/bin/bash

NGROK_URL="numinous-manie-homotaxially.ngrok-free.dev"
PORT=3000
TOKEN="399EmyoLakejo1jlGTYKvFGkpcE_39S8euHhJXzZFv5KJNfMj"

# Ensure we're in project root
cd "$(dirname "$0")/.." || exit 1

# Start Node server in background
echo "Starting server on port $PORT..."
cd .next/standalone || exit 1
node server.js &
NODE_PID=$!
cd ../.. || exit 1

# Kill Node when script exits (Ctrl+C or normal exit)
cleanup() {
  echo ""
  echo "Stopping server (PID $NODE_PID)..."
  kill $NODE_PID 2>/dev/null
  exit 0
}
trap cleanup EXIT INT TERM

# Wait for server to be ready
sleep 3

echo "Adding Ngrok authtoken..."
ngrok config add-authtoken "$TOKEN" || {
  echo "Failed to add authtoken. Please check your token or Ngrok installation."
  exit 1
}

echo "Starting Ngrok tunnel..."
ngrok http --url="$NGROK_URL" "$PORT"

