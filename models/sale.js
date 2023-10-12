const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../db/ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
});

const saleSchema = `
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        total REAL NOT NULL,
        asaasId VARCHAR(255),
        paymentUrl VARCHAR(255),
        paid BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (userId) REFERENCES users (id)
    )
`;

db.run(saleSchema, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabela de vendas funcionando.');
  }
});

const create = (userId, total, asaasId, paymentUrl) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO sales (userId, total, asaasId, paymentUrl) VALUES (?, ?, ?, ?)`,
      [userId, total, asaasId, paymentUrl],
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
}

const getSales = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM sales`, (err, rows) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getSaleById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM sales WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

const updateSaleAsaasData = (id, asaasId, paymentUrl) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE sales SET asaasId = ?, paymentUrl = ? WHERE id = ?`,
      [asaasId, paymentUrl, id],
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
}

const updateSalePaid = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE sales SET paid = ? WHERE id = ?`,
      [true, id],
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
}

const Sale = {
  create,
  getSales,
  getSaleById,
  updateSaleAsaasData,
  updateSalePaid
};

module.exports = Sale;