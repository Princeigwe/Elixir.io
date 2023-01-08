#!/bin/sudo bash

# echo "hello my neighbours"

pwd

cd src

pwd

ls

node --version

mongo --version

# mongodump

# node scripts/mongodump.ts
# node scripts/mongorestore.ts


# cp -u -r  mongo-volume/*  mongo-backup-volume/

# mongodump --uri="mongodb://elixir_io:elixir_io@localhost:27107/elixir_io?ssl=false&authSource=admin"
# mongodump --user=elixir_io --db=elixir_io --password=elixir_io --authenticationDatabase=admin

mongodump --host elixir_mongodb --port 27017 --username elixir_io --db elixir_io --password elixir_io --authenticationDatabase admin --out ./
