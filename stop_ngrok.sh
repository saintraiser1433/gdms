echo "Stopping Node server..."
pkill -f "node server.js"

echo "Stopping ngrok..."
pkill ngrok

echo "All services stopped."