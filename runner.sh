#!/bin/bash

opencode serve --hostname 0.0.0.0 --port 10 > /home/container/logs/opencode.log 2>&1 &
sleep 3
exec bun run index.js