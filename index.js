#! /usr/bin/env node

var mysql      = require('mysql');
var async	   = require('async');
var argv 	   = require('minimist')(process.argv.slice(2));



//console.dir(argv);

if(typeof(argv.server)=="undefined" || typeof(argv.username)=="undefined"  || typeof(argv.password)=="undefined" || typeof(argv.database)=="undefined" ){
	throw  "Missing Mandatory parameter.  Kindly check the documentation at https://github.com/kunalmestri9/pre-sync-mongify";
}



var _databaseConfig={
  host     : argv.server,
  user     : argv.username,
  password : argv.password,
  database : argv.database
}

var connection = mysql.createConnection(_databaseConfig);

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log("============= Pre - SYNC - Mongify Connected =============");
  console.log("Connected to Database " + _databaseConfig.database);

  console.log("-----------------------------------------------------------");
  console.log("  	            Starting to Update Database               ");
  console.log("-----------------------------------------------------------");
  init();
  
});

function init(){
	connection.query('show tables', function(err, rows, fields) {
	  if (err) throw err;
	    async.eachSeries(rows,function (ob, next){ 
			var tableName=ob["Tables_in_"+_databaseConfig.database];
	 		console.log("Table Name : " + tableName);
	 		checkIfAlteringIsRequired(tableName,function(){
	 			console.log("-----------------------------------------------------------");
	 			next();
	 			
	 		});
	    },function(){
			console.log("Completed required changes to database. Go ahead and execute : ");
			console.log("mongify sync database.config database_translation.rb");
			console.log("For more information visit : https://github.com/anlek/mongify#sync-note");
			connection.end();
		});
	});
}



function checkIfAlteringIsRequired(tableName,callback){
	var checkQuery="SHOW COLUMNS FROM " + tableName + " WHERE Field='updated_at'";
	//console.log(checkQuery);
	connection.query(checkQuery, function(err, rows, fields) {
	    if (err) {
		    console.log(err);
		}
		if(rows.length==0){
			console.log("Altering table " + tableName);
			alterTableForUpdatedAt(tableName,function(){
				callback();
			})
		}else{
			console.log("No need to alter.Hence skipping the table.");
			callback();
		}
	});
	
	
}
/*
function alterTableForUpdatedAt(tableName,callback){
	var alterQuery="ALTER TABLE " + tableName + " ADD COLUMN updated_at DATETIME DEFAULT NOW()";
	connection.query(alterQuery, function(err, rows, fields) {
		if (err) {
		    console.log(err);
		}else{
			console.log("Altering completed all set to go");
			callback();
		}	
	});
}

*/

function alterTableForUpdatedAt(tableName,callback){
	var updateTrigger="CREATE TRIGGER " + tableName + "_up_trigger BEFORE UPDATE on " + tableName + " FOR EACH ROW SET NEW.updated_at=NOW()";
	var alterQuery="ALTER TABLE " + tableName + " ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()";
        var updateQuery="UPDATE " + tableName + " SET updated_at=NOW()";	
async.eachSeries([alterQuery,updateTrigger,updateQuery],function (ob, next){
		connection.query(ob, function(err, rows, fields) {
			console.log(ob);
			if (err) {
			    console.log(err);
			}else{
				console.log("Altering completed all set to go");
			}	
			next();
		});
    },function(){
		callback();
	});
	
}