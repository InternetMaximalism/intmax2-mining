#!/bin/bash

./stop.sh
ssh gserver -NL 8058:localhost:8058 &
RUST_LOG=info cargo run -r