# Server

## Start server

```
ssh gserver -NL 8058:localhost:8058 &
RUST_LOG=info cargo run -r
```
