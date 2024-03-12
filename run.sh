#!/bin/bash

docker run --rm -p 8088:8088 -v $PWD:/src node:8 /bin/bash -c "cd /src && yarn && yarn start"
