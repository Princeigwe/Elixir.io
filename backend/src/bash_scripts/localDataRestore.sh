#!/bin/sudo bash

# echo "hello my neighbours"

pwd

cd src

#PROCESS OF RESTORING DATA FROM ELIXIR_MONGODB_BACKUP TO ELIXIR_MONGODB


# mongodump --host elixir_mongodb --port 27017 --username elixir_io --db elixir_io --password elixir_io --authenticationDatabase admin --archive=elixir.archive

# dump the data of the database elixir_io_backup(docker container name) in to an archive file called elixir.archive
mongodump --host elixir_mongodb_backup --port 27021 --username elixir_io  --password elixir_io --authenticationDatabase admin --archive=elixir.archive


# transfer the data of the archive file to database with "elixir_mongodb" as host
mongorestore --host elixir_mongodb --port 27017 --username elixir_io  --password elixir_io --authenticationDatabase admin --archive=elixir.archive
