FROM node:16-slim

RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "dev"]
