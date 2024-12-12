# SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>
#
# SPDX-License-Identifier: AGPL-3.0-or-later

FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .
RUN source .env
RUN yarn build-only

# Stage 2: Serve the application using nginx
FROM nginx:stable-alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]