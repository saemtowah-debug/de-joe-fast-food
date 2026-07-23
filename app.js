// De Joe Fast Food - Figma Studio & Vending Web App Logic

let currentZoom = 1.0;
let currentMode = 'canvas';
let cart = [];

// Sample Menu Data
const menuData = [
  {
    id: 1,
    name: 'De Joe Jollof Feast',
    category: 'jollof',
    price: 12.00,
    spice: '🌶️🌶️ Hot',
    img: 'assets/jollof_combo.jpg',
    desc: 'Smoky firewood jollof rice bowl with flame-grilled quarter chicken leg, fried sweet plantains & spicy shito.'
  },
  {
    id: 2,
    name: 'Double Bacon Smash',
    category: 'burger',
    price: 8.50,
    spice: '🧀 Mild',
    img: 'assets/smash_burger.jpg',
    desc: 'Twin crispy beef patties, melted cheddar, crispy bacon, house pickles, & signature De Joe secret sauce.'
  },
  {
    id: 3,
    name: 'Vending Loaded Fries',
    category: 'sides',
    price: 6.50,
    spice: '🌶️ Medium',
    img: 'assets/loaded_fries.jpg',
    desc: 'Golden crispy fries loaded with melted cheese sauce, sliced jalapenos, bacon bits & paprika.'
  },
  {
    id: 4,
    name: 'Tropical Mango Shake',
    category: 'drinks',
    price: 4.50,
    spice: '🥭 Sweet',
    img: 'assets/mango_shake.jpg',
    desc: 'Creamy tropical mango passion fruit smoothie topped with fresh mint and whipped cream.'
  }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderLiveMenu(menuData);
});

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

  // Highlight layer in left sidebar
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
  alert('CSS Specs copied to clipboard!');
}

function switchInspectorTab(tabName) {
  document.querySelectorAll('.inspector-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');

  const container = document.getElementById('inspector-content');
  if (tabName === 'tokens') {
    container.innerHTML = `
      <div class="inspect-property-group">
        <span class="prop-title">Design Tokens</span>
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
          <button class="btn-secondary-hero" onclick="alert('Exporting PNG Frame...')"><i class="fa-solid fa-download"></i> Export as PNG 2x</button>
          <button class="btn-secondary-hero" onclick="alert('Exporting SVG Vector...')"><i class="fa-solid fa-code"></i> Export SVG</button>
        </div>
      </div>
    `;
  } else {
    location.reload(); // reset inspect view
  }
}

// Live Vending App Logic
function renderLiveMenu(items) {
  const grid = document.getElementById('live-menu-grid');
  grid.innerHTML = items.map(item => `
    <div class="menu-item-card">
      <img src="${item.img}" class="menu-item-img" alt="${item.name}">
      <div class="menu-item-body">
        <div class="menu-item-header">
          <span class="menu-item-name">${item.name}</span>
          <span class="spice-tag">${item.spice}</span>
        </div>
        <p class="menu-item-desc">${item.desc}</p>
        <div class="menu-item-bottom">
          <span class="vending-price">$${item.price.toFixed(2)}</span>
          <button class="vending-btn-tap" onclick="openCustomizeModal('${item.name}', ${item.price}, '${item.img}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterLiveMenu(category, element) {
  document.querySelectorAll('.menu-chip').forEach(chip => chip.classList.remove('active'));
  element.classList.add('active');

  if (category === 'all') {
    renderLiveMenu(menuData);
  } else {
    const filtered = menuData.filter(i => i.category === category);
    renderLiveMenu(filtered);
  }
}

let activeItemForModal = null;

function openCustomizeModal(name, price, img) {
  activeItemForModal = { name, price, img };
  document.getElementById('modal-item-title').innerText = `Customize ${name}`;
  document.getElementById('modal-item-price').innerText = `$${price.toFixed(2)}`;
  document.getElementById('modal-item-img').src = img;

  document.getElementById('modal-add-btn').onclick = () => {
    let extraPrice = 0;
    if (document.getElementById('addon-1').checked) extraPrice += 3.50;
    if (document.getElementById('addon-2').checked) extraPrice += 1.50;

    addToCart(name, price + extraPrice, img);
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
}

function updateCartUI() {
  document.getElementById('live-cart-count').innerText = cart.length;

  const list = document.getElementById('cart-items-list');
  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align:center; font-size:13px; color:var(--color-text-muted); padding:20px;">Your cart is empty</div>`;
  } else {
    list.innerHTML = cart.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px; border-radius:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.img}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
          <div>
            <div style="font-size:13px; font-weight:700; color:#FFF;">${item.name}</div>
            <div style="font-size:11px; color:var(--color-brand-primary);">$${item.price.toFixed(2)}</div>
          </div>
        </div>
        <button style="background:none; border:none; color:#EF4444; cursor:pointer;" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
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
}

function openCartDrawer() {
  updateCartUI();
  document.getElementById('cart-modal').classList.add('open');
}

function processCheckout() {
  if (cart.length === 0) {
    alert('Please add items to your cart first!');
    return;
  }
  closeModal('cart-modal');
  switchViewMode('canvas');
  selectFrame('frame-cart');
  alert('Order Placed Successfully! Your pickup voucher QR code and PIN (DJ-8492) are ready on Design Frame 04.');
}

function scrollToMenu() {
  document.getElementById('live-menu-section').scrollIntoView({ behavior: 'smooth' });
}
