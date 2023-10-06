const express = require('express');
const app = express();

const PORT = 3000;
app.set('view engine', 'ejs')
app.use(express.static('public'));

const user = {
  firstName: 'Tim',
  lastName: 'Cook',
}

app.get('/', (req, res) => {
  res.render('index', {
    user: user
  });

});

// Rota para a página de checkout
app.get('/checkout', (req, res) => {
  res.render('checkout');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});