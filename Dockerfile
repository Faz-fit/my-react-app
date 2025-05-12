# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Install a lightweight HTTP server to serve the static files
RUN npm install -g serve

# Make the app available on port 80
EXPOSE 80

# Run the app
CMD ["serve", "-s", "build", "-l", "80"]
