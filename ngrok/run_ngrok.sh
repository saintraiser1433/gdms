#!/bin/bash

NGROK_URL="numinous-manie-homotaxially.ngrok-free.dev"
PORT=3000
TOKEN="399EmyoLakejo1jlGTYKvFGkpcE_39S8euHhJXzZFv5KJNfMj"

echo "Adding Ngrok authtoken..."
ngrok config add-authtoken "$TOKEN"

if [ $? -eq 0 ]; then
    echo "Authtoken added successfully!"
else
    echo "Failed to add authtoken. Please check your token or Ngrok installation."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Starting Ngrok tunnel..."
ngrok http --url="$NGROK_URL" "$PORT"

read -p "Press Enter to close..."
