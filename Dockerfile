FROM node:22-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@11.17.0
RUN npm ci

# dev: just deps + tooling installed; source arrives via bind mount at runtime
FROM base AS dev
CMD ["npm", "run", "dev"]        # nodemon / tsx watch — your hot-reload command

# prod: bake the code in, build, run — this is the CI artifact
FROM base AS prod
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]