FROM node 
WORKDIR /app
 
COPY package*.json .
COPY . .
RUN npm start






 