FROM node:alpine

RUN mkdir bustimings
WORKDIR bustimings
COPY . .

RUN apk add bash --no-cache && npm install