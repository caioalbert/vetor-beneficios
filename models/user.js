const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../db/ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
});

const userSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asaasId VARCHAR(255),
    customerName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    cpf VARCHAR(255) NOT NULL,
    birthDate VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL
  )
`;

db.run(userSchema, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Tabela de usuários funcionando.');
  }
});

const create = (customerName, email, address, cpf, birthDate, phone) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (customerName, email, address, cpf, birthDate, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [customerName, email, address, cpf, birthDate, phone],
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

const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const updateUser = (id, customerName, email, address, cpf, birthDate, phone) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET customerName = ?, email = ?, address = ?, cpf = ?, birthDate = ?, phone = ? WHERE id = ?`,
      [customerName, email, address, cpf, birthDate, phone, id],
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

const updateUserByCpf = (cpf, asaasId) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET asaasId = ? WHERE cpf = ?`,
      [asaasId, cpf],
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

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const count = () => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

const User = {
  create,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  count,
  updateUserByCpf
};

module.exports = User;