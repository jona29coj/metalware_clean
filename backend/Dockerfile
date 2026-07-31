FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# monthly_reports is a mutable data directory (reports are written here by
# the cron report-writer at runtime) — mount it as a volume, don't bake
# contents into the image. Create it so the app has somewhere to write/read
# even if no volume is mounted.
RUN mkdir -p monthly_reports

EXPOSE 3002

CMD ["node", "server.js"]
