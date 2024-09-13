# frontend/Dockerfile
FROM node:20-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Start the application
CMD [ "npm", "start" ]