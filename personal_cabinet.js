const API_KEY = 'd9802522-5f6a-46bd-a5f2-1679eab9e140';
const notificationArea_LK = document.getElementById('notification-area');
const ordersTableBody = document.getElementById('ordersTableBody');

function showNotificationLK(msg) {
    notificationArea_LK.textContent = msg;
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
            showNotificationLK(err.message);
            return [];
        });
}


function renderOrders(orders) {
    ordersTableBody.innerHTML = '';
    if (!orders || orders.length === 0) {
        ordersTableBody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center">Заказов нет</td>
      </tr>
    `;
        return;
    }
    orders.forEach((order, idx) => {
        const subscribeText = order.subscribe ? 'Да' : 'Нет';
        const goodsStr =
            Array.isArray(order.good_ids) && order.good_ids.length
                ? order.good_ids.join(', ')
                : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${order.id || ''}</td>
      <td>${order.full_name || ''}</td>
      <td>${order.email || ''}</td>
      <td>${order.phone || ''}</td>
      <td>${subscribeText}</td>
      <td>${order.delivery_address || ''}</td>
      <td>${order.delivery_date || ''}</td>
      <td>${order.delivery_interval || ''}</td>
      <td>${order.comment || ''}</td>
      <td>${goodsStr}</td>
      <td>${order.created_at || ''}</td>
    `;
        ordersTableBody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders()
        .then((orders) => {
            renderOrders(orders);
        })
        .catch((err) => {
            showNotificationLK(err.message);
        });
});
