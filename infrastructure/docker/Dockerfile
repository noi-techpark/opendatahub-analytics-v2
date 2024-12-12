# SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>
#
# SPDX-License-Identifier: AGPL-3.0-or-later

FROM node:20 AS builder

WORKDIR /app

COPY . .
# explicit copy due to .dockerignore
COPY .env.build .env

RUN yarn install
RUN yarn build-only

# Stage 2: Serve the application using nginx
FROM nginx:stable-alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
