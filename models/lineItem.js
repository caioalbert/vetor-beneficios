const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../db/ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
});

const lineItemSchema = `
  CREATE TABLE IF NOT EXISTS line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    saleId INTEGER,
    codPlano BIGINT,
    FOREIGN KEY (saleId) REFERENCES sales (id)
  )
`;

db.run(lineItemSchema, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabela de "line items" funcionando.');
  }
});

const create = (name, quantity, price, saleId, codPlano) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO line_items (name, quantity, price, saleId, codPlano) VALUES (?, ?, ?, ?, ?)`,
      [name, quantity, price, saleId, codPlano],
      function (err) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

const getLineItems = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM line_items`, (err, rows) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getLineItemsBySaleId = (saleId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM line_items WHERE saleId = ?`,
      [saleId],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const updateLineItem = (id, name, quantity, price, saleId, codPlano) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE line_items SET name = ?, quantity = ?, price = ?, saleId = ?, codPlano = ? WHERE id = ?`,
      [name, quantity, price, saleId, codPlano, id],
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

const deleteLineItem = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM line_items WHERE id = ?`, [id], (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const LineItem = {
  create,
  getLineItems,
  getLineItemsBySaleId,
  updateLineItem,
  deleteLineItem,
};

module.exports = LineItem;