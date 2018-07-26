#!/bin/bash
set -e

echo "List cards"
composer card list

echo "Delete cards store in .composer"
rm -rf ~/.composer/*

echo "List cards"
composer card list