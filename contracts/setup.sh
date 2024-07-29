#!/bin/bash

# clean up
./stop.sh
rm -rf data/*
rm -rf deployments/*

# start hardhat node
npx hardhat node > /dev/null 2>&1 &

# wait for hardhat node to start
sleep 2

# deployments
npx hardhat ignition deploy ignition/modules/Int0.ts --network localhost

# send 10 eth to the withdrawer
npx hardhat run scripts/send.ts --network localhost