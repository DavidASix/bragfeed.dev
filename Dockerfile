FROM node:24-slim
WORKDIR /app

# Copy package files and install dependencies
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Set up for development
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# Command to start development server
CMD ["pnpm", "dev"]

# sudo docker compose down
# sudo docker compose build --no-cache
# sudo docker compose up
