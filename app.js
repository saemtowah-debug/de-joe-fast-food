// De Joe Fast Food - Figma Studio & Vending Web App Logic

let currentZoom = 1.0;
let currentMode = 'canvas';
let cart = [];
let searchQuery = '';
let selectedCategory = 'all';

// Sample Menu Data with Real High-Res Food Items
const menuData = [
  {
    id: 1,
    name: 'De Joe Jollof Feast',
    category: 'jollof',
    price: 12.00,
    spice: '🌶️🌶️ Hot',
    img: 'assets/jollof_combo.jpg',
    desc: 'Smoky firewood jollof rice bowl with flame-grilled quarter chicken leg, fried sweet plantains, avocado & spicy shito.'
  },
  {
    id: 2,
    name: 'Double Bacon Smash',
    category: 'burger',
    price: 8.50,
    spice: '🧀 Mild',
    img: 'assets/smash_burger.jpg',
    desc: 'Twin crispy beef patties, melted cheddar, crispy bacon, caramelized onions & signature De Joe secret sauce.'
  },
  {
    id: 3,
    name: 'Vending Loaded Fries',
    category: 'sides',
    price: 6.50,
    spice: '🌶️ Medium',
    img: 'assets/loaded_fries.jpg',
    desc: 'Golden crispy fries loaded with melted spicy cheese sauce, bacon bits, jalapenos & scallions.'
  },
  {
    id: 4,
    name: 'Tropical Mango Shake',
    category: 'drinks',
    price: 4.50,
    spice: '🥭 Sweet',
    img: 'assets/mango_shake.jpg',
    desc: 'Creamy tropical mango passion fruit smoothie topped with fresh mint and whipped cream peak.'
  },
  {
    id: 5,
    name: 'Flame Grilled Beef Suya',
    category: 'jollof',
    price: 10.50,
    spice: '🔥 Fire Hot',
    img: 'assets/suya_skewers.jpg',
    desc: 'Authentic tender beef suya skewers coated with peanut yaji spice, served with sliced onions and tomatoes.'
  },
  {
    id: 6,
    name: 'Honey Chili Wings',
    category: 'sides',
    price: 7.50,
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

// Switch between Figma Canvas Mode and Live App Mode
function switchViewMode(mode) {
  currentMode = mode;
  const canvasWorkspace = document.getElementById('studio-workspace');
  const liveWorkspace = document.getElementById('live-app-workspace');
  const btnCanvas = document.getElementById('btn-mode-canvas');
  const btnLive = document.getElementById('btn-mode-live');

  if (mode === 'canvas') {
    canvasWorkspace.style.display = 'flex';
    liveWorkspace.style.display = 'none';
    btnCanvas.classList.add('active');
    btnLive.classList.remove('active');
  } else {
    canvasWorkspace.style.display = 'none';
    liveWorkspace.style.display = 'block';
    btnLive.classList.add('active');
    btnCanvas.classList.remove('active');
    renderLiveMenu();
  }
}

// Zoom Controls for Figma Canvas
function adjustZoom(delta) {
  currentZoom = Math.min(Math.max(0.5, currentZoom + delta), 2.0);
  const viewport = document.getElementById('canvas-viewport');
  viewport.style.transform = `scale(${currentZoom})`;
  viewport.style.transformOrigin = 'top left';
  document.getElementById('zoom-text').innerText = `${Math.round(currentZoom * 100)}%`;
}

function resetZoom() {
  currentZoom = 1.0;
  adjustZoom(0);
}

// Select Artboard Frame in Figma Mode
function selectFrame(frameId) {
  document.querySelectorAll('.artboard-frame').forEach(frame => {
    frame.classList.remove('selected');
  });

  const selectedFrame = document.getElementById(frameId);
  if (selectedFrame) {
    selectedFrame.classList.add('selected');
    selectedFrame.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  document.querySelectorAll('.layer-list .layer-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick')?.includes(frameId)) {
      item.classList.add('active');
    }
  });
}

// Inspect Element Property Update in Right Sidebar
function inspectElement(layerName, bounds, fillHex, cssSnippet) {
  document.getElementById('inspect-layer-name').innerText = layerName;
  const [w, h] = bounds.split(' x ');
  document.getElementById('inspect-w').innerText = w + (w.includes('px') ? '' : 'px');
  document.getElementById('inspect-h').innerText = h + (h.includes('px') ? '' : 'px');
  document.getElementById('inspect-fill').innerText = fillHex;
  document.getElementById('inspect-color-preview').style.background = fillHex;
  
  document.getElementById('inspect-css-snippet').innerText = `/* CSS Specs for ${layerName} */\nwidth: ${w};\nheight: ${h};\nbackground: ${fillHex};\n${cssSnippet}`;
}

function copyCSSCode() {
  const code = document.getElementById('inspect-css-snippet').innerText;
  navigator.clipboard.writeText(code);
  showToast('CSS Specs copied to clipboard!');
}

function switchInspectorTab(tabName) {
  document.querySelectorAll('.inspector-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');

  const container = document.getElementById('inspector-content');
  if (tabName === 'tokens') {
    container.innerHTML = `
      <div class="inspect-property-group">
        <span class="prop-title">Design System Tokens</span>
        <div style="display:flex; flex-direction:column; gap:10px; font-size:12px;">
          <div><strong style="color:var(--color-brand-primary);">--color-brand-primary:</strong> #FF5500</div>
          <div><strong style="color:var(--color-brand-secondary);">--color-brand-secondary:</strong> #FFB800</div>
          <div><strong style="color:#FFF;">--color-brand-dark:</strong> #0A0A0C</div>
          <div><strong style="color:#FFF;">--color-brand-surface:</strong> #121216</div>
        </div>
      </div>
    `;
  } else if (tabName === 'export') {
    container.innerHTML = `
      <div class="inspect-property-group">
        <span class="prop-title">Export Artboard</span>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn-secondary-hero" onclick="showToast('Exporting PNG Frame...')"><i class="fa-solid fa-download"></i> Export as PNG 2x</button>
          <button class="btn-secondary-hero" onclick="showToast('Exporting SVG Vector...')"><i class="fa-solid fa-code"></i> Export SVG</button>
        </div>
      </div>
    `;
  } else {
    location.reload();
  }
}

// Live Vending App Logic with Filtering & Real-time Search
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
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--color-text-muted);">No items matched your search query "${searchQuery}"</div>`;
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
          <span class="vending-price">$${item.price.toFixed(2)}</span>
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
  document.getElementById('modal-item-price').innerText = `$${item.price.toFixed(2)}`;
  document.getElementById('modal-item-img').src = item.img;
  
  // Uncheck add-ons
  document.getElementById('addon-1').checked = false;
  document.getElementById('addon-2').checked = false;

  document.getElementById('modal-add-btn').onclick = () => {
    let extraPrice = 0;
    if (document.getElementById('addon-1').checked) extraPrice += 3.50;
    if (document.getElementById('addon-2').checked) extraPrice += 1.50;

    addToCart(item.name, item.price + extraPrice, item.img);
    closeModal('customize-modal');
  };

  document.getElementById('customize-modal').classList.add('open');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
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
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px; border-radius:10px; border:1px solid var(--color-brand-border);">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.img}" style="width:45px; height:45px; border-radius:8px; object-fit:cover;">
          <div>
            <div style="font-size:13px; font-weight:700; color:#FFF;">${item.name}</div>
            <div style="font-size:11px; color:var(--color-brand-primary); font-weight:700;">$${item.price.toFixed(2)}</div>
          </div>
        </div>
        <button style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:14px; padding:6px;" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById('cart-total').innerText = `$${subtotal.toFixed(2)}`;
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
  
  // Show Interactive Dispense Simulator Modal
  openDispenseSimulator();
}

function openDispenseSimulator() {
  const modal = document.getElementById('dispense-modal');
  if (!modal) {
    // Fallback if modal not present
    switchViewMode('canvas');
    selectFrame('frame-cart');
    return;
  }

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
    { text: 'Dispensing items to Slot A1...', pct: 85 },
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
        cart = [];
        updateCartUI();
        switchViewMode('canvas');
        selectFrame('frame-cart');
        showToast('Voucher DJ-8492 Ready on Frame 04!');
      }, 1500);
    }
  }, 1000);
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
