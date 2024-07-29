#!/bin/bash

PID=$(pgrep -f "ssh gserver -NL 8058:localhost:8058")

if [ -n "$PID" ]; then
  echo "Stopping ssh bridge (PID: $PID)"
  kill $PID
else
  echo "No ssh bridge"
fi