$(document).ready(function() {
    function updateCart() {
        $('#cartItems').empty();
        cart.forEach(item => {
          // faz o append do item na lista e coloca um label circulado em vermelho com um - dentro e uma classe removeItem e ele vai logo após o preço juntinho
          $('#cartItems').append(
            '<li class="list-group-item d-flex justify-content-between lh-condensed"><div><h6 class="my-0 text-muted">' + item.name + '</h6></div><span class="text-muted"><div>R$ ' + item.price + '</span><span class="removeItem badge badge-outline badge-small badge-pill">X</span></div></li>');
        });

        $('#cartItems').append('<li class="list-group-item d-flex justify-content-between"><span>Total (BRL)</span><strong>R$ ' + total.toFixed(2).replace('.', ',') + '</strong></li>');
        $('.cartItemsCount').text(cart.length + ' itens');

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
        console.log($(this).data('cod-plano'));
        let productName = $(this).data('name');
        let productPrice = parseFloat($(this).data('price'));
        let productCodPlano = $(this).data('cod-plano');

        cart.push({ name: productName, price: productPrice, codPlano: productCodPlano });
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

        window.location.href = '/#planos';
    });

    $('#moreProducts').click(function() {
      window.location.href = '/#planos';
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
