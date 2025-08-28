# src/frontend/Dockerfile

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app/frontend

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
