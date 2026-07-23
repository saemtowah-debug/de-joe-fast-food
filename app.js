// De Joe Fast Food - Premium Web Application Logic

let cart = [];
let searchQuery = '';
let selectedCategory = 'all';

// Menu Data with Prices in Ghanaian Cedis (GH₵)
const menuData = [
  {
    id: 1,
    name: 'De Joe Jollof Feast',
    category: 'jollof',
    price: 120.00,
    spice: '🌶️🌶️ Hot',
    img: 'assets/jollof_combo.jpg',
    desc: 'Smoky firewood Ghanaian jollof rice bowl with flame-grilled chicken leg quarter, fried sweet plantains, avocado & spicy shito.'
  },
  {
    id: 2,
    name: 'Double Bacon Smash Burger',
    category: 'burger',
    price: 85.00,
    spice: '🧀 Mild',
    img: 'assets/smash_burger.jpg',
    desc: 'Twin crispy beef patties, melted cheddar, crispy bacon, caramelized onions & signature De Joe secret sauce.'
  },
  {
    id: 3,
    name: 'Vending Loaded Fries',
    category: 'sides',
    price: 65.00,
    spice: '🌶️ Medium',
    img: 'assets/loaded_fries.jpg',
    desc: 'Golden crispy fries loaded with melted spicy cheese sauce, bacon bits, jalapenos & chopped scallions.'
  },
  {
    id: 4,
    name: 'Tropical Mango Passion Shake',
    category: 'drinks',
    price: 45.00,
    spice: '🥭 Sweet',
    img: 'assets/mango_shake.jpg',
    desc: 'Creamy tropical mango passion fruit smoothie topped with fresh mint and whipped cream peak.'
  },
  {
    id: 5,
    name: 'Flame Grilled Beef Suya',
    category: 'jollof',
    price: 105.00,
    spice: '🔥 Fire Hot',
    img: 'assets/suya_skewers.jpg',
    desc: 'Authentic tender beef suya skewers coated with peanut yaji spice, served with sliced red onions and ripe tomatoes.'
  },
  {
    id: 6,
    name: 'Honey Chili Glazed Wings',
    category: 'sides',
    price: 75.00,
    spice: '🌶️ Medium',
    img: 'assets/crispy_wings.jpg',
    desc: 'Crispy fried jumbo chicken wings glazed in sweet honey chili sauce, toasted sesame seeds & ranch dip.'
  }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderLiveMenu();
  setupSearchListener();
});

// Setup Real-time Search Listener
function setupSearchListener() {
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderLiveMenu();
    });
  }
}

// Render Menu Items Grid
function renderLiveMenu() {
  const grid = document.getElementById('live-menu-grid');
  if (!grid) return;

  let filtered = menuData;
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(item => item.category === selectedCategory);
  }

  if (searchQuery) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery) || 
      item.desc.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 50px; color: var(--color-text-muted);">No items matched your search query "${searchQuery}"</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="menu-item-card">
      <div class="card-img-wrap">
        <img src="${item.img}" class="menu-item-img" alt="${item.name}">
        <span class="badge-spice">${item.spice}</span>
      </div>
      <div class="menu-item-body">
        <div class="menu-item-header">
          <span class="menu-item-name">${item.name}</span>
        </div>
        <p class="menu-item-desc">${item.desc}</p>
        <div class="menu-item-bottom">
          <span class="vending-price">GH₵ ${item.price.toFixed(2)}</span>
          <button class="vending-btn-tap" onclick="openCustomizeModal(${item.id})">
            <i class="fa-solid fa-plus"></i> Customize & Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterLiveMenu(category, element) {
  document.querySelectorAll('.menu-chip').forEach(chip => chip.classList.remove('active'));
  element.classList.add('active');
  selectedCategory = category;
  renderLiveMenu();
}

let activeItemForModal = null;

function openCustomizeModal(itemId) {
  const item = menuData.find(i => i.id === itemId);
  if (!item) return;

  activeItemForModal = item;
  document.getElementById('modal-item-title').innerText = `Customize ${item.name}`;
  document.getElementById('modal-item-price').innerText = `GH₵ ${item.price.toFixed(2)}`;
  document.getElementById('modal-item-img').src = item.img;
  
  // Reset checkboxes
  document.getElementById('addon-1').checked = false;
  document.getElementById('addon-2').checked = false;

  document.getElementById('modal-add-btn').onclick = () => {
    let extraPrice = 0;
    if (document.getElementById('addon-1').checked) extraPrice += 35.00;
    if (document.getElementById('addon-2').checked) extraPrice += 15.00;

    addToCart(item.name, item.price + extraPrice, item.img);
    closeModal('customize-modal');
  };

  document.getElementById('customize-modal').classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function addToCart(name, price, img) {
  cart.push({ name, price, img, id: Date.now() });
  updateCartUI();
  showToast(`Added ${name} to cart!`);
}

function updateCartUI() {
  const badge = document.getElementById('live-cart-count');
  if (badge) badge.innerText = cart.length;

  const list = document.getElementById('cart-items-list');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align:center; font-size:13px; color:var(--color-text-muted); padding:30px;"><i class="fa-solid fa-basket-shopping" style="font-size:32px; margin-bottom:10px; display:block;"></i>Your vending cart is empty</div>`;
  } else {
    list.innerHTML = cart.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; border:1px solid var(--color-brand-border);">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${item.img}" style="width:48px; height:48px; border-radius:8px; object-fit:cover;">
          <div>
            <div style="font-size:14px; font-weight:700; color:#FFF;">${item.name}</div>
            <div style="font-size:12px; color:var(--color-brand-primary); font-weight:700;">GH₵ ${item.price.toFixed(2)}</div>
          </div>
        </div>
        <button style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:16px; padding:6px;" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('cart-subtotal').innerText = `GH₵ ${subtotal.toFixed(2)}`;
  document.getElementById('cart-total').innerText = `GH₵ ${subtotal.toFixed(2)}`;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
  showToast('Item removed from cart');
}

function openCartDrawer() {
  updateCartUI();
  document.getElementById('cart-modal').classList.add('open');
}

// Interactive Vending Machine Dispense Simulation
function processCheckout() {
  if (cart.length === 0) {
    showToast('Please add items to your cart first!');
    return;
  }
  closeModal('cart-modal');
  openDispenseSimulator();
}

function openDispenseSimulator() {
  const modal = document.getElementById('dispense-modal');
  if (!modal) return;

  const statusText = document.getElementById('dispense-status-text');
  const progressBar = document.getElementById('dispense-progress');
  const codeBox = document.getElementById('dispense-code');
  
  const pin = 'DJ-' + Math.floor(1000 + Math.random() * 9000);
  if (codeBox) codeBox.innerText = pin;

  modal.classList.add('open');
  let step = 0;
  
  const steps = [
    { text: 'Verifying QR Voucher & Payment...', pct: 25 },
    { text: 'Heating Vending Chamber to 78°C...', pct: 50 },
    { text: 'Dispensing items to Kiosk Slot A1...', pct: 85 },
    { text: 'Order Dispensed! Pick up at Station Door.', pct: 100 }
  ];

  const interval = setInterval(() => {
    if (step < steps.length) {
      if (statusText) statusText.innerText = steps[step].text;
      if (progressBar) progressBar.style.width = steps[step].pct + '%';
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        closeModal('dispense-modal');
        // Render order voucher modal
        openVoucherModal(pin);
        cart = [];
        updateCartUI();
      }, 1200);
    }
  }, 900);
}

// Open Voucher Modal with Pickup PIN & QR
function openVoucherModal(pin) {
  const modal = document.getElementById('voucher-modal');
  if (modal) {
    document.getElementById('voucher-pin-display').innerText = pin;
    modal.classList.add('open');
    showToast(`Order Confirmed! PIN: ${pin}`);
  }
}

// Toast Notification Utility
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-popup';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function scrollToMenu() {
  document.getElementById('live-menu-section').scrollIntoView({ behavior: 'smooth' });
}
