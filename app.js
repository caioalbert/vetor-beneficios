// Import sqlite
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const app = express();

const PORT = 3000;
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const dbPath = path.resolve(__dirname, './db/ecommerce.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Conexão com o banco de dados estabelecida.');
});

// Cria a tabela users

const sql = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  cpf VARCHAR(255) NOT NULL,
  birthDate VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL
);`;

// Cria a tabela sales

const sql2 = `CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  total FLOAT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id)
);`;

// Cria a tabela line_items

const sql3 = `CREATE TABLE IF NOT EXISTS line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  saleId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  price FLOAT NOT NULL,
  FOREIGN KEY (saleId) REFERENCES sales (id)
);`;

// Cria as tabelas no banco de dados

db.run(sql, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Tabela users criada com sucesso.');
});

db.run(sql2, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Tabela sales criada com sucesso.');
});

db.run(sql3, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Tabela line_items criada com sucesso.');
});

const user = {
  id: 1,
  name: 'João',
  email: 'teste@teste.com',
  address: 'Rua teste, 123',
  city: 'São Paulo',
  state: 'SP',
  cep: '12345-123',
  paymentMethod: 'credit-card',
  cardNumber: '1234 1234 1234 1234',
  cardName: 'João',
  cardExpiration: '01/23',
  cardCVV: '123'
}

app.get('/', (req, res) => {
  res.render('index', {
    user: user
  });

});

app.post('/checkout', (req, res) => {
  let data = {
    customerName: req.body.customerName,
    email: req.body.customerEmail,
    address: req.body.endereco,
    cpf: req.body.cpf,
    birthDate: req.body.dataNascimento,
    phone: req.body.numeroWhatsApp
  }

  let sql = `INSERT INTO users (customerName, email, address, cpf, birthDate, phone) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [data.customerName, data.email, data.address, data.cpf, data.birthDate, data.phone], function(err) {
    if (err) {
      console.error(err.message);
    } else {
      
      res.cookie('userId', this.lastID, {
        maxAge: 900000,
        httpOnly: true
      });

      // Cria uma venda no banco de dados com o id do usuário e os line_items associados a essa venda, os line_items vão estar no local storage do navegador do usuário com o nome cart, cart é um array de item e cada item contém apenas o nome e o price no json.

      let cart = [{name: 'default test', price: 10}];
      let total = 10;

      let sql = `INSERT INTO sales (userId, total) VALUES (?, ?)`;
      let failureCount = 0;

      db.run(sql, [this.lastID, total], function(err) {
        if (err) {
          console.error(err.message);
        } else {
          cart.forEach(item => {
            let sql = `INSERT INTO line_items (saleId, name, price) VALUES (?, ?, ?)`;
    
            db.run(sql, [this.lastID, item.name, item.price], function(err) {
              if (err) {
                console.error(err.message);
                failureCount++;
              } else {
                console.log(`A row has been inserted with rowid ${this.lastID}`);
              }
            });
          });

          if (failureCount === 0) {
            const url = 'https://sandbox.asaas.com/api/v3/customers';
            const options = {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                access_token: 'd8bfbb35-0dd7-4ab5-8e63-233d1ff141b8'
              },
              body: JSON.stringify({
                name: data.customerName,
                email: data.email,
                phone: data.phone,
                cpfCnpj: data.cpf
              })
            };

            fetch(url, options)
              .then(res => function(){
                res.json();
              })
              .then(json => function() {
                console.log("\n\n\n")
                console.log(json);
                console.log("\n\n\n")
              })
              .catch(err => console.error('error:' + err));

            res.redirect('/checkoutResult?success=https://www.google.com')
          } else {
            res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.')
          }
        }
      })
    }
  });
});


// Rota para a página de checkoutResult
app.get('/checkoutResult', (req, res) => {
  res.render('checkoutResult');
});

// Rota para a página de checkout
app.get('/checkout', (req, res) => {
  res.render('checkout');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});