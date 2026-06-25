FROM node:22-slim AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm ci                    # all deps, incl nodemon
CMD ["npm", "run", "dev"]

FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev         # prod deps only — no nodemon in the shipped image
COPY . .
CMD ["node", "index.js"]      # run source directly; nothing to "build"