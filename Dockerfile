FROM node:10
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install react-scripts
COPY ./src /usr/src/app/src
COPY ./public /usr/src/app/public
COPY ./backend-src /usr/src/app/backend-src
COPY ./config /usr/src/app/config
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:backend"]
