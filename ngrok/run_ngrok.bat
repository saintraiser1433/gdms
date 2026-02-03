@echo off
set "NGROK_URL=numinous-manie-homotaxially.ngrok-free.dev"
set "PORT=80"
set "TOKEN=399EmyoLakejo1jlGTYKvFGkpcE_39S8euHhJXzZFv5KJNfMj"

echo Adding Ngrok authtoken...
ngrok config add-authtoken %TOKEN%

if %errorlevel%==0 (
    echo Authtoken added successfully!
) else (
    echo Failed to add authtoken. Please check your token or Ngrok installation.
    pause
    exit /b
)

echo Starting Ngrok tunnel...
ngrok http --url=%NGROK_URL% %PORT%

pause