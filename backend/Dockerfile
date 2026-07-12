
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

RUN addgroup appgroup && adduser -S appuser -G appgroup

USER appuser

CMD ["npm", "start"]

