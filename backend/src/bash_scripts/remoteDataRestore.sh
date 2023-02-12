#!/bin/sudo bash

pwd

cd src

elixir_backup_password=$ELIXIR_BACKUP_PASSWORD
elixir_backup_database=$ELIXIR_BACKUP_DATABASE

elixir_password=$ELIXIR_PASSWORD


# dump the data of the backup database to an archive file called remote_elixir.archive
mongodump --uri mongodb+srv://elixio_backup:$elixir_backup_password@elixiriobackup.7qf8qu5.mongodb.net/$elixir_backup_database  --archive=remote_elixir.archive 

# transfer the data of the archive file to main database
mongorestore --uri  mongodb+srv://elixir_io:$elixir_password@elixirio.g9uelta.mongodb.net  --archive=remote_elixir.archive