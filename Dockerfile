FROM registry.xdp.vn:5000/nginx:1.17-alpine
COPY ./dist /var/www/
COPY ./public /var/www/public
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
