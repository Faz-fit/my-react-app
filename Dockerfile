# Use the official Nginx base image
FROM nginx:alpine

# Copy built React files into Nginx's web root
COPY build /usr/share/nginx/html

# Optional: Custom Nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
