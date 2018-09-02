FROM node:10.3

RUN ln -snf /usr/share/zoneinfo/Europe/London /etc/localtime && echo Europe/London > /etc/timezone \
	&& apt-get -y update \
	&& apt-get -y upgrade \
	&& mkdir -p /home/nodejs/app 

WORKDIR /home/nodejs/app

COPY package.json /home/nodejs/app

RUN npm install --production

COPY . /home/nodejs/app

CMD [ "npm", "start" ]

EXPOSE 3978