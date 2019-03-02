FROM node:11-alpine

RUN ln -snf /usr/share/zoneinfo/Europe/London /etc/localtime && echo Europe/London > /etc/timezone \
	&& apk update \
	&& apk add \
	&& apt-get -y update \
	&& mkdir -p /home/nodejs/app 

WORKDIR /home/nodejs/app

COPY . /home/nodejs/app

RUN rm -rf node_modules \
    && npm update

RUN npm install --production

CMD [ "npm", "start" ]

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
 CMD node lib/healthcheck.js

EXPOSE 3981