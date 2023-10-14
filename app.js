require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const User = require('./models/user');
const Sale = require('./models/sale');
const LineItem = require('./models/lineItem');
const AsaasCreateCustomerCall = require('./lib/asaas/createCustomerCall');
const AsaasCreatePaymentCall = require('./lib/asaas/createPaymentCall');
const SiprovCreateCustomerCall = require('./lib/siprov/createCustomerCall');

const PORT = 3001;
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
  date.setDate(date.getDate() + 1);

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
      res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function createSale(req, res, data, userId) {
  const cart = data.cart;
  const total = data.total;

  Sale.create(userId, total, dueDate())
    .then(saleId => {
      console.log('Venda criada com sucesso. ID: ' + saleId);
      insertLineItems(req, res, data, saleId, cart);
    })
    .catch(err => {
      console.error("Erro na criação da venda:" + err.message);
      res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    })
}

function insertLineItems(req, res, data, saleId, cart) {
  const failureCount = 0;

  cart.forEach(item => {
    LineItem.create(item.name, 1, item.price, saleId)
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
    res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
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
      updateUserIdInDatabase(req, res, asaasResponse.id, data, saleId);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function updateUserIdInDatabase(req, res, customerAsaasId, data, saleId) {
  User.updateUserByCpf(customerAsaasId, data.cpf)
    .then(userId => {
      console.log('Usuário atualizado com sucesso. AsaasID: ' + customerAsaasId);
      createAsaasPayment(req, res, customerAsaasId, saleId, data);
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

function createAsaasPayment(req, res, customerAsaasId, saleId, data) {
  AsaasCreatePaymentCall.call({
    customer: customerAsaasId,
    dueDate: dueDate(),
    billingType: 'CREDIT_CARD',
    value: data.total,
    description: 'Contratação de Assinatura - Vetor Benefícios',
    externalReference: saleId,
    callback: {
      successUrl: 'https://vetorbeneficios.com/paidFinished?saleId=' + saleId,
      autoRedirect: true
    }
    })
      .then(asaasResponse => {
        console.log('Pagamento criado com sucesso no Asaas. ID: ' + asaasResponse.id);
        updateSaleIdInDatabase(req, res, asaasResponse, saleId);
      })
      .catch(err => {
        console.error(err.message);
        res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
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
      res.redirect('/errorPage?failure=Ocorreu um erro ao finalizar a transação, favor tentar novamente.');
    });
}

app.get('/paidFinished', (req, res) => {
  let saleId = req.query.saleId;

  Sale.getSaleById(saleId)
    .then(sale => {
      res.render('paidFinished', { sale: sale });
    })
    .catch(err => {
      console.error(err.message);
      res.redirect('/errorPage?failure=Ocorreu um erro ao exibir o resumo da sua venda. Passe o ID da venda para o suporte. #' + saleId);
    });
});

app.post('/finishUserPayment', (req, res) => {
  if (req.headers['asaas-access-token'] != process.env.SECRET_WEBHOOK_KEY) {
    return res.status(401).send('Unauthorized');
  }
  if ((!req.body.event) || (!req.body.payment)) {
    return res.status(400).send('Bad Request');
  }
  if(req.body.event != 'PAYMENT_CONFIRMED') {
    return res.status(200).send({});
  }
  if (!req.body.payment.externalReference) {
    return res.status(400).send('Pending External Reference');
  }

  let saleId = req.body.payment.externalReference;

  Sale.getSaleById(saleId)
    .then(sale => {
      console.log('Venda encontrada com sucesso. ID: ' + sale.id);

      Sale.updateSalePaid(sale.id)
        .then(saleId => {
          console.log('Venda atualizada com sucesso. ID: ' + saleId);
        })
        .catch(err => {
          console.error('Erro na atualização da venda:' + err.message)
        });

      return User.getUserById(sale.userId);
    })
    .then(user => {
      console.log('Usuário encontrado com sucesso. ID: ' + user.id);

      SiprovCreateCustomerCall.call({
        codLoja: 2614,
        codigoIntegracao: 519,
        cpfCnpj: user.cpf,
        dataNascimento: user.birthDate,
        email: user.email,
        natureza: 'F',
        nomePessoa: user.customerName,
        telefones: [
          {
            tipo: 'Celular',
            numero: user.phone
          }
        ]
      })
        
    })
    .then(siprovResponse => {
      console.log('Cliente criado com sucesso no Siprov.');
      return res.status(200).send({});
    })
    .catch(err => {
      console.log(err.message)
      return res.status(200).send({ error: 'Falha ao criar cliente no Siprov.'});
    });
});

app.post('/checkout', (req, res) => {
  const data = {
    customerName: req.body.customerName,
    email: req.body.customerEmail,
    address: req.body.endereco,
    cpf: req.body.cpf,
    birthDate: req.body.dataNascimento,
    phone: req.body.numeroWhatsApp,
    cart: JSON.parse(req.body.cart),
    total: req.body.total
  };

  insertUser(req, res, data);
});

app.get('/errorPage', (req, res) => {
  res.render('errorPage');
});

app.get('/checkout', (req, res) => {
  res.render('checkout');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});