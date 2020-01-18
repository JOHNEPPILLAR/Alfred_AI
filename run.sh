#!/bin/bash
clear

echo "The following node processes were found and will be killed:"
lsof -i :3978
kill -9 $(lsof -sTCP:LISTEN -i:3978 -t)

echo "Removing node modules folder and installing latest"
rm -rf node_modules
ncu -u
npm install
npm audit fix
snyk test

echo "Set env vars"
export ENVIRONMENT="development"
export MOCK="false"
export PORT=3978
export ALFRED_FLOWERCARE_SERVICE="https://kidsroomserver:3981"
export ALFRED_COMMUTE_SERVICE="https://alfred_commute_service:3979"
export ALFRED_NETATMO_SERVICE="https://alfred_netatmo_data_collector_service:3979"
export ALFRED_DYSON_SERVICE="https://alfred_dyson_data_collector_service:3979"
export ALFRED_LIGHTS_SERVICE="https://alfred_lights_service:3979"

echo "Run the server"
npm run local
