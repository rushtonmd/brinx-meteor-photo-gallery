#!/bin/bash

export PORT="3000"

export MONGO_URL="mongodb://user:password@127.0.0.1:27017"

export ROOT_URL="http://localhost"

export MAIL_URL="smtp://test@test.com:password@mail.server.com:465/" 

export METEOR_SETTINGS="$(cat config/settings.json)"
