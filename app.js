const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const fetch = require('node-fetch');
const app = express();

const User = require('./models/user');
const Sale = require('./models/sale');
const LineItem = require('./models/lineItem');
const AsaasCreateCustomerCall = require('./lib/asaas/createCustomerCall');
const AsaasCreatePaymentCall = require('./lib/asaas/createPaymentCall');

const PORT = 3000;
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('index');
});

function dueDate() {
  const date = new Date();
  date.setDate(tomorrow.getDate() + 1);

  const year = date.getFullYear();month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function insertUser(req, res, data) {
  User.create(data.customerName, data.email, data.address, data.cpf, data.birthDate, data.phone)
    .then(userId => {
      console.log('Usuário criado com sucesso. ID: ' + userId);
      createSale(req, res, data, userId);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function createSale(req, res, data, userId) {
  const cart = [{ name: 'default test', price: 10 }];
  const total = 10;

  Sale.create(userId, total)
    .then(saleId => {
      console.log('Venda criada com sucesso. ID: ' + saleId);
      insertLineItems(req, res, data, saleId, cart);
    })
    .catch(err => {
      console.error("Erro na criação da venda:" + err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    })
}

function insertLineItems(req, res, data, saleId, cart) {
  const failureCount = 0;

  cart.forEach(item => {
    LineItem.create(1, item.price, saleId)
      .then(lineItemId => {
        console.error('Item de venda criado com sucesso. ID: ' + lineItemId);
      })
      .catch(err => {
        console.error('Erro na criação do item de venda:' + err.message)
        failureCount++;
      });
  });

  if (failureCount === 0) {
    createAsaasCustomerAndPayment(req, res, data, saleId);
  }else {
    res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
  }
}

function createAsaasCustomerAndPayment(req, res, data, saleId) {
  AsaasCreateCustomerCall.call(JSON.stringify({
    name: data.customerName,
    email: data.email,
    phone: data.phone,
    cpfCnpj: data.cpf
  }))
    .then(asaasResponse => {
      console.log('Cliente criado com sucesso no Asaas. ID: ' + asaasResponse.id);
      updateUserIdInDatabase(req, res, asaasResponse.id, data.cpf, saleId);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function updateUserIdInDatabase(req, res, customerAsaasId, cpf, saleId) {
  User.updateUserByCpf(customerAsaasId, cpf)
    .then(userId => {
      console.log('Usuário atualizado com sucesso. AsaasID: ' + customerAsaasId);
      createAsaasPayment(req, res, customerAsaasId, saleId);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function createAsaasPayment(req, res, customerAsaasId, saleId) {
  const total = 10;
  const dueDate = dueDate();

  AsaasCreatePaymentCall.call(JSON.stringify(JSON.stringify({
    customer: customerAsaasId,
    dueDate: dueDate(),
    billingType: 'CREDIT_CARD',
    value: total,
    description: 'Contratação de Assinatura - Vetor Benefícios',
    externalReference: saleId,
    callback: {
      successUrl: 'http://localhost:3000/paidFinished?saleId=' + saleId,
      autoRedirect: true
    }
  })
  ))
    .then(asaasResponse => {
      console.log('Pagamento criado com sucesso no Asaas. ID: ' + asaasResponse.id);
      updateSaleIdInDatabase(req, res, asaasResponse, saleId);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function updateSaleIdInDatabase(req, res, asaasResponse, saleId) {
  Sale.updateSaleAsaasData(saleId, asaasResponse.id, asaasResponse.invoiceUrl)
    .then(saleId => {
      console.log('Venda atualizada com sucesso. AsaasID: ' + asaasResponse.id);
      res.redirect(asaasResponse.invoiceUrl);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

app.get('/paidFinished', (req, res) => {
  const saleId = req.query.saleId;

  Sale.getSaleById(saleId)
    .then(sale => {
      console.log('Venda encontrada com sucesso. ID: ' + sale.id);
      res.redirect('/checkoutResult?success=Pagamento realizado com sucesso. ID: ' + sale.id);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/checkoutResult?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
});

app.post('/checkout', (req, res) => {
  const data = {
    customerName: req.body.customerName,
    email: req.body.customerEmail,
    address: req.body.endereco,
    cpf: req.body.cpf,
    birthDate: req.body.dataNascimento,
    phone: req.body.numeroWhatsApp
  };

  insertUser(req, res, data);
});

app.get('/checkoutResult', (req, res) => {
  res.render('checkoutResult');
});

app.get('/checkout', (req, res) => {
  res.render('checkout');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});