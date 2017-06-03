# pre-sync-mongify
This will help mongify sync command to get ready all the pre requirement that your mysql db should have. By setting up few triggers and altering some columns.
This module is useful for migrating your database from Mysql to Mongo in Sync Mode 


Usage:
------
You can install this module using npm : 
`npm install -g pre-sync-mongify`

After that execute command : 
`pre-sync-mongify --server yourservername --username yourusername --password yourpassword  --database databasename`

This will add the required columns in your mysql database which are necessary for syncing.


## License
MIT
 
