$(function () {
  'use strict';

  // Variables y selectores jQuery como los ejemplos de la clase.
  var CART_STORAGE_KEY = 'tienda-cart';
  var cart = [];

  try {
    var savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (error) {
    cart = [];
  }

  function currency(value) {
    return '$' + Number(value).toFixed(2);
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // El carrito continúa funcionando durante la sesión.
    }
  }

  // .text() y .html() también ayudan a evitar insertar contenido sin escapar.
  function escapeHtml(value) {
    return $('<div>').text(value).html();
  }

  function findCartItem(id) {
    var foundItem = null;

    // $.each() es el recorrido mostrado en la presentación.
    $.each(cart, function (index, item) {
      if (item.id === id) {
        foundItem = item;
      }
    });

    return foundItem;
  }

  function getCartCount() {
    var count = 0;

    $.each(cart, function (index, item) {
      count += item.quantity;
    });

    return count;
  }

  function renderCart() {
    var $cartCount = $('#cartCount');
    var $cartItems = $('#cartItems');
    var $emptyState = $('#cartEmptyState');
    var $cartSummary = $('#cartSummary');
    var $clearButton = $('#clearCartButton');
    var $checkoutButton = $('#checkoutButton');
    var subtotal = 0;
    var html = '';

    $cartCount.text(getCartCount());

    if (cart.length === 0) {
      $cartItems.html('');
      $('#cartSubtotal').text(currency(0));
      $cartSummary.addClass('d-none');
      $clearButton.addClass('d-none');
      $checkoutButton.addClass('d-none');
      $emptyState.removeClass('d-none').fadeIn(200);
      return;
    }

    $emptyState.stop(true, true).fadeOut(200);
    $cartSummary.removeClass('d-none');
    $clearButton.removeClass('d-none');
    $checkoutButton.removeClass('d-none');

    // Construcción de elementos con .each(), .html() y .append().
    $.each(cart, function (index, item) {
      var itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      html += '<div class="cart-item" data-id="' + escapeHtml(item.id) + '">';
      html += '  <div class="row align-items-center">';
      html += '    <div class="col-sm">';
      html += '      <div class="cart-item-name">' + escapeHtml(item.name) + '</div>';
      html += '      <div class="small text-muted">' + currency(item.price) + ' por unidad</div>';
      html += '    </div>';
      html += '    <div class="col-sm-auto mt-3 mt-sm-0 d-flex align-items-center gap-3">';
      html += '      <div class="quantity-control" aria-label="Cantidad de ' + escapeHtml(item.name) + '">';
      html += '        <button type="button" class="quantity-btn" data-action="decrease" data-id="' + escapeHtml(item.id) + '" aria-label="Disminuir cantidad">−</button>';
      html += '        <span>' + item.quantity + '</span>';
      html += '        <button type="button" class="quantity-btn" data-action="increase" data-id="' + escapeHtml(item.id) + '" aria-label="Aumentar cantidad">+</button>';
      html += '      </div>';
      html += '      <strong>' + currency(itemTotal) + '</strong>';
      html += '      <button type="button" class="btn btn-sm btn-link text-danger remove-cart-item" data-id="' + escapeHtml(item.id) + '">Eliminar</button>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
    });

    $cartItems.html(html);
    $('#cartSubtotal').text(currency(subtotal));
  }

  function showCartToast(message) {
    $('#cartToast .toast-body').text(message);
    bootstrap.Toast.getOrCreateInstance(document.getElementById('cartToast')).show();
  }

  // Añadir productos con .on('click') y lectura de atributos con .attr().
  $('.btn-add-to-cart').on('click', function () {
    var $button = $(this);
    var productId = $button.attr('data-id');
    var product = findCartItem(productId);

    if (product) {
      product.quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: $button.attr('data-product'),
        price: Number($button.attr('data-price')),
        quantity: 1
      });
    }

    saveCart();
    renderCart();
    showCartToast($button.attr('data-product') + ' se añadió al carrito.');

    // .text(), .addClass() y .removeClass() como en la clase.
    $button.prop('disabled', true).text('Añadido ✓');
    $button.removeClass('btn-outline-primary').addClass('btn-success');

    setTimeout(function () {
      $button.prop('disabled', false).text('Añadir');
      $button.removeClass('btn-success').addClass('btn-outline-primary');
    }, 900);
  });

  function updateQuantity(id, change) {
    var item = findCartItem(id);

    if (!item) {
      return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
      renderCart();
    }
  }

  function removeFromCart(id) {
    var updatedCart = [];

    // Se conserva el patrón de $.each() y .remove() de los ejemplos.
    $.each(cart, function (index, item) {
      if (item.id !== id) {
        updatedCart.push(item);
      }
    });

    cart = updatedCart;
    saveCart();
    renderCart();
  }

  $('#cartItems').on('click', '.quantity-btn', function () {
    var id = $(this).attr('data-id');
    var action = $(this).attr('data-action');
    var change = action === 'increase' ? 1 : -1;

    updateQuantity(id, change);
  });

  $('#cartItems').on('click', '.remove-cart-item', function () {
    removeFromCart($(this).attr('data-id'));
  });

  $('#clearCartButton').on('click', function () {
    if (window.confirm('¿Quieres vaciar el carrito?')) {
      cart = [];
      saveCart();
      renderCart();
    }
  });

  $('#checkoutButton').on('click', function () {
    if (cart.length > 0) {
      window.alert('¡Gracias por tu compra! Esta es una demostración del carrito.');
      cart = [];
      saveCart();
      renderCart();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('carritoModal')).hide();
    }
  });

  function normalizeText(value) {
    return String(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function applyFilters() {
    var search = normalizeText($('#searchInput').val());
    var category = $('#categoryFilter').val();
    var maxPrice = $('#priceFilter').val();
    var sort = $('#sortFilter').val();
    var $items = $('#productGrid .product-item');
    var visibleProducts = 0;
    var totalProducts = $items.length;
    var activeFilters = [];

    // Ordenamiento usando el conjunto seleccionado por jQuery.
    var sortedItems = $items.get().sort(function (firstItem, secondItem) {
      var $first = $(firstItem);
      var $second = $(secondItem);
      var firstPrice = Number($first.attr('data-price'));
      var secondPrice = Number($second.attr('data-price'));

      if (sort === 'price-asc') {
        return firstPrice - secondPrice;
      }

      if (sort === 'price-desc') {
        return secondPrice - firstPrice;
      }

      if (sort === 'name') {
        return normalizeText($first.attr('data-name')).localeCompare(normalizeText($second.attr('data-name')), 'es');
      }

      return Number($first.attr('data-featured')) - Number($second.attr('data-featured'));
    });

    // .append() reordena los elementos dentro del grid.
    $('#productGrid').append(sortedItems);

    // .each(), .show() y .hide() filtran las tarjetas.
    $items.each(function () {
      var $item = $(this);
      var itemName = normalizeText($item.attr('data-name'));
      var itemCategory = $item.attr('data-category');
      var itemPrice = Number($item.attr('data-price'));
      var matchesSearch = !search || itemName.indexOf(search) !== -1;
      var matchesCategory = category === 'all' || itemCategory === category;
      var matchesPrice = maxPrice === 'all' || itemPrice <= Number(maxPrice);

      if (matchesSearch && matchesCategory && matchesPrice) {
        $item.show();
        visibleProducts += 1;
      } else {
        $item.hide();
      }
    });

    if (search) activeFilters.push('búsqueda: “' + search + '”');
    if (category !== 'all') activeFilters.push('categoría: ' + category);
    if (maxPrice !== 'all') activeFilters.push('hasta ' + currency(maxPrice));
    $('#activeFilterMessage').text(activeFilters.join(' · '));

    if (visibleProducts === 0) {
      $('#resultsMessage').text('No hay productos que coincidan con tu búsqueda.');
      $('#noResults').removeClass('d-none').stop(true, true).fadeIn(300);
    } else {
      $('#resultsMessage').text('Mostrando ' + visibleProducts + ' de ' + totalProducts + ' productos');
      $('#noResults').stop(true, true).fadeOut(300, function () {
        $(this).addClass('d-none');
      });
    }
  }

  // Eventos de inputs con .on() y lectura con .val().
  $('#searchInput, #categoryFilter, #priceFilter, #sortFilter').on('input change', function () {
    applyFilters();
  });

  $('#clearFilters, #clearEmptyFilters').on('click', function () {
    $('#searchInput').val('');
    $('#categoryFilter, #priceFilter').val('all');
    $('#sortFilter').val('featured');
    applyFilters();
  });

  // Suscripción usando .val(), .text() y modales Bootstrap.
  $('#btnSubscribe').on('click', function () {
    var email = $('#emailInput').val().trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var modalId = email && emailRegex.test(email) ? 'suscripcionModal' : 'errorModal';

    if (modalId === 'suscripcionModal') {
      $('#modalEmailSubscription').text(email);
      $('#emailInput').val('');
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId)).show();
  });

  // Desplazamiento suave con .animate(), tal como aparece en la clase.
  $('a[href^="#"]').on('click', function (event) {
    var target = $($(this).attr('href'));

    if (target.length) {
      event.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 70 }, 600);
    }
  });

  $('#carritoModal').on('show.bs.modal', function () {
    renderCart();
  });

  applyFilters();
  renderCart();
});
