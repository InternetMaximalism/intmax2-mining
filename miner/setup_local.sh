#!/bin/bash

# clean up
rm -rf data/*

# start the network
pushd ../contracts

./setup.sh

popd

