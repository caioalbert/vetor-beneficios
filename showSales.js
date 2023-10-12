const express = require('express');
const app = express();
const port = 3001; // Porta do servidor

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, './db/ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
});

app.get('/sales', (req, res) => {
  // Recupere todas as vendas do banco de dados
  db.all('SELECT * FROM sales', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao recuperar vendas.');
      return;
    }

    // Renderize uma página HTML com as vendas em formato de tabela
    const html = `
      <html>
        <head>
          <title>Vendas</title>
        </head>
        <body>
          <h1>Vendas</h1>
          <table>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Total</th>
              <th>asaasId</th>
              <th>paymentUrl</th>
            </tr>
            ${rows.map(row => `
              <tr>
                <td>${row.id}</td>
                <td>${row.date}</td>
                <td>${row.total}</td>
                <td>${row.asaasId}</td>
                <td>${row.paymentUrl}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    res.send(html);
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
