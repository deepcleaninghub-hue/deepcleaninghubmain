module.exports = {
  apps: [
    {
      name: 'deepclean-hub-backend',
      script: './backend/src/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
        API_BASE_URL: 'http://192.168.29.112:5001/api'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        API_BASE_URL: 'https://app.deepcleaninghub.com/api',
        AWS_REGION: 'ap-southeast-2',
        AWS_FROM_EMAIL: 'info@deepcleaninghub.com',
        ADMIN_EMAIL: 'deepakror888888@gmail.com'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
