FROM node:19-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["yarn", "start"]
