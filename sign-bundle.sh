#!bin/env bash

if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

web-ext sign --api-key "${AMO_JWT_ISSUER}" --api-secret "${AMO_JWT_SECRET}" --source-dir ./dist