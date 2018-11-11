FROM node:alpine

RUN adduser -S bustimings
USER bustimings
RUN mkdir /home/bustimings/bustimings
WORKDIR /home/bustimings/bustimings
COPY --chown=bustimings:root . .

RUN npm ci --production
