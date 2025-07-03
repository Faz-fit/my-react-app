# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve the build using Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
