#!/bin/bash

sh ./stopFabric.sh

sh ./startFabric.sh

sh ./deleteAllCards.sh

sh ./createPeerAdminCard.sh

sh ./startNetwork.sh