module.exports = {
  apps: [
    {
      name: 'pusaka-dev',
      script: 'npm',
      args: 'start',
      cwd: '/home/sfadmin/pusaka-newsletter',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/sfadmin/.pm2/logs/pusaka-dev-error.log',
      out_file: '/home/sfadmin/.pm2/logs/pusaka-dev-out.log',
      log_file: '/home/sfadmin/.pm2/logs/pusaka-dev-combined.log',
      time: true
    }
  ]
}
