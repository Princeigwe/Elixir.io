#!/bin/sudo bash

pwd

cd src

elixir_password=$ELIXIR_PASSWORD
elixir_database=$ELIXIR_DATABASE

elixir_backup_password=$ELIXIR_BACKUP_PASSWORD

#dump the data of the main database in to an archive file called remote_elixir.archive
mongodump --uri mongodb+srv://elixir_io:$elixir_password@elixirio.g9uelta.mongodb.net/$elixir_database --archive=remote_elixir.archive 

# transfer the data of the archive file to backup database
mongorestore --uri mongodb+srv://elixio_backup:$elixir_backup_password@elixiriobackup.7qf8qu5.mongodb.net --archive=remote_elixir.archive

