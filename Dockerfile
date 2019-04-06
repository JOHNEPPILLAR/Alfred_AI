FROM node:11-alpine

RUN ln -snf /usr/share/zoneinfo/Europe/London /etc/localtime && echo Europe/London > /etc/timezone \
	&& apk update && apk upgrade \
	&& apk add --no-cache git \
  && mkdir -p /home/nodejs/app

WORKDIR /home/nodejs/app

COPY . /home/nodejs/app

RUN rm -rf node_modules \
	&& npm install --production \
	&& npm install pino-elasticsearch -g

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
 CMD node lib/healthcheck.js

CMD [ "npm", "start" ]

EXPOSE 3978