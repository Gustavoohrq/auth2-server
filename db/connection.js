var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "oauth2.0-server"
});

connection.connect(function (err) {
  if (err) return console.log(err);
  console.log('conectou!');
})

module.exports = connection;