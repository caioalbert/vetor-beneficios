$(document).ready(function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = parseFloat(localStorage.getItem('total')) || 0;

    function updateCartUI() {
        $('#cartItems').empty();
        cart.forEach(item => {
            $('#cartItems').append(`<li class="list-group-item">${item.name} - R$${item.price.toFixed(2)} <button class="btn btn-danger btn-sm float-right removeItem">Remover</button></li>`);
        });
        $('#totalPrice').text(total.toFixed(2));
    }

    $('.addToCart').click(function() {
        let productName = $(this).data('name');
        let productPrice = parseFloat($(this).data('price'));

        cart.push({ name: productName, price: productPrice });
        total += productPrice;

        updateCartUI();
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('total', total);
        alert('produto adicionado com sucesso')
    });

    $(document).on('click', '.removeItem', function() {
        let index = $(this).parent().index();
        let removedItem = cart.splice(index, 1);
        total -= removedItem[0].price;

        updateCartUI();
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('total', total);
    });

    $('#clearCart').click(function() {
        cart = [];
        total = 0;
        updateCartUI();
        localStorage.removeItem('cart');
        localStorage.removeItem('total');
    });

    // Inicializa o carrinho ao carregar a página
    updateCartUI();
});
