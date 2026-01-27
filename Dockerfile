FROM node:20

WORKDIR /app

# Copia tudo da pasta src local para a pasta atual no container (.)
COPY ./src .

# Instala o prompt-sync dentro do container para o JS não quebrar
RUN npm install prompt-sync

CMD ["node", "index.js"]