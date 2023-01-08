#!/bin/sudo bash

pwd

cd src

#PROCESS OF BACKING UP DATA FROM ELIXIR_MONGODB'S HOST TO ELIXIR_MONGODB_BACKUP'S HOST

#dump the data of the database elixir_io(docker container name) in to an archive file called elixir.archive
mongodump -vvvv --host elixir_mongodb --port 27017 --username elixir_io  --password elixir_io --authenticationDatabase admin --archive=elixir.archive 


# transfer the data of the archive file to database with "elixir_mongodb_backup" as host... [port 27017 is the port of elixir_mongodb_backup container]
mongorestore -vvvv --nsInclude="*"  --host elixir_mongodb_backup --port 27017 --username elixir_io --password elixir_io --authenticationDatabase admin --archive=elixir.archive 

