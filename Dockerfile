FROM node:20

WORKDIR /app


COPY ./src .


RUN npm install prompt-sync

CMD ["node", "index.js"]