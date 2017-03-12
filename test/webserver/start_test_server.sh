#!/bin/bash

# prepare test data
mkdir -p ~/tmp/content
cp issue65/test-files/* ~/tmp/content

# start test server
node test-server.nodejs.js

