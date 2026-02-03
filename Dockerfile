FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.ts ./index.ts
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/uploads ./uploads

ENV PORT=655353
ENV FILESYSTEM_UPLOAD_PATH=uploads
ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "index.ts"]