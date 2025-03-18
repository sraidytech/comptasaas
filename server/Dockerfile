FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

# Ensure the build runs successfully
RUN npm run build

# Compile the seed.ts file to JavaScript
RUN npx tsc prisma/seed.ts --outDir prisma/dist

# List the contents of the dist directory to see what's there
RUN ls -la dist

FROM node:20-alpine

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy the built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma/dist ./prisma/dist

# Install production dependencies, ts-node for seeding, and rebuild bcrypt for the current architecture
RUN npm ci --only=production && \
    npm install -g ts-node typescript && \
    npm install --save-dev @types/bcrypt && \
    npm rebuild bcrypt --build-from-source

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

# Use the correct path to the main.js file
CMD ["node", "dist/src/main.js"]
