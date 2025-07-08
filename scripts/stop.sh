#!/bin/bash

echo "Stopping Value Builder Assessment application..."

# Kill processes by name
PID=$(ps aux | grep -i "tsx server/index.ts" | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    echo "Killing process with PID: $PID"
    kill -9 $PID
    echo "Application stopped successfully."
else
    echo "No running application found."
fi