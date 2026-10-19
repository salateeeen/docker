# Use an existing image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Document the port the application listens on
EXPOSE 3000

# Start the application when the container runs
CMD ["node", "server.js"]