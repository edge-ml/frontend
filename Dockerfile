# build environment
FROM node:latest
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@1.1.1 -g --silent
COPY . ./
RUN npm run build
