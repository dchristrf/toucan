#!/bin/bash

# Shim to install node 16 as a dev dep. Only way to get node 16 on replit virtual machine...
echo "Running replit config..."
npm init -y && npm i --save-dev node@16 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH
echo "Done."