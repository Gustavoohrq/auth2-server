var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "alexa-oauth2.cfdacj6pdovg.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "5624492f1b3243589ad4556f9371b449",
  database: "oauth2.0-server"
});

connection.connect(function (err) {
  if (err) return console.log(err);
  console.log('Connectou!');
})

module.exports = connection;