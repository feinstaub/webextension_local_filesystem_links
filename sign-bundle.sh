#!bin/env bash
unlisted=$1

if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

if [[ -n "$unlisted" ]]; then
   web-ext sign --api-key "${AMO_JWT_ISSUER}" --api-secret "${AMO_JWT_SECRET}" --source-dir ./dist --channel=unlisted
else
  web-ext sign --api-key "${AMO_JWT_ISSUER}" --api-secret "${AMO_JWT_SECRET}" --source-dir ./dist --channel=listed
fi