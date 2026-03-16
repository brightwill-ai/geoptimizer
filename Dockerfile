FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

COPY . .
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npm run build

EXPOSE 3000
CMD sh -c "npx prisma db push --accept-data-loss && npm start"
