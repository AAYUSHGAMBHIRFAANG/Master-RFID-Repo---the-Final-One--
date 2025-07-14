# Use the official Node.js 20 image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests and install deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Expose port & start
EXPOSE 3000
CMD ["node", "--experimental-specifier-resolution=node", "src/app.js"]
