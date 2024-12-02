FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build-only

# Stage 2: Serve the application using nginx
FROM nginx:stable-alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]