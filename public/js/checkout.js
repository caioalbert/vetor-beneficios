$(document).ready(function() {
    function updateCart() {
        $('#cartItems').empty();
        cart.forEach(item => {
            $('#cartItems').append(`<li class="list-group-item">${item.name} - R$${item.price.toFixed(2)} <button class="btn btn-danger btn-sm float-right removeItem">Remover</button></li>`);
        });
        $('#totalPrice').text(total.toFixed(2));
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('total', total);
    }

    function validateCpf(cpf) {
        let sum = 0;
        let remainder;
      
        cpf = cpf.replace(/\D/g, '');
      
        if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
          return false;
        }
      
        for (let i = 1; i <= 9; i++) {
          sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
      
        remainder = (sum * 10) % 11;
      
        if (remainder === 10 || remainder === 11) {
          remainder = 0;
        }
      
        if (remainder !== parseInt(cpf.substring(9, 10))) {
          return false;
        }
      
        sum = 0;
      
        for (let i = 1; i <= 10; i++) {
          sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
      
        remainder = (sum * 10) % 11;
      
        if (remainder === 10 || remainder === 11) {
          remainder = 0;
        }
      
        if (remainder !== parseInt(cpf.substring(10, 11))) {
          return false;
        }
      
        return true;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = parseFloat(localStorage.getItem('total')) || 0;

    $('.addToCart').click(function() {
        let productName = $(this).data('name');
        let productPrice = parseFloat($(this).data('price'));

        cart.push({ name: productName, price: productPrice });
        total += productPrice;

        updateCart();
        alert('Produto adicionado com sucesso');
    });

    $('#cartItems').on('click', '.removeItem', function() {
        let index = $(this).parent().index();
        let removedItem = cart.splice(index, 1);
        total -= removedItem[0].price;

        updateCart();
    });

    $('#clearCart').click(function() {
        cart = [];
        total = 0;
        updateCart();
        localStorage.removeItem('cart');
        localStorage.removeItem('total');
    });

    $('#checkoutForm').submit(function(e) {
        e.preventDefault();
        if (cart.length == 0) {
            alert('Não é possível finalizar a compra sem itens no carrinho');
            return;
        }

        let cpf = $('#cpf').val();
        if (!validateCpf(cpf)) {
            alert('CPF inválido');
            return;
        }

        $('#cart').val(JSON.stringify(cart));
        $('#total').val(total);

        let form = $(this);
        let data = form.serializeArray();
        if (!data.every(item => item.value !== '')) {
            alert('Todos os campos são obrigatórios!');
            return;
        } 

        this.submit();
    });

    updateCart();
});
