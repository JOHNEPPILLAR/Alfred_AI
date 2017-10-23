FROM node:8.7

RUN apt-get update
RUN apt-get install -y unattended-upgrades
RUN npm install pm2 -g

RUN rm -rf /var/lib/apt/lists/*

COPY dockerinstall /install
RUN chmod 755 install
RUN /install

RUN mkdir -p /home/nodejs/app 
WORKDIR /home/nodejs/app

COPY package.json /home/nodejs/app
COPY package-lock.json /home/nodejs/app

RUN npm install

COPY . /home/nodejs/app

COPY dockerstart /start
RUN chmod 755 /start

ENTRYPOINT ["/start"]

EXPOSE 3978
