FROM node:19-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["yarn", "start"]
