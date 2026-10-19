
# Use Node.js as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to optimize build caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code, except .dockerignore
COPY . .

# Document the port used by the application
EXPOSE 4000

# Start the Express server
CMD ["node", "app.js"]
