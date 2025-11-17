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
