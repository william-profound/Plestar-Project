const mysql = require('mysql');

const db1 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'plestar_inc'
});

function select(tableName, columns = '*', whereCondition = '', values = [], callback) {
  db1.query(`SELECT ${columns} FROM ${tableName} WHERE ${whereCondition}`, values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
function insert(tableName, columns, values = [], callback) {
  db1.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.map(() => '?').join(', ')})`, values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function update(tableName, setValues, whereCondition, Values, callback) {
  const setClause = setValues.map(column => `${column} = ?`).join(', ');
  db1.query(`UPDATE ${tableName} SET ${setClause} WHERE ${whereCondition}`, Values, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function remove(tableName, whereCondition, whereValues, callback) {
  db1.query(`DELETE FROM ${tableName} WHERE ${whereCondition}`, whereValues, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

module.exports = { select, insert, update, remove };