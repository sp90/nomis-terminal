FROM node:20-bullseye-slim as base

# Create app directory
WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl unzip && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g @angular/cli@18
# RUN npm install -g bun@canary
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN bun --version
RUN ng version

# Copy lock files
COPY package.json package-lock.json bun.lockb ./

# Define the build-time variable with a default value
ARG BUILD_ENV=dev

# Set the build-time variable as an environment variable
ENV BUILD_ENV=${BUILD_ENV}

# Install app dependencies
RUN bun i

# Bundle app source
COPY . /app

# Use the environment variable to conditionally run the build command
# RUN if [ "$BUILD_ENV" = "prod" ]; then \
#       bun run build:ssr; \
#     else \
#       bun run build:ssr; \
#     fi
RUN bun run build:ssr
