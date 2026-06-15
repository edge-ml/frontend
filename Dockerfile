# build environment
FROM node:16-alpine as build-step
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx
COPY --from=build-step /app/dist /usr/src/app/build
# Serve the SPA self-sufficiently (no host-mounted nginx config needed). Caddy
# terminates TLS and reverse-proxies the API paths; this only serves static
# files + SPA client-side routing fallback on the container-internal :80.
COPY nginx_spa.conf /etc/nginx/conf.d/default.conf
