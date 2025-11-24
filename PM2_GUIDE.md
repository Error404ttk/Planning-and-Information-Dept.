# PM2 Process Manager - Setup Guide

## Overview

PM2 is a production-ready process manager for Node.js applications. This setup allows you to run both frontend and backend concurrently with automatic restarts, logging, and monitoring.

## Installation

### Install PM2 Globally

```bash
npm install -g pm2
```

## Configuration

### Ecosystem File

The `ecosystem.config.js` file defines two processes:

1. **saraphi-backend** - Backend API (Port 3007)
2. **saraphi-frontend** - Frontend Vite dev server (Port 5173)

## PM2 Commands

### Start All Applications

```bash
pm2 start ecosystem.config.js
```

### Start Specific App

```bash
pm2 start ecosystem.config.js --only saraphi-backend
pm2 start ecosystem.config.js --only saraphi-frontend
```

### Stop Applications

```bash
pm2 stop all
pm2 stop saraphi-backend
pm2 stop saraphi-frontend
```

### Restart Applications

```bash
pm2 restart all
pm2 restart saraphi-backend
pm2 restart saraphi-frontend
```

### Delete/Remove Applications

```bash
pm2 delete all
pm2 delete saraphi-backend
pm2 delete saraphi-frontend
```

### View Logs

```bash
# All logs
pm2 logs

# Specific app logs
pm2 logs saraphi-backend
pm2 logs saraphi-frontend

# Clear logs
pm2 flush
```

### Monitor Applications

```bash
# Real-time monitoring
pm2 monit

# List all processes
pm2 list

# Detailed info
pm2 show saraphi-backend
pm2 show saraphi-frontend
```

## Auto-Start on System Boot

### Save Current Process List

```bash
pm2 save
```

### Generate Startup Script

```bash
pm2 startup
```

Follow the instructions provided by the command.

### Disable Startup

```bash
pm2 unstartup
```

## Log Files

Logs are stored in the `logs/` directory:

- `backend-error.log` - Backend errors
- `backend-out.log` - Backend output
- `frontend-error.log` - Frontend errors
- `frontend-out.log` - Frontend output

## Environment Variables

### Development

```bash
pm2 start ecosystem.config.js
```

### Production

```bash
pm2 start ecosystem.config.js --env production
```

## Port Configuration

- **Backend**: Port 3007 (changed from 3000 to avoid conflicts)
- **Frontend**: Port 5173 (Vite default)

## Useful Tips

### Reload (Zero-Downtime)

```bash
pm2 reload all
```

### Watch Mode (Auto-restart on file changes)

Already configured in ecosystem.config.js for backend:
- Watches `src/` directory
- Ignores `node_modules`, `logs`, `uploads`, `.git`

### Memory Management

Backend is configured to restart if memory exceeds 500MB:
```javascript
max_memory_restart: '500M'
```

### Max Restarts

Both apps will stop auto-restarting after 10 crashes:
```javascript
max_restarts: 10
```

## Troubleshooting

### Port Already in Use

If port 3007 is already in use:

1. Find the process:
   ```bash
   lsof -i :3007
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

### PM2 Not Found

If `pm2` command is not found after installation:

```bash
# Using npx
npx pm2 start ecosystem.config.js

# Or add to PATH
export PATH=$PATH:$(npm bin -g)
```

### View PM2 Daemon Logs

```bash
pm2 logs pm2
```

## Advanced Features

### Cluster Mode (Production)

For production, you can run multiple instances:

```javascript
{
  name: 'saraphi-backend',
  script: 'dist/index.js',
  instances: 'max', // or number
  exec_mode: 'cluster'
}
```

### Custom Metrics

```bash
pm2 install pm2-metrics
```

### Web Dashboard

```bash
pm2 web
```

Access at: http://localhost:9615

## Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 start ecosystem.config.js` | Start all apps |
| `pm2 stop all` | Stop all apps |
| `pm2 restart all` | Restart all apps |
| `pm2 reload all` | Zero-downtime reload |
| `pm2 delete all` | Remove all apps |
| `pm2 logs` | View logs |
| `pm2 monit` | Monitor apps |
| `pm2 list` | List all processes |
| `pm2 save` | Save process list |
| `pm2 startup` | Enable auto-start |

## Production Deployment

1. Build backend:
   ```bash
   cd server && npm run build
   ```

2. Update ecosystem.config.js for production:
   ```javascript
   {
     name: 'saraphi-backend',
     script: 'dist/index.js',
     instances: 2,
     exec_mode: 'cluster',
     env_production: {
       NODE_ENV: 'production',
       PORT: 3007
     }
   }
   ```

3. Start with production environment:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

4. Save and enable startup:
   ```bash
   pm2 save
   pm2 startup
   ```

---

**PM2 is now configured and ready to use!** 🚀
