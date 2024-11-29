FROM node:bookworm-slim

WORKDIR /app

COPY ./server/package*.json ./

# clean install this will cope all deps with the exact version
RUN npm install

COPY ./server .

CMD [ "npm" , "run" , "dev" ]