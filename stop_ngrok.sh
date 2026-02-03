#!/bin/bash

echo "Stopping Node server..."
pkill -f "node server.js" 2>/dev/null && echo "  ✓ Node server stopped" || echo "  (no Node server found)"

echo "Stopping ngrok..."
pkill ngrok 2>/dev/null && echo "  ✓ ngrok stopped" || echo "  (no ngrok found)"

echo "All services stopped."