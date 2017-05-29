#!/bin/bash
clear
echo "The following node processes were found:"
ps aux | grep " node " | grep -v grep
nodepids=$(ps aux | grep " node app.js " | grep -v grep | cut -c10-15)

echo "OK, so we will stop these process/es now..."

kill -9 $(ps aux | grep '\snode\s' | awk '{print $2}')

echo "Done."

echo "Now setting node to v7.10.0"
source ~/.nvm/nvm.sh
nvm use 7.10.0

echo "Removing node modules folder and installing latest"
#rm -rf node_modules
npm install

clear

echo "Run the server app"
nodemon server.js
#node server.js