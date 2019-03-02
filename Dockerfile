FROM node:11

RUN ln -snf /usr/share/zoneinfo/Europe/London /etc/localtime && echo Europe/London > /etc/timezone \
  && apt-get update \
  && mkdir -p /home/nodejs/app \
  && npm install --quiet node-gyp -g

WORKDIR /home/nodejs/app

COPY . /home/nodejs/app

RUN npm install --production

RUN npm install pino-elasticsearch -g

CMD [ "npm", "start" ]

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
 CMD node lib/healthcheck.js

EXPOSE 3981