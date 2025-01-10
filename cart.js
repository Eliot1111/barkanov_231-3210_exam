const API_KEY = 'd9802522-5f6a-46bd-a5f2-1679eab9e140';

const cartItemsContainer = document.getElementById('cartItemsContainer');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const notificationArea = document.getElementById('notification-area');
const orderForm = document.getElementById('orderForm');

function showNotification(message) {
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 3000);
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function setCart(cartArray) {
    localStorage.setItem('cart', JSON.stringify(cartArray));
}

function removeFromCart(id) {
    let cart = getCart();
    const idx = cart.indexOf(id);
    if (idx !== -1) {
        cart.splice(idx, 1);
        setCart(cart);
        renderCartItems();
        showNotification(`Товар (ID=${id}) удалён из корзины`);
    }
}

function fetchGoodById(id) {
    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${id}?api_key=${API_KEY}`;
    return fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка при загрузке товара (ID=${id}): ${res.statusText}`);
            }
            return res.json();
        })
        .catch((err) => {
            showNotification(err.message);
            return null;
        });
}





function renderCartItems() {
    const cart = getCart();
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        return;
    }
    emptyCartMessage.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    Promise.all(cart.map((id) => fetchGoodById(id)))
        .then((goods) => {
            goods.forEach((item) => {
                if (!item) return;
                const col = document.createElement('div');
                col.className = 'col';

                const priceBlock = item.discount_price
                    ? `<span class="text-danger fw-bold me-2">${item.discount_price} ₽</span>
             <span class="text-muted text-decoration-line-through">${item.actual_price} ₽</span>`
                    : `<span class="fw-bold">${item.actual_price} ₽</span>`;

                col.innerHTML = `
          <div class="card h-100">
            <img src="${item.image_url}" class="card-img-top" alt="${item.name}">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p>Рейтинг: ${item.rating}</p>
              <p>${priceBlock}</p>
              <button class="btn btn-danger" data-remove-id="${item.id}">
                Удалить
              </button>
            </div>
          </div>
        `;
                cartItemsContainer.appendChild(col);
            });
        })
        .catch((err) => {
            showNotification(err.message);
        });
}

cartItemsContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('button[data-remove-id]');
    if (removeBtn) {
        const removeId = parseInt(removeBtn.dataset.removeId, 10);
        removeFromCart(removeId);
    }
});

function createOrderMultipart(orderObj) {
    const formData = new FormData();
    formData.append('full_name', orderObj.full_name);
    formData.append('email', orderObj.email);
    formData.append('phone', orderObj.phone);
    formData.append('subscribe', orderObj.subscribe);
    formData.append('delivery_address', orderObj.delivery_address);
    formData.append('delivery_date', orderObj.delivery_date);
    formData.append('delivery_interval', orderObj.delivery_interval);
    formData.append('comment', orderObj.comment);
    orderObj.good_ids.forEach((id) => formData.append('good_ids[]', id));

    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=${API_KEY}`;
    return fetch(url, {
        method: 'POST',
        body: formData
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка при создании заказа: ${res.statusText}`);
            }
            return res.json();
        });
}

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Корзина пуста, нечего оформлять.');
        return;
    }

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subscribe = document.getElementById('subscribe').checked ? 1 : 0;
    const address = document.getElementById('deliveryAddress').value;
    const dateVal = document.getElementById('deliveryDate').value;
    const interval = document.getElementById('deliveryInterval').value;
    const comment = document.getElementById('comment').value;

    const [yyyy, mm, dd] = dateVal.split('-');
    const finalDate = `${dd}.${mm}.${yyyy}`;

    const orderData = {
        full_name: fullName,
        email: email,
        phone: phone,
        subscribe: subscribe,
        delivery_address: address,
        delivery_date: finalDate,
        delivery_interval: interval,
        comment: comment,
        good_ids: cart
    };

    createOrderMultipart(orderData)
        .then((createdOrder) => {
            showNotification(`Заказ #${createdOrder.id} успешно оформлен!`);
            localStorage.removeItem('cart');
            renderCartItems();
            orderForm.reset();
        })
        .catch((err) => {
            showNotification(err.message);
        });
});


function deleteOrder(orderId) {
    return fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${API_KEY}`, {
        method: 'DELETE'
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка при удалении заказа ID=${orderId}: ${res.status} ${res.statusText}`);
            }
            return res.json();
        });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCartItems();
});
