# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY nextjs-app/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY nextjs-app/ ./

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
