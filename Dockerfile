FROM node:20-slim AS build

WORKDIR /app/backend

COPY package.json pnpm-lock.yaml* ./
RUN npm install

COPY tsconfig.json esbuild.config.mjs ./
COPY src ./src
RUN npm run build

FROM node:20-slim

WORKDIR /app/backend
ENV NODE_ENV=production

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package.json ./package.json

RUN mkdir -p outputs

EXPOSE 3000
CMD ["node", "dist/index.js"]
