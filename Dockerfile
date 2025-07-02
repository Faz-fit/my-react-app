# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Create the log directory to prevent errors
RUN mkdir -p /var/log/nginx

# Remove the default nginx configuration to avoid warnings
RUN rm /etc/nginx/conf.d/default.conf

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy the build files from the first stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for Nginx
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
