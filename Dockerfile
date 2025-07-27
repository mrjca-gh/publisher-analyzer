FROM ghcr.io/puppeteer/puppeteer:21.0.0

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
