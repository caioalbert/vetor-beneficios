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

    // Remover do carrinho
    $('#cartItems').on('click', '.removeItem', function() {
        let index = $(this).parent().index();
        let removedItem = cart.splice(index, 1);
        total -= removedItem[0].price;

        updateCart();
    });

    // Limpar o carrinho
    $('#clearCart').click(function() {
        cart = [];
        total = 0;
        updateCart();
        localStorage.removeItem('cart');
        localStorage.removeItem('total');
    });

    //before submit add html with hidden input to form with cart and total
    $('#checkoutForm').submit(function(e) {
        e.preventDefault();
        // valida se tem itens no carrinho e não deixa avançar se não tiver
        if (cart.length == 0) {
            alert('Não é possível finalizar a compra sem itens no carrinho');
            return;
        }
        // valida se todos os campos estão preenchidos       
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
