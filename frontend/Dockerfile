# Build Stage
FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the frontend logic
RUN npm run build

# Serving Stage
FROM nginx:alpine

# Copy the built assets from builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Replace default nginx config with our custom one to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
