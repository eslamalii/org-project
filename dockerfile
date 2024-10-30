# Use Node.js base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with necessary build tools for bcrypt compatibility
RUN apk add --no-cache make gcc g++ python3 && \
    npm install && \
    apk del make gcc g++ python3  # Remove build dependencies to reduce image size

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 8080

# Start the NestJS application
CMD ["npm", "run", "start:prod"]