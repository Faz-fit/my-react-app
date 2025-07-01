# Use Node.js 20 image
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy application files
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the app
FROM nginx:alpine

# Copy build files to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
