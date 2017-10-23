FROM node:8.7

RUN apt-get update
RUN apt-get install -y unattended-upgrades
RUN npm install pm2 -g

RUN rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/nodejs/app 
WORKDIR /home/nodejs/app

COPY package.json /home/nodejs/app
COPY package-lock.json /home/nodejs/app

RUN npm install

COPY . /home/nodejs/app

RUN echo "0 0 * * * root /usr/bin/unattended-upgrade" >> /etc/crontab

CMD ["pm2-docker", "--public", "k2rkdu741mxq1qf", "--secret", "6mleq0809tk3di2", "start", "/home/nodejs/app/Alfred_di.js"]

EXPOSE 3978
