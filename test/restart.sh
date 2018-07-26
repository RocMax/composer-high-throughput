#!/bin/bash

cd ../composer-high-throughput

npm run prepublish

cd ../fabric

sh ./restart.sh

# cd ../test
# node index.js