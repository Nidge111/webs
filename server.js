const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'website.codfvu1pgxsn.eu-north-1.rds.amazonaws.com',
  poet: '3306',
  user: 'root',
  password: 'password',
  database: '',
});

db.connect((err) => {
  if(err){
    console.log(err.message);
    return;
  }
  console.log("yummers");
});
