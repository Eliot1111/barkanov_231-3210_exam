const API_KEY = 'd9802522-5f6a-46bd-a5f2-1679eab9e140';
const GOODS_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods';
const goodsContainer = document.getElementById('goodsContainer');
const notificationArea = document.getElementById('notification-area');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const sortSelect = document.getElementById('sortSelect');
const sidebarCategoriesContainer = document.getElementById('sidebarCategories');
const priceFromInput = document.getElementById('priceFrom');
const priceToInput = document.getElementById('priceTo');
const discountOnlyCheckbox = document.getElementById('discountOnly');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

let currentPage = 1;
const perPage = 100;
let allGoods = [];

function showNotification(message) {
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 3000);
}
function fetchAllGoods() {
    const url = `${GOODS_URL}?api_key=${API_KEY}&page=1&per_page=${perPage}`;

    return fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then((data) => {
            if (!data.goods || !Array.isArray(data.goods)) {
                throw new Error('Сервер вернул не массив goods');
            }

            allGoods = data.goods;
            generateCategoryCheckboxes(allGoods);
            renderGoods(allGoods);
        })
        .catch((error) => {
            console.error('Ошибка при загрузке товаров:', error.message);
            showNotification(`Ошибка: ${error.message}`);
        });
}

function generateCategoryCheckboxes(goods) {
    console.log('Список товаров:', goods);

    const categories = goods.map((g) => g.main_category);
    const uniqueCategories = [...new Set(categories)];
    sidebarCategoriesContainer.innerHTML = '';

    uniqueCategories.forEach((cat) => {
        const div = document.createElement('div');
        div.classList.add('form-check', 'mb-2');
        div.innerHTML = `
      <input 
        class="form-check-input" 
        type="checkbox" 
        id="cat_${cat}" 
        name="category" 
        value="${cat}"
      />
      <label class="form-check-label" for="cat_${cat}">
        ${cat}
      </label>
    `;
        sidebarCategoriesContainer.appendChild(div);
    });
}

function renderGoods(goods) {
    goodsContainer.innerHTML = '';

    if (!goods || goods.length === 0) {
        goodsContainer.innerHTML = '<p class="text-center">Нет товаров</p>';
        return;
    }

    goods.forEach((item) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        const priceBlock = item.discount_price
            ? `<span class="text-danger fw-bold me-2">${item.discount_price} ₽</span>
         <span class="text-muted text-decoration-line-through">${item.actual_price} ₽</span>`
            : `<span class="fw-bold">${item.actual_price} ₽</span>`;

        col.innerHTML = `
      <div class="card h-100 shadow-sm d-flex flex-column">
        <!-- Если вы используете фиксированный размер, 
             замените class="card-img-top" на class="fixed-size-img" -->
        <img 
          src="${item.image_url}" 
          class="card-img-top" 
          alt="${item.name}" 
        />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${item.name}</h5>
          <p class="card-text">Рейтинг: ${item.rating}</p>
          <!-- Блок снизу (цена и кнопка) -->
          <div class="mt-auto">
            <p class="card-text">${priceBlock}</p>
            <button class="btn btn-primary" data-good-id="${item.id}">
              В корзину
            </button>
          </div>
        </div>
      </div>
    `;
        goodsContainer.appendChild(col);
    });
}

function applyFilters() {
    const checkedCats = Array.from(
        document.querySelectorAll('input[name="category"]:checked')
    ).map((input) => input.value);

    const priceFrom = parseInt(priceFromInput.value, 10);
    const priceTo = parseInt(priceToInput.value, 10);

    const discountOnly = discountOnlyCheckbox.checked;

    const sortValue = sortSelect.value;

    let filtered = allGoods.slice();

    if (checkedCats.length > 0) {
        filtered = filtered.filter((item) => checkedCats.includes(item.main_category));
    }

    if (!isNaN(priceFrom)) {
        filtered = filtered.filter((item) => {
            const finalPrice = item.discount_price > 0 ? item.discount_price : item.actual_price;
            return finalPrice >= priceFrom;
        });
    }

    if (!isNaN(priceTo)) {
        filtered = filtered.filter((item) => {
            const finalPrice = item.discount_price > 0 ? item.discount_price : item.actual_price;
            return finalPrice <= priceTo;
        });
    }

    if (discountOnly) {
        filtered = filtered.filter((item) => item.discount_price > 0);
    }

    switch (sortValue) {
        case 'price-asc':
            filtered.sort((a, b) => {
                const priceA = a.discount_price > 0 ? a.discount_price : a.actual_price;
                const priceB = b.discount_price > 0 ? b.discount_price : b.actual_price;
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            filtered.sort((a, b) => {
                const priceA = a.discount_price > 0 ? a.discount_price : a.actual_price;
                const priceB = b.discount_price > 0 ? b.discount_price : b.actual_price;
                return priceB - priceA;
            });
            break;
        case 'rating-asc':
            filtered.sort((a, b) => a.rating - b.rating);
            break;
        case 'rating-desc':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        default:
            break;
    }

    renderGoods(filtered);
}

function addToCart(goodId) {
    const id = parseInt(goodId, 10);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(id);
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification(`Товар (ID=${id}) добавлен в корзину!`);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAllGoods();
    loadMoreBtn.style.display = 'none';
});

applyFiltersBtn.addEventListener('click', () => {
    applyFilters();
});

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-good-id]');
    if (btn) {
        const goodId = btn.getAttribute('data-good-id');
        addToCart(goodId);
    }
});
