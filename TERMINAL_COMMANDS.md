# Terminal Commands for Value Builder Assessment

## Quick Start/Stop Commands

### To Start the Application (Safe Mode)
```bash
./scripts/start.sh
```
This will automatically kill any existing processes and start fresh.

### To Stop the Application
```bash
./scripts/stop.sh
```

### To Restart the Application
```bash
./scripts/stop.sh && ./scripts/start.sh
```

## Alternative Commands

### Manual Start (Original)
```bash
npm run dev
```

### Check if Application is Running
```bash
ps aux | grep "tsx server/index.ts"
```

### Kill Processes Manually (if needed)
```bash
pkill -f "tsx server/index.ts"
```

## Port Information
- The application runs on port 5000
- URL: http://localhost:5000
- The scripts automatically handle port conflicts

## Troubleshooting

If you get a "port already in use" error:
1. Run `./scripts/stop.sh` first
2. Then run `./scripts/start.sh`

Or use the one-liner restart command:
```bash
./scripts/stop.sh && ./scripts/start.sh
```