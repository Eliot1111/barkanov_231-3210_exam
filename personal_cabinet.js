const API_KEY = 'd9802522-5f6a-46bd-a5f2-1679eab9e140';
const notificationArea_LK = document.getElementById('notification-area');
const ordersTableBody = document.getElementById('ordersTableBody');

const viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
const editOrderModal = new bootstrap.Modal(document.getElementById('editOrderModal'));
const deleteOrderModal = new bootstrap.Modal(document.getElementById('deleteOrderModal'));

const viewOrderContent = document.getElementById('viewOrderContent');
const editOrderForm = document.getElementById('editOrderForm');
const editOrderId = document.getElementById('editOrderId');
const editFullName = document.getElementById('editFullName');
const editEmail = document.getElementById('editEmail');
const editPhone = document.getElementById('editPhone');
const editSubscribe = document.getElementById('editSubscribe');
const editDeliveryAddress = document.getElementById('editDeliveryAddress');
const editDeliveryDate = document.getElementById('editDeliveryDate');
const editDeliveryInterval = document.getElementById('editDeliveryInterval');
const editComment = document.getElementById('editComment');
const confirmDeleteOrderBtn = document.getElementById('confirmDeleteOrder');

let currentDeleteOrderId = null;


const goodsPrices = {
    '1': 1000,
    '2': 1500,
    '3': 2000,
};

function showNotificationLK(msg, type = 'info') {
    notificationArea_LK.textContent = msg;
    notificationArea_LK.className = '';
    switch (type) {
        case 'success':
            notificationArea_LK.classList.add('bg-success', 'text-white');
            break;
        case 'error':
            notificationArea_LK.classList.add('bg-danger', 'text-white');
            break;
        default:
            notificationArea_LK.classList.add('bg-info', 'text-white');
    }
    notificationArea_LK.style.display = 'block';
    setTimeout(() => {
        notificationArea_LK.style.display = 'none';
    }, 3000);
}


function fetchOrders() {
    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=${API_KEY}`;
    return fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка при получении заказов: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .catch((err) => {
            showNotificationLK(err.message, 'error');
            return [];
        });
}

function calculateTotalCost(goodIds) {
    if (!Array.isArray(goodIds) || goodIds.length === 0) return 0;
    return goodIds.reduce((total, id) => {
        const price = goodsPrices[id];
        if (price) {
            return total + price;
            console.warn(`Цена для товара с ID ${id} не найдена.`);
            return total;
        }
    }, 0);
}

function renderOrders(orders) {
    ordersTableBody.innerHTML = '';
    if (!orders || orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Заказов нет</td>
            </tr>
        `;
        return;
    }
    orders.forEach((order, idx) => {
        const goodsStr =
            Array.isArray(order.good_ids) && order.good_ids.length
                ? order.good_ids.join(', ')
                : '—';
        const totalCost = calculateTotalCost(order.good_ids);
        const formattedTotalCost = totalCost > 0 ? `${totalCost} ₽` : '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${order.created_at ? new Date(order.created_at).toLocaleString('ru-RU') : '—'}</td>
            <td>${goodsStr}</td>
            <td>${formattedTotalCost}</td>
            <td>${order.delivery_date ? new Date(order.delivery_date).toLocaleString('ru-RU') : '—'}</td>
            <td>${order.delivery_interval || '—'}</td>
            <td>
                <button class="btn btn-sm btn-info me-1 view-order-btn" data-id="${order.id}" title="Просмотр">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning me-1 edit-order-btn" data-id="${order.id}" title="Редактирование">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-order-btn" data-id="${order.id}" title="Удаление">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        ordersTableBody.appendChild(tr);
    });

    document.querySelectorAll('.view-order-btn').forEach(button => {
        button.addEventListener('click', () => viewOrder(button.dataset.id));
    });

    document.querySelectorAll('.edit-order-btn').forEach(button => {
        button.addEventListener('click', () => editOrder(button.dataset.id));
    });

    document.querySelectorAll('.delete-order-btn').forEach(button => {
        button.addEventListener('click', () => promptDeleteOrder(button.dataset.id));
    });
}

function viewOrder(orderId) {
    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${API_KEY}`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка при получении заказа: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(order => {
            const subscribeText = order.subscribe ? 'Да' : 'Нет';
            const goodsStr =
                Array.isArray(order.good_ids) && order.good_ids.length
                    ? order.good_ids.join(', ')
                    : '—';
            const totalCost = calculateTotalCost(order.good_ids);
            const formattedTotalCost = totalCost > 0 ? `${totalCost} ₽` : '—';
            viewOrderContent.innerHTML = `
                <p><strong>ID:</strong> ${order.id}</p>
                <p><strong>ФИО:</strong> ${order.full_name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Телефон:</strong> ${order.phone}</p>
                <p><strong>Рассылка:</strong> ${subscribeText}</p>
                <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                <p><strong>Дата доставки:</strong> ${order.delivery_date ? new Date(order.delivery_date).toLocaleString('ru-RU') : '—'}</p>
                <p><strong>Интервал доставки:</strong> ${order.delivery_interval || '—'}</p>
                <p><strong>Комментарий:</strong> ${order.comment || '—'}</p>
                <p><strong>Товары (ID):</strong> ${goodsStr}</p>
                <p><strong>Итоговая стоимость:</strong> ${formattedTotalCost}</p>
                <p><strong>Дата создания:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString('ru-RU') : '—'}</p>
            `;
            viewOrderModal.show();
        })
        .catch(err => {
            showNotificationLK(err.message, 'error');
        });
}

function editOrder(orderId) {
    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${API_KEY}`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка при получении заказа: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(order => {
            editOrderId.value = order.id;
            editFullName.value = order.full_name;
            editEmail.value = order.email;
            editPhone.value = order.phone;
            editSubscribe.value = order.subscribe ? 'true' : 'false';
            editDeliveryAddress.value = order.delivery_address;
            editDeliveryDate.value = order.delivery_date ? new Date(order.delivery_date).toISOString().slice(0, 16) : '';
            editDeliveryInterval.value = order.delivery_interval;
            editComment.value = order.comment || '';
            editOrderModal.show();
        })
        .catch(err => {
            showNotificationLK(err.message, 'error');
        });
}

editOrderForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const orderId = editOrderId.value;
    const updatedOrder = {
        full_name: editFullName.value,
        email: editEmail.value,
        phone: editPhone.value,
        subscribe: editSubscribe.value === 'true',
        delivery_address: editDeliveryAddress.value,
        delivery_date: new Date(editDeliveryDate.value).toISOString(),
        delivery_interval: editDeliveryInterval.value,
        comment: editComment.value
    };
    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${API_KEY}`;
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder),
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка при обновлении заказа: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(() => {
            showNotificationLK('Заказ успешно обновлен', 'success');
            editOrderModal.hide();
            fetchOrders().then(renderOrders);
        })
        .catch(err => {
            showNotificationLK(err.message, 'error');
        });
});

function promptDeleteOrder(orderId) {
    currentDeleteOrderId = orderId;
    deleteOrderModal.show();
}

confirmDeleteOrderBtn.addEventListener('click', function () {
    if (!currentDeleteOrderId) return;
    const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${currentDeleteOrderId}?api_key=${API_KEY}`;
    fetch(url, {
        method: 'DELETE',
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка при удалении заказа: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(() => {
            showNotificationLK('Заказ успешно удален', 'success');
            deleteOrderModal.hide();
            fetchOrders().then(renderOrders);
        })
        .catch(err => {
            showNotificationLK(err.message, 'error');
        });
});

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders()
        .then((orders) => {
            renderOrders(orders);
        })
        .catch((err) => {
            showNotificationLK(err.message, 'error');
        });
});
