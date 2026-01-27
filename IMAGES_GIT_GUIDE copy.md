  GNU nano 7.2                           .env
NODE_ENV=production
PORT=5000

DATABASE_URL=postgres://postgres:12345@localhost:5432/porto1

SESSION_SECRET=8f3a9b2c5d7e1f4a6b8c9d0e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a  

JWT_SECRET=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b      

SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=amazoniacoder@yandex.ru
SMTP_PASS=kvwvegerqlinnmqu
DOMAIN=blogpro.tech
PUBLIC_URL=http://89.169.0.223



Настройки Nginx


  GNU nano 7.2            /etc/nginx/sites-available/blogpro
  
  
server {
    listen 80;
    server_name blogpro.tech www.blogpro.tech;
    return 301 https://blogpro.tech$request_uri;

location ~* \.(css|js|mjs)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Content-Type "text/css" always;
}

location ~* \.js$ {
    add_header Content-Type "application/javascript" always;
}

location ~* \.mjs$ {
    add_header Content-Type "application/javascript" always;