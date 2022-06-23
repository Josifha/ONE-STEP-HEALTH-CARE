FROM node : 17.3 as src

WORKDIR /app
 
COPY package*.json .

RUN npm insall
RUN npm install firebase
RUN npm install -g firebase-tools
COPY . .
RUN npm run build






 