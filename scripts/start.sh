#!/bin/bash

# Kill any existing processes on port 5000
echo "Checking for existing processes on port 5000..."
PID=$(ps aux | grep -i "tsx server/index.ts" | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    echo "Killing existing process with PID: $PID"
    kill -9 $PID
    sleep 2
fi

# Start the application
echo "Starting Value Builder Assessment application..."
NODE_ENV=development tsx server/index.ts