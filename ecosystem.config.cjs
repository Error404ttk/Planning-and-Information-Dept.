module.exports = {
    apps: [
        {
            name: 'saraphi-backend',
            cwd: './server',
            script: 'npx',
            args: 'ts-node src/index.ts',
            watch: ['src'],
            ignore_watch: ['node_modules', 'logs', 'uploads', '.git'],
            env: {
                NODE_ENV: 'development',
                PORT: 3007
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3007
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '500M'
        },
        {
            name: 'saraphi-frontend',
            cwd: './',
            script: 'npm',
            args: 'run dev',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s'
        }
    ]
};
