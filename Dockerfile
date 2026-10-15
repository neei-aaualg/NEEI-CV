# --- Stage 1: build the front end ---
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: production server + Chromium for PDF export ---
FROM node:22-alpine AS runner

WORKDIR /app

# Chromium prints the PDFs. The fonts are fallbacks; resume fonts load from Google Fonts at render time.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont font-noto font-liberation

ENV NODE_ENV=production
ENV PORT=3000
# Docker's default seccomp profile blocks Chromium's sandbox. Rendered pages have JavaScript
# disabled and no network access except Google Fonts (see server/api.js).
ENV CHROMIUM_NO_SANDBOX=1

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node server.js ./
COPY --chown=node:node server ./server

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

CMD ["node", "server.js"]
