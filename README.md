# Ollama Chat Web UI

A modern web interface for chatting with your locally hosted Ollama models.

## Features

- 🚀 Modern React + TypeScript + Vite stack
- 🎨 Clean, responsive UI with dark mode support
- 💬 Chat with any model available in your Ollama instance
- 🧠 Optional reasoning steps display
- 🔍 Support for search and calculation capabilities
- 🌐 Works with remote Ollama instances

## Deployment on Coolify

This application is designed to work with Coolify deployments. To properly configure it:

### 1. Environment Variables

Set the following environment variable in your Coolify deployment:

```
VITE_OLLAMA_API_URL=https://your-ollama-api-url.com/api
```

Replace `https://your-ollama-api-url.com/api` with the URL of your Ollama API endpoint.

### 2. CORS Configuration

Make sure your Ollama API server is configured to accept CORS requests from your web application domain. If you're running Ollama behind a reverse proxy like Nginx, you'll need to add appropriate CORS headers.

Example Nginx configuration:

```nginx
location /api {
    proxy_pass http://localhost:11434;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://your-chat-app-domain.com';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://your-chat-app-domain.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

### 3. Allowed Hosts

The application is configured to allow requests from `chatbot.cecilgachie.tech`. If you're using a different domain, update the `allowedHosts` in `vite.config.ts`.
