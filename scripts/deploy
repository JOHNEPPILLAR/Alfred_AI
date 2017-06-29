#!/bin/sh
 
ssh jp@alfred
    echo Getting latest code from Github for Alfred
    cd /home/jp/Alfred_DI
    git pull
    npm install

    echo Restarting PM2
    sudo pm2 restart server

  exit