#!/bin/bash
set -e

echo "Check if PeerAdmin card exists"
if composer card list | grep PeerAdmin@hlfv1
then 
   echo "Found PeerAdmin card , continue";
else
   echo "Not found , quit";
   exit 0
fi

echo "Check if old card exists"
if composer card list | grep admin@history-test
then 
   echo "Found old card , delete";
   composer card delete --card admin@history-test
else
   echo "Not found , continue";
fi

echo "Install network definition into Hyperledger Fabric"
composer network install --card PeerAdmin@hlfv1 --archiveFile ../composer-high-throughput/dist/composer-high-throughput.bna

echo "Start history-test network"
composer network start --networkName composer-high-throughput --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file admin@composer-high-throughput.card

echo "Import network admin card"
composer card import --file admin@composer-high-throughput.card

echo "Ping with network admin card"
composer network ping --card admin@composer-high-throughput

# echo "Start composer rest server"
# composer-rest-server