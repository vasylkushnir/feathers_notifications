ARG NODE_VERSION=16.10.0

#             dependencies
# --------------------------------------
FROM node:${NODE_VERSION}-alpine as dependencies

WORKDIR /app
COPY package* tsconfig* ./

# Install prod and dev+prod dependencies separately for multi-stage usage
RUN npm ci --prod
RUN mv node_modules prod_node_modules
RUN npm ci

#                 builder
# --------------------------------------
FROM node:${NODE_VERSION}-alpine as builder
WORKDIR /app
COPY package* tsconfig* ./
COPY src ./src/
COPY --from=dependencies /app/node_modules ./node_modules

RUN npm run build
RUN chown -R node:node /app

#                 base
# --------------------------------------
FROM node:${NODE_VERSION}-alpine as base

# Prevent node/npm being run as PID 1
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init"]

ENV PATH $PATH:./node_modules/.bin
WORKDIR /app
COPY . .
RUN chown -R node:node /app
USER node

#                 dev
# --------------------------------------
FROM base as dev
ENV NODE_ENV=dev
WORKDIR /app
COPY --chown=node --from=dependencies /app/node_modules ./node_modules
CMD ["npm", "run", "dev"]