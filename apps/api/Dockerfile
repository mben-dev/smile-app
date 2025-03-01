# Version de Node.js
ARG NODE_VERSION=20
ARG APP_DIRNAME=api
ARG PROJECT=api

# 1. Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine AS base
RUN corepack disable pnpm && npm install -g pnpm@9.0.0
# Replace <your-major-version> with the major version installed in your repository. For example:
# RUN npm install turbo@2.1.3 --global
RUN npm install turbo --global

RUN pnpm config set store-dir ~/.pnpm-store

# 2. Prune projects
FROM base AS pruner
# https://stackoverflow.com/questions/49681984/how-to-get-version-value-of-package-json-inside-of-dockerfile
# RUN export VERSION=$(npm run version)

ARG PROJECT

# Set working directory
WORKDIR /app

# It might be the path to <ROOT> turborepo
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "@acme/nextjs" is the name entered in the project's package.json: { name: "@acme/nextjs" }
RUN turbo prune --scope=${PROJECT} --docker
 
# 3. Build the project
FROM base AS builder
ARG PROJECT

# Environment to skip .env validation on build
ENV CI=true

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile
 
# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN pnpm build --filter=${PROJECT}


# ---- 5. Image finale pour exécuter l’application ----
FROM base AS runner
ARG APP_DIRNAME
WORKDIR /app

# Sécurisation : on ne tourne pas en root
RUN addgroup --system --gid 1001 adonis
RUN adduser --system --uid 1001 adonis
USER adonis

# Copier les fichiers nécessaires au runtime
COPY --from=builder --chown=adonis:adonis /app .
WORKDIR /app/apps/${APP_DIRNAME}

# RUN echo "Contenu de /app après copie :" && ls -la /app
# RUN echo "Contenu de /app/build après copie :" && ls -la /app/build
# RUN echo "Contenu de /app/build/bin après copie :" && ls -la /app/build/bin

# Exposer le bon port pour AdonisJS
ARG PORT=3333
ENV PORT=${PORT}
EXPOSE ${PORT}

# Lancer l’application AdonisJS 6
CMD ["node", "./build/bin/server.js"]
