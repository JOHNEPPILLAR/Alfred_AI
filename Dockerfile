FROM node:12-alpine

RUN ln -snf /usr/share/zoneinfo/Europe/London /etc/localtime && echo Europe/London > /etc/timezone \
	&& apk update && apk upgrade \
	&& apk add --no-cache git \
  && mkdir -p /home/nodejs/app

WORKDIR /home/nodejs/app

COPY . /home/nodejs/app

RUN npm update \
	&& npm install --production \
	&& npm install pino-elasticsearch -g
	
HEALTHCHECK --start-period=60s --interval=10s --timeout=10s --retries=6 CMD ["./healthcheck.sh"]

CMD [ "npm", "start" ]

EXPOSE 3978