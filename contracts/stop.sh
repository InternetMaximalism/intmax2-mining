#!/bin/bash

PID=$(pgrep -f "npm exec hardhat node")

if [ -n "$PID" ]; then
  echo "Stopping npx hardhat node (PID: $PID)"
  kill $PID
else
  echo "No npx hardhat node process found"
fi