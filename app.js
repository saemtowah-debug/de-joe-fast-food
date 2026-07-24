// AEGIS - De Joe Fast Food Online Ordering System Logic (DCIT 208 Brief v1.1)

// Application State Store
let state = {
  currentUser: { role: 'customer', name: 'Kofi Mensah', email: 'kofi@example.com', loggedIn: true },
  activePortal: 'customer', // 'customer' | 'vendor' | 'rider'
  customerTab: 'menu',      // 'menu' | 'checkout' | 'confirmation' | 'tracking' | 'history' | 'rate'
  vendorTab: 'orders',      // 'orders' | 'menu-config' | 'riders' | 'sales'
  riderTab: 'assigned',     // 'assigned' | 'history' | 'scan'
  
  // Menu Configuration (Managed by Vendor)
  menuConfig: {
    jollofAvailable: true,
    friedRiceAvailable: true,
    deliveryFee: 20.00,
    condiments: {
      salad: true,
      mayo: true,
      ketchup: true
    }
  },

  // Customer Cart
  cart: {
    dish: 'fried_rice', // 'fried_rice' | 'jollof'
    proteinType: 'included', // 'included' | 'none'
    condiments: { salad: true, mayo: true, ketchup: false },
    extras: { egg: 0, chicken: 1 },
    fulfillment: 'delivery', // 'delivery' | 'pickup'
    address: 'Block B, Apt 4, Dome Pillar 2, Accra',
    notes: 'Please call when at the gate.'
  },

  // System Orders Database
  orders: [
    {
      id: 'DJ-8492',
      customerName: 'Kofi Mensah',
      customerPhone: '+233 24 123 4567',
      dish: 'Smoky Firewood Jollof Rice',
      protein: 'Standard Quarter Chicken',
      condiments: ['Salad', 'Mayo'],
      extras: [{ name: 'Fried Egg', qty: 1, price: 10.00 }],
      fulfillment: 'delivery',
      address: 'Block B, Apt 4, Dome Pillar 2, Accra',
      notes: 'Please call when at the gate.',
      subtotal: 95.00,
      deliveryFee: 20.00,
      total: 115.00,
      status: 'Dispatched', // 'Pending' | 'Accepted' | 'Preparing' | 'Dispatched' | 'Delivered' | 'Cancelled'
      rejectionReason: '',
      riderId: 1,
      riderName: 'Kwame Osei',
      createdAt: '12:35 PM Today',
      rating: null,
      review: ''
    },
    {
      id: 'DJ-7104',
      customerName: 'Ama Serwaa',
      customerPhone: '+233 20 987 6543',
      dish: 'Special Fried Rice',
      protein: 'No Default Protein',
      condiments: ['Salad', 'Ketchup'],
      extras: [{ name: 'Grilled Chicken Quarter', qty: 1, price: 35.00 }],
      fulfillment: 'pickup',
      address: '',
      notes: 'Extra shito sauce please.',
      subtotal: 95.00,
      deliveryFee: 0.00,
      total: 95.00,
      status: 'Preparing',
      rejectionReason: '',
      riderId: null,
      riderName: '',
      createdAt: '12:48 PM Today',
      rating: null,
      review: ''
    }
  ],

  // Registered Riders
  riders: [
    { id: 1, name: 'Kwame Osei', phone: '+233 55 444 3322', active: true },
    { id: 2, name: 'Emmanuel Tetteh', phone: '+233 27 888 9900', active: true }
  ],

  // Current Tracking Order ID
  trackingOrderId: 'DJ-8492'
};

// Pricing Constants
const PRICES = {
  fried_rice: 60.00,
  jollof: 70.00,
  egg: 10.00,
  chicken: 35.00
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  setInterval(refreshLiveOrderFeeds, 15000);
});

// Portal & Tab Switcher
function switchPortal(portal) {
  state.activePortal = portal;
  renderApp();
  showToast(`Switched to ${portal.toUpperCase()} View`);
}

function switchCustomerTab(tab) {
  state.customerTab = tab;
  renderApp();
}

function switchVendorTab(tab) {
  state.vendorTab = tab;
  renderApp();
}

function switchRiderTab(tab) {
  state.riderTab = tab;
  renderApp();
}

// Master Render Function
function renderApp() {
  document.querySelectorAll('.portal-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.portal === state.activePortal);
  });

  const mainContainer = document.getElementById('aegis-app-root');
  if (!mainContainer) return;

  if (state.activePortal === 'customer') {
    renderCustomerPortal(mainContainer);
  } else if (state.activePortal === 'vendor') {
    renderVendorPortal(mainContainer);
  } else if (state.activePortal === 'rider') {
    renderRiderPortal(mainContainer);
  }
}

/* ============================================================ */
/* 1. CUSTOMER PORTAL                                           */
/* ============================================================ */
function renderCustomerPortal(container) {
  let subtotal = getCartSubtotal();
  let total = subtotal + (state.cart.fulfillment === 'delivery' ? state.menuConfig.deliveryFee : 0);

  container.innerHTML = `
    <nav class="portal-nav">
      <div class="nav-brand">
        <img src="assets/logo.jpg" alt="Logo">
        <div>
          <div class="brand-title">DE JOE FAST FOOD</div>
          <div class="brand-sub">Dome, Accra • Online Ordering</div>
        </div>
      </div>
      <div class="nav-tabs">
        <button class="nav-tab ${state.customerTab === 'menu' ? 'active' : ''}" onclick="switchCustomerTab('menu')">
          <i class="fa-solid fa-utensils"></i> Menu & Cart
        </button>
        <button class="nav-tab ${state.customerTab === 'checkout' ? 'active' : ''}" onclick="switchCustomerTab('checkout')">
          <i class="fa-solid fa-credit-card"></i> Checkout
        </button>
        <button class="nav-tab ${state.customerTab === 'tracking' ? 'active' : ''}" onclick="switchCustomerTab('tracking')">
          <i class="fa-solid fa-location-dot"></i> Live Tracking
        </button>
        <button class="nav-tab ${state.customerTab === 'history' ? 'active' : ''}" onclick="switchCustomerTab('history')">
          <i class="fa-solid fa-clock-rotate-left"></i> Order History
        </button>
      </div>
    </nav>

    <div class="portal-body">
      ${getCustomerTabHTML(subtotal, total)}
    </div>
  `;
}

function getCustomerTabHTML(subtotal, total) {
  if (state.customerTab === 'menu') {
    return renderC1MenuAndCart(subtotal, total);
  } else if (state.customerTab === 'checkout') {
    return renderC4Checkout(subtotal, total);
  } else if (state.customerTab === 'confirmation') {
    return renderC5Confirmation();
  } else if (state.customerTab === 'tracking') {
    return renderC6OrderTracking();
  } else if (state.customerTab === 'history') {
    return renderC7OrderHistory();
  } else if (state.customerTab === 'rate') {
    return renderC8RateAndReview();
  }
  return '';
}

// Menu, Build & Cart
function renderC1MenuAndCart(subtotal, total) {
  const isJollofAvailable = state.menuConfig.jollofAvailable;

  return `
    <!-- Hero Banner for Customer App -->
    <section class="hero-banner">
      <div class="hero-content">
        <div class="hero-badge">
          <i class="fa-solid fa-fire-flame-curved"></i> DOME, ACCRA BEST STREET FOOD
        </div>
        <h1 class="hero-title">Authentic Ghanaian Cuisine, Delivered Fresh.</h1>
        <p class="hero-subtitle">Savour our signature Smoky Firewood Jollof & Special Wok Fried Rice with tender grilled chicken and custom condiments.</p>
        <div class="hero-features">
          <div class="hero-feature-item"><i class="fa-solid fa-clock"></i> 20-30 Min Delivery</div>
          <div class="hero-feature-item"><i class="fa-solid fa-shield-halved"></i> Paystack Secured</div>
          <div class="hero-feature-item"><i class="fa-solid fa-star"></i> 4.9 Star Rating</div>
        </div>
      </div>
    </section>

    <div class="page-header">
      <h2>Build Your Meal & Cart</h2>
      <p>Select your dish, customize free condiments, and add extra proteins.</p>
    </div>

    <div class="c1-grid">
      <div class="c1-menu-column">
        
        <div class="card-section">
          <h3 class="card-section-title"><i class="fa-solid fa-bowl-rice"></i> 1. Choose Main Dish</h3>
          <div class="dishes-grid">
            
            <div class="dish-card ${state.cart.dish === 'fried_rice' ? 'selected' : ''}" onclick="selectCartDish('fried_rice')">
              <img src="assets/fried_rice.jpg" alt="Fried Rice">
              <div class="dish-card-body">
                <div class="dish-header">
                  <span class="dish-name">Special Fried Rice</span>
                  <span class="dish-price">GH₵ ${PRICES.fried_rice.toFixed(2)}</span>
                </div>
                <p class="dish-desc">Wok-fried savoury rice with fresh garden veggies and spices.</p>
                <span class="badge-stock in-stock"><i class="fa-solid fa-check"></i> Always Available</span>
              </div>
            </div>

            <div class="dish-card ${!isJollofAvailable ? 'sold-out' : (state.cart.dish === 'jollof' ? 'selected' : '')}" 
                 onclick="${isJollofAvailable ? "selectCartDish('jollof')" : ''}">
              <img src="assets/jollof_combo.jpg" alt="Firewood Jollof">
              <div class="dish-card-body">
                <div class="dish-header">
                  <span class="dish-name">Smoky Firewood Jollof</span>
                  <span class="dish-price">GH₵ ${PRICES.jollof.toFixed(2)}</span>
                </div>
                <p class="dish-desc">Authentic Ghanaian firewood Jollof rice prepared daily by vendor.</p>
                ${isJollofAvailable ? 
                  `<span class="badge-stock in-stock"><i class="fa-solid fa-fire"></i> Freshly Cooked Today</span>` : 
                  `<span class="badge-stock sold-out-tag"><i class="fa-solid fa-ban"></i> Sold Out Today</span>`
                }
              </div>
            </div>

          </div>
        </div>

        <div class="card-section">
          <h3 class="card-section-title"><i class="fa-solid fa-drumstick-bite"></i> 2. Protein Choice</h3>
          <div class="protein-choice-box">
            <label class="radio-option">
              <input type="radio" name="proteinType" value="included" ${state.cart.proteinType === 'included' ? 'checked' : ''} onchange="setProteinType('included')">
              <div>
                <strong>Standard Quarter Chicken (Included)</strong>
                <div style="font-size:12px; color:var(--color-text-secondary);">Included in dish base price</div>
              </div>
            </label>
            <label class="radio-option">
              <input type="radio" name="proteinType" value="none" ${state.cart.proteinType === 'none' ? 'checked' : ''} onchange="setProteinType('none')">
              <div>
                <strong>No Default Protein</strong>
                <div style="font-size:12px; color:var(--color-brand-secondary);">Base price remains the same</div>
              </div>
            </label>
          </div>
        </div>

        <div class="card-section">
          <h3 class="card-section-title"><i class="fa-solid fa-pepper-hot"></i> 3. Free Condiments</h3>
          <div class="condiments-grid">
            ${renderCondimentCheckbox('salad', 'Fresh Salad 🥗')}
            ${renderCondimentCheckbox('mayo', 'Creamy Mayo 🍶')}
            ${renderCondimentCheckbox('ketchup', 'Tomato Ketchup 🍅')}
          </div>
        </div>

        <div class="card-section">
          <h3 class="card-section-title"><i class="fa-solid fa-plus"></i> 4. Paid Extra Add-ons</h3>
          <div class="extras-list">
            
            <div class="extra-item-row">
              <div class="extra-info">
                <strong>Extra Fried Egg (+GH₵ ${PRICES.egg.toFixed(2)})</strong>
              </div>
              <div class="qty-control">
                <button onclick="changeExtraQty('egg', -1)">-</button>
                <span>${state.cart.extras.egg}</span>
                <button onclick="changeExtraQty('egg', 1)">+</button>
              </div>
            </div>

            <div class="extra-item-row">
              <div class="extra-info">
                <strong>Extra Grilled Chicken Quarter (+GH₵ ${PRICES.chicken.toFixed(2)})</strong>
              </div>
              <div class="qty-control">
                <button onclick="changeExtraQty('chicken', -1)">-</button>
                <span>${state.cart.extras.chicken}</span>
                <button onclick="changeExtraQty('chicken', 1)">+</button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div class="c1-cart-column">
        <div class="cart-sticky-card">
          <h3 class="cart-title"><i class="fa-solid fa-cart-shopping"></i> Order Summary</h3>
          
          <div class="cart-line-item">
            <div>
              <strong>${state.cart.dish === 'jollof' ? 'Smoky Firewood Jollof' : 'Special Fried Rice'}</strong>
              <div class="cart-subtext">Protein: ${state.cart.proteinType === 'included' ? 'Quarter Chicken Included' : 'No Default Protein'}</div>
              <div class="cart-subtext">Condiments: ${getSelectedCondimentsList().join(', ') || 'None'}</div>
            </div>
            <div class="cart-price">GH₵ ${(state.cart.dish === 'jollof' ? PRICES.jollof : PRICES.fried_rice).toFixed(2)}</div>
          </div>

          ${state.cart.extras.egg > 0 ? `
            <div class="cart-line-item">
              <div>${state.cart.extras.egg}x Extra Fried Egg</div>
              <div class="cart-price">GH₵ ${(state.cart.extras.egg * PRICES.egg).toFixed(2)}</div>
            </div>
          ` : ''}

          ${state.cart.extras.chicken > 0 ? `
            <div class="cart-line-item">
              <div>${state.cart.extras.chicken}x Extra Chicken Quarter</div>
              <div class="cart-price">GH₵ ${(state.cart.extras.chicken * PRICES.chicken).toFixed(2)}</div>
            </div>
          ` : ''}

          <div class="cart-divider"></div>

          <div class="cart-total-row">
            <span>Running Subtotal:</span>
            <span class="total-amount">GH₵ ${subtotal.toFixed(2)}</span>
          </div>

          <button class="btn-checkout-hero" onclick="proceedToCheckout()">
            Proceed to Checkout <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCondimentCheckbox(key, label) {
  const isAvailable = state.menuConfig.condiments[key];
  const isChecked = state.cart.condiments[key] && isAvailable;

  return `
    <label class="condiment-box ${!isAvailable ? 'disabled' : ''}">
      <input type="checkbox" ${isChecked ? 'checked' : ''} ${!isAvailable ? 'disabled' : ''} onchange="toggleCondiment('${key}', this.checked)">
      <span>${label} ${!isAvailable ? '(Out of Stock)' : ''}</span>
    </label>
  `;
}

function selectCartDish(dish) {
  state.cart.dish = dish;
  renderApp();
}

function setProteinType(type) {
  state.cart.proteinType = type;
  renderApp();
}

function toggleCondiment(key, checked) {
  state.cart.condiments[key] = checked;
  renderApp();
}

function changeExtraQty(key, delta) {
  state.cart.extras[key] = Math.max(0, state.cart.extras[key] + delta);
  renderApp();
}

function getSelectedCondimentsList() {
  const list = [];
  if (state.cart.condiments.salad && state.menuConfig.condiments.salad) list.push('Salad');
  if (state.cart.condiments.mayo && state.menuConfig.condiments.mayo) list.push('Mayo');
  if (state.cart.condiments.ketchup && state.menuConfig.condiments.ketchup) list.push('Ketchup');
  return list;
}

function getCartSubtotal() {
  let dishPrice = state.cart.dish === 'jollof' ? PRICES.jollof : PRICES.fried_rice;
  let extrasPrice = (state.cart.extras.egg * PRICES.egg) + (state.cart.extras.chicken * PRICES.chicken);
  return dishPrice + extrasPrice;
}

function proceedToCheckout() {
  state.customerTab = 'checkout';
  renderApp();
}

// Checkout & Payment
function renderC4Checkout(subtotal, total) {
  const isDelivery = state.cart.fulfillment === 'delivery';

  return `
    <div class="page-header">
      <h2>Checkout & Payment</h2>
      <p>Select delivery or pickup, enter notes, and complete payment via Paystack.</p>
    </div>

    <div class="checkout-layout">
      <div class="checkout-form-card">
        
        <h3 class="form-title"><i class="fa-solid fa-truck-ramp-box"></i> Fulfillment Method</h3>
        <div class="fulfillment-toggle">
          <button class="toggle-btn ${isDelivery ? 'active' : ''}" onclick="setFulfillment('delivery')">
            <i class="fa-solid fa-motorcycle"></i> Home Delivery
          </button>
          <button class="toggle-btn ${!isDelivery ? 'active' : ''}" onclick="setFulfillment('pickup')">
            <i class="fa-solid fa-store"></i> Counter Pickup
          </button>
        </div>

        ${isDelivery ? `
          <div class="form-group">
            <label class="form-label">Delivery Address (Dome, Accra)</label>
            <input type="text" class="form-input" id="delivery-address-input" value="${state.cart.address}" oninput="state.cart.address = this.value">
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label">${isDelivery ? 'Delivery Notes (Instructions for rider)' : 'Note to Vendor (Special instructions)'}</label>
          <textarea class="form-input" rows="3" oninput="state.cart.notes = this.value">${state.cart.notes}</textarea>
        </div>

        <h3 class="form-title" style="margin-top:24px;"><i class="fa-solid fa-lock"></i> Payment Method (Paystack)</h3>
        <div class="payment-method-selector">
          <label class="radio-option">
            <input type="radio" name="paymethod" checked>
            <div>
              <strong>MTN Mobile Money / Telecel Cash / Card</strong>
              <div style="font-size:12px; color:var(--color-text-secondary);">Secure instant payment via Paystack Ghana</div>
            </div>
          </label>
        </div>

      </div>

      <div class="checkout-summary-card">
        <h3 class="form-title"><i class="fa-solid fa-receipt"></i> Order Summary</h3>
        
        <div class="cart-line-item">
          <span>Dish Base</span>
          <span>GH₵ ${(state.cart.dish === 'jollof' ? PRICES.jollof : PRICES.fried_rice).toFixed(2)}</span>
        </div>

        ${state.cart.extras.egg > 0 ? `
          <div class="cart-line-item">
            <span>Extra Egg (${state.cart.extras.egg}x)</span>
            <span>GH₵ ${(state.cart.extras.egg * PRICES.egg).toFixed(2)}</span>
          </div>
        ` : ''}

        ${state.cart.extras.chicken > 0 ? `
          <div class="cart-line-item">
            <span>Extra Chicken (${state.cart.extras.chicken}x)</span>
            <span>GH₵ ${(state.cart.extras.chicken * PRICES.chicken).toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="cart-line-item">
          <span>Subtotal</span>
          <span>GH₵ ${subtotal.toFixed(2)}</span>
        </div>

        ${isDelivery ? `
          <div class="cart-line-item highlight-fee">
            <span>Delivery Fee</span>
            <span>GH₵ ${state.menuConfig.deliveryFee.toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="cart-divider"></div>

        <div class="cart-total-row">
          <span>Total Amount</span>
          <span class="total-amount">GH₵ ${total.toFixed(2)}</span>
        </div>

        <button class="btn-paystack" onclick="simulatePaystackPayment(${subtotal}, ${total})">
          <i class="fa-solid fa-shield-halved"></i> Pay GH₵ ${total.toFixed(2)} Now
        </button>
      </div>
    </div>
  `;
}

function setFulfillment(type) {
  state.cart.fulfillment = type;
  renderApp();
}

function simulatePaystackPayment(subtotal, total) {
  if (state.cart.fulfillment === 'delivery' && !state.cart.address.trim()) {
    showToast('Please enter your delivery address');
    return;
  }

  showToast('Connecting to Paystack Ghana Gateway...');
  
  setTimeout(() => {
    const newId = 'DJ-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: newId,
      customerName: state.currentUser.name,
      customerPhone: '+233 24 123 4567',
      dish: state.cart.dish === 'jollof' ? 'Smoky Firewood Jollof' : 'Special Fried Rice',
      protein: state.cart.proteinType === 'included' ? 'Quarter Chicken Included' : 'No Default Protein',
      condiments: getSelectedCondimentsList(),
      extras: [],
      fulfillment: state.cart.fulfillment,
      address: state.cart.fulfillment === 'delivery' ? state.cart.address : '',
      notes: state.cart.notes,
      subtotal: subtotal,
      deliveryFee: state.cart.fulfillment === 'delivery' ? state.menuConfig.deliveryFee : 0,
      total: total,
      status: 'Pending',
      rejectionReason: '',
      riderId: null,
      riderName: '',
      createdAt: 'Just now',
      rating: null,
      review: ''
    };

    if (state.cart.extras.egg > 0) newOrder.extras.push({ name: 'Fried Egg', qty: state.cart.extras.egg, price: PRICES.egg });
    if (state.cart.extras.chicken > 0) newOrder.extras.push({ name: 'Extra Chicken Quarter', qty: state.cart.extras.chicken, price: PRICES.chicken });

    state.orders.unshift(newOrder);
    state.trackingOrderId = newId;
    state.customerTab = 'confirmation';
    renderApp();
  }, 1200);
}

// Order Confirmation
function renderC5Confirmation() {
  const order = state.orders.find(o => o.id === state.trackingOrderId) || state.orders[0];

  return `
    <div class="confirmation-card">
      <div class="conf-icon"><i class="fa-solid fa-circle-check"></i></div>
      <h2>Payment Successful & Order Confirmed!</h2>
      <p>Your order <strong>#${order.id}</strong> has been sent to De Joe Fast Food vendor dashboard.</p>

      <div class="conf-details-box">
        <div class="conf-row"><span>Order Number:</span> <strong>#${order.id}</strong></div>
        <div class="conf-row"><span>Item Ordered:</span> <strong>${order.dish}</strong></div>
        <div class="conf-row"><span>Fulfillment:</span> <strong>${order.fulfillment === 'delivery' ? 'Home Delivery' : 'Counter Pickup'}</strong></div>
        <div class="conf-row"><span>Total Amount Paid:</span> <strong>GH₵ ${order.total.toFixed(2)}</strong></div>
        <div class="conf-row"><span>Initial Status:</span> <span class="badge-status status-pending">Pending Vendor Acceptance</span></div>
      </div>

      <div style="display:flex; gap:14px; justify-content:center; margin-top:20px;">
        <button class="btn-primary-hero" onclick="switchCustomerTab('tracking')"><i class="fa-solid fa-location-dot"></i> Track Order Live</button>
        <button class="btn-secondary-hero" onclick="switchCustomerTab('menu')"><i class="fa-solid fa-arrow-left"></i> Back to Menu</button>
      </div>
    </div>
  `;
}

// Order Status & Live Tracking
function renderC6OrderTracking() {
  const order = state.orders.find(o => o.id === state.trackingOrderId) || state.orders[0];
  if (!order) return '<div class="page-header"><h2>No Active Order Found</h2></div>';

  const isDelivery = order.fulfillment === 'delivery';

  return `
    <div class="page-header">
      <h2>Live Order Tracking (#${order.id})</h2>
      <p>Real-time status updates from De Joe kitchen and delivery rider.</p>
    </div>

    <div class="tracking-layout">
      <div class="timeline-card">
        <h3 class="card-section-title"><i class="fa-solid fa-route"></i> Order Progression</h3>
        
        ${order.status === 'Cancelled' ? `
          <div class="cancellation-alert">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>Order Rejected / Cancelled by Vendor</strong>
              <div style="font-size:13px; margin-top:4px;">Reason: ${order.rejectionReason || 'Vendor unavailable or out of stock'}</div>
            </div>
          </div>
        ` : `
          <div class="timeline-stepper">
            ${renderTimelineStep('Pending', '1. Pending Vendor', order.status)}
            ${renderTimelineStep('Accepted', '2. Order Accepted', order.status)}
            ${renderTimelineStep('Preparing', '3. Kitchen Cooking', order.status)}
            ${isDelivery ? renderTimelineStep('Dispatched', '4. Dispatched with Rider', order.status) : ''}
            ${renderTimelineStep('Delivered', '5. Delivered / Collected', order.status)}
          </div>
        `}

        <div style="margin-top:24px; font-size:13px; color:var(--color-text-secondary);">
          ${order.riderName ? `<div><i class="fa-solid fa-motorcycle"></i> Assigned Rider: <strong>${order.riderName}</strong></div>` : ''}
          <div><i class="fa-solid fa-clock"></i> Placed At: ${order.createdAt}</div>
        </div>
      </div>

      <div class="qr-pass-card">
        ${isDelivery && order.status === 'Dispatched' ? `
          <div class="qr-pass-active">
            <h3 style="color:#FFF; font-size:16px; margin-bottom:8px;">DISPATCH QR CODE</h3>
            <p style="font-size:12px; color:var(--color-brand-secondary); margin-bottom:16px;">Show this QR Code to your Rider upon arrival to confirm delivery</p>
            <div class="qr-box-img">
              <i class="fa-solid fa-qrcode" style="font-size:110px; color:#121216;"></i>
            </div>
            <div class="fallback-pin-box">
              <span style="font-size:11px; color:#666;">MANUAL VERIFICATION PIN</span>
              <div style="font-size:26px; font-weight:800; color:var(--color-brand-primary); font-family:var(--font-mono);">${order.id}</div>
            </div>
          </div>
        ` : ''}

        ${!isDelivery ? `
          <div class="pickup-counter-pass">
            <i class="fa-solid fa-store" style="font-size:48px; color:var(--color-brand-secondary); margin-bottom:12px;"></i>
            <h3>Counter Pickup Pass</h3>
            <p style="font-size:13px; color:var(--color-text-secondary); margin:8px 0;">Present Order ID <strong>#${order.id}</strong> at De Joe Fast Food Counter, Dome Accra.</p>
            <div class="fallback-pin-box">
              <div style="font-size:22px; font-weight:800; color:#FFF; font-family:var(--font-mono);">${order.id}</div>
            </div>
          </div>
        ` : ''}

        ${order.status === 'Delivered' ? `
          <div style="text-align:center; padding:20px;">
            <i class="fa-solid fa-circle-check" style="font-size:48px; color:#10B981; margin-bottom:12px;"></i>
            <h3>Order Delivered!</h3>
            <p style="font-size:13px; color:var(--color-text-secondary); margin-bottom:16px;">Hope you enjoyed your meal from De Joe Fast Food.</p>
            <button class="btn-primary-hero" onclick="switchCustomerTab('rate')"><i class="fa-solid fa-star"></i> Rate & Review Order</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderTimelineStep(stepKey, label, currentStatus) {
  const statuses = ['Pending', 'Accepted', 'Preparing', 'Dispatched', 'Delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  const stepIndex = statuses.indexOf(stepKey);

  let stateClass = '';
  if (stepIndex < currentIndex) stateClass = 'completed';
  else if (stepIndex === currentIndex) stateClass = 'active';

  return `
    <div class="timeline-step ${stateClass}">
      <div class="step-icon">
        ${stateClass === 'completed' ? '<i class="fa-solid fa-check"></i>' : (stepIndex + 1)}
      </div>
      <div class="step-label">${label}</div>
    </div>
  `;
}

// Order History
function renderC7OrderHistory() {
  return `
    <div class="page-header">
      <h2>Order History</h2>
      <p>View your past & present orders placed at De Joe Fast Food.</p>
    </div>

    <div class="orders-history-list">
      ${state.orders.map(order => `
        <div class="history-order-card">
          <div class="hoc-header">
            <div>
              <strong>Order #${order.id}</strong>
              <div style="font-size:12px; color:var(--color-text-secondary);">${order.createdAt}</div>
            </div>
            <span class="badge-status status-${order.status.toLowerCase()}">${order.status}</span>
          </div>

          <div class="hoc-body">
            <div><strong>${order.dish}</strong> (${order.protein})</div>
            <div style="font-size:12px; color:var(--color-text-muted);">${order.fulfillment === 'delivery' ? 'Delivery to: ' + order.address : 'Counter Pickup'}</div>
            <div class="hoc-price">GH₵ ${order.total.toFixed(2)}</div>
          </div>

          <div class="hoc-footer">
            <button class="btn-secondary-hero" onclick="trackSpecificOrder('${order.id}')"><i class="fa-solid fa-location-dot"></i> View Tracking</button>
            ${order.status === 'Delivered' ? `
              <button class="btn-primary-hero" style="font-size:12px; padding:6px 14px;" onclick="rateSpecificOrder('${order.id}')">
                <i class="fa-solid fa-star"></i> ${order.rating ? 'Rated (' + order.rating + '★)' : 'Rate Order'}
              </button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function trackSpecificOrder(id) {
  state.trackingOrderId = id;
  state.customerTab = 'tracking';
  renderApp();
}

function rateSpecificOrder(id) {
  state.trackingOrderId = id;
  state.customerTab = 'rate';
  renderApp();
}

// Rate & Review
function renderC8RateAndReview() {
  const order = state.orders.find(o => o.id === state.trackingOrderId) || state.orders[0];

  return `
    <div class="rate-card">
      <div class="page-header" style="text-align:center;">
        <h2>Rate Your Meal (#${order.id})</h2>
        <p>How was your food from De Joe Fast Food?</p>
      </div>

      <div class="star-rating-picker" id="star-picker">
        <i class="fa-solid fa-star" onclick="setStarRating(1)"></i>
        <i class="fa-solid fa-star" onclick="setStarRating(2)"></i>
        <i class="fa-solid fa-star" onclick="setStarRating(3)"></i>
        <i class="fa-solid fa-star" onclick="setStarRating(4)"></i>
        <i class="fa-solid fa-star" onclick="setStarRating(5)"></i>
      </div>

      <div class="form-group" style="margin-top:20px;">
        <label class="form-label">Feedback / Comments (Optional)</label>
        <textarea class="form-input" rows="4" id="review-comment-input" placeholder="Tell the vendor about the taste, portion size, and delivery speed...">${order.review || ''}</textarea>
      </div>

      <button class="btn-primary-hero" style="width:100%; margin-top:20px;" onclick="submitOrderRating('${order.id}')">
        Submit Rating & Review
      </button>
    </div>
  `;
}

let selectedStars = 5;
function setStarRating(n) {
  selectedStars = n;
  const stars = document.querySelectorAll('#star-picker i');
  stars.forEach((star, index) => {
    star.style.color = index < n ? 'var(--color-brand-secondary)' : 'var(--color-text-muted)';
  });
}

function submitOrderRating(id) {
  const order = state.orders.find(o => o.id === id);
  if (order) {
    order.rating = selectedStars;
    order.review = document.getElementById('review-comment-input')?.value || '';
    showToast(`Thank you! Submitted ${selectedStars}★ review for #${id}`);
    state.customerTab = 'history';
    renderApp();
  }
}

/* ============================================================ */
/* 2. VENDOR DASHBOARD PORTAL                                   */
/* ============================================================ */
function renderVendorPortal(container) {
  container.innerHTML = `
    <nav class="portal-nav vendor-theme">
      <div class="nav-brand">
        <img src="assets/logo.jpg" alt="Logo">
        <div>
          <div class="brand-title">DE JOE VENDOR DASHBOARD</div>
          <div class="brand-sub">Owner Mission Control • Kitchen & Kiosk Management</div>
        </div>
      </div>
      <div class="nav-tabs">
        <button class="nav-tab ${state.vendorTab === 'orders' ? 'active' : ''}" onclick="switchVendorTab('orders')">
          <i class="fa-solid fa-list-check"></i> Orders Queue
        </button>
        <button class="nav-tab ${state.vendorTab === 'menu-config' ? 'active' : ''}" onclick="switchVendorTab('menu-config')">
          <i class="fa-solid fa-sliders"></i> Menu & Stock Controls
        </button>
        <button class="nav-tab ${state.vendorTab === 'riders' ? 'active' : ''}" onclick="switchVendorTab('riders')">
          <i class="fa-solid fa-motorcycle"></i> Rider Pool
        </button>
        <button class="nav-tab ${state.vendorTab === 'sales' ? 'active' : ''}" onclick="switchVendorTab('sales')">
          <i class="fa-solid fa-chart-line"></i> Sales Summary
        </button>
      </div>
    </nav>

    <div class="portal-body">
      ${getVendorTabHTML()}
    </div>
  `;
}

function getVendorTabHTML() {
  if (state.vendorTab === 'orders') return renderV2OrdersQueue();
  if (state.vendorTab === 'menu-config') return renderV4MenuConfig();
  if (state.vendorTab === 'riders') return renderV5RiderManagement();
  if (state.vendorTab === 'sales') return renderV6SalesSummary();
  return '';
}

// Vendor Orders Queue & Order Controls
function renderV2OrdersQueue() {
  return `
    <div class="page-header">
      <h2>Active Orders Queue</h2>
      <p>Manage kitchen workflow. Orders proceed: Pending → Accepted → Preparing → Dispatched → Delivered.</p>
    </div>

    <div class="vendor-orders-list">
      ${state.orders.map(order => `
        <div class="vendor-order-card ${order.status === 'Pending' ? 'new-pending-alert' : ''}">
          
          <div class="voc-header">
            <div>
              <span class="voc-order-id">#${order.id}</span>
              <span class="voc-customer">${order.customerName} (${order.customerPhone})</span>
            </div>
            <span class="badge-status status-${order.status.toLowerCase()}">${order.status}</span>
          </div>

          <div class="voc-body">
            <div class="voc-dish-name"><strong>${order.dish}</strong> (${order.protein})</div>
            
            <div class="voc-options-list">
              <div><strong>Condiments:</strong> ${order.condiments.join(', ') || 'None'}</div>
              ${order.extras.length > 0 ? `<div><strong>Extras:</strong> ${order.extras.map(e => e.name + ' (x' + e.qty + ')').join(', ')}</div>` : ''}
              <div><strong>Fulfillment:</strong> ${order.fulfillment === 'delivery' ? '🛵 Delivery: ' + order.address : '🏪 Counter Pickup'}</div>
              ${order.notes ? `<div><strong>Notes:</strong> <em>"${order.notes}"</em></div>` : ''}
            </div>

            <div class="voc-total">Total: GH₵ ${order.total.toFixed(2)}</div>
          </div>

          <div class="voc-controls">
            ${renderVendorStatusActions(order)}
          </div>

        </div>
      `).join('')}
    </div>
  `;
}

function renderVendorStatusActions(order) {
  if (order.status === 'Pending') {
    return `
      <button class="btn-action btn-accept" onclick="updateOrderStatus('${order.id}', 'Accepted')"><i class="fa-solid fa-check"></i> Accept Order</button>
      <button class="btn-action btn-reject" onclick="promptRejectOrder('${order.id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
    `;
  } else if (order.status === 'Accepted') {
    return `
      <button class="btn-action btn-prep" onclick="updateOrderStatus('${order.id}', 'Preparing')"><i class="fa-solid fa-fire"></i> Start Preparing</button>
    `;
  } else if (order.status === 'Preparing') {
    if (order.fulfillment === 'delivery') {
      return `
        <div style="display:flex; gap:10px; align-items:center; width:100%;">
          <select class="form-input" style="padding:6px; font-size:12px;" id="rider-select-${order.id}">
            <option value="">-- Assign Rider --</option>
            ${state.riders.filter(r => r.active).map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
          </select>
          <button class="btn-action btn-dispatch" onclick="dispatchOrderWithRider('${order.id}')"><i class="fa-solid fa-motorcycle"></i> Dispatch</button>
        </div>
      `;
    } else {
      return `
        <button class="btn-action btn-collected" onclick="updateOrderStatus('${order.id}', 'Delivered')"><i class="fa-solid fa-hand-holding-hand"></i> Mark Collected (Pickup)</button>
      `;
    }
  } else if (order.status === 'Dispatched') {
    return `
      <div style="font-size:12px; color:var(--color-brand-secondary);"><i class="fa-solid fa-clock"></i> Dispatched with ${order.riderName}. Waiting for Rider Door QR Scan.</div>
    `;
  } else if (order.status === 'Delivered') {
    return `<div style="font-size:12px; color:#10B981;"><i class="fa-solid fa-check-double"></i> Delivered & Completed</div>`;
  } else if (order.status === 'Cancelled') {
    return `<div style="font-size:12px; color:#EF4444;"><i class="fa-solid fa-circle-xmark"></i> Order Rejected</div>`;
  }
}

function updateOrderStatus(id, newStatus) {
  const order = state.orders.find(o => o.id === id);
  if (order) {
    order.status = newStatus;
    showToast(`Order #${id} updated to ${newStatus}`);
    renderApp();
  }
}

function promptRejectOrder(id) {
  const reason = prompt('Enter rejection reason for customer (e.g. Out of stock):');
  if (reason) {
    const order = state.orders.find(o => o.id === id);
    if (order) {
      order.status = 'Cancelled';
      order.rejectionReason = reason;
      showToast(`Order #${id} Rejected`);
      renderApp();
    }
  }
}

function dispatchOrderWithRider(id) {
  const select = document.getElementById(`rider-select-${id}`);
  const riderId = select ? parseInt(select.value) : null;

  if (!riderId) {
    showToast('Please select a rider from the dropdown first');
    return;
  }

  const rider = state.riders.find(r => r.id === riderId);
  const order = state.orders.find(o => o.id === id);

  if (order && rider) {
    order.riderId = rider.id;
    order.riderName = rider.name;
    order.status = 'Dispatched';
    showToast(`Dispatched #${id} to Rider ${rider.name}`);
    renderApp();
  }
}

// Menu & Stock Configuration
function renderV4MenuConfig() {
  const isJollofOn = state.menuConfig.jollofAvailable;

  return `
    <div class="page-header">
      <h2>Menu & Stock Configuration</h2>
      <p>Toggle daily dishes, update condiment availability, and set delivery fees.</p>
    </div>

    <div class="config-grid">
      
      <div class="config-card hero-toggle-card">
        <h3>🔥 Daily Jollof Master Switch</h3>
        <p style="font-size:13px; color:var(--color-text-secondary); margin:8px 0 16px 0;">
          Flip Jollof ON when cooked. When turned OFF, Jollof shows as "Sold Out" on customer app.
        </p>
        <button class="btn-jollof-switch ${isJollofOn ? 'on' : 'off'}" onclick="toggleDailyJollof()">
          <i class="fa-solid fa-power-off"></i> Jollof Availability: <strong>${isJollofOn ? 'ON (AVAILABLE)' : 'OFF (SOLD OUT)'}</strong>
        </button>
      </div>

      <div class="config-card">
        <h3>🥗 Free Condiments Stock</h3>
        <div class="stock-toggle-list">
          <label class="toggle-row">
            <span>Fresh Salad</span>
            <input type="checkbox" ${state.menuConfig.condiments.salad ? 'checked' : ''} onchange="toggleCondimentStock('salad', this.checked)">
          </label>
          <label class="toggle-row">
            <span>Creamy Mayo</span>
            <input type="checkbox" ${state.menuConfig.condiments.mayo ? 'checked' : ''} onchange="toggleCondimentStock('mayo', this.checked)">
          </label>
          <label class="toggle-row">
            <span>Tomato Ketchup</span>
            <input type="checkbox" ${state.menuConfig.condiments.ketchup ? 'checked' : ''} onchange="toggleCondimentStock('ketchup', this.checked)">
          </label>
        </div>
      </div>

      <div class="config-card">
        <h3>🛵 Delivery Fee Configuration</h3>
        <div class="form-group">
          <label class="form-label">Delivery Fee (GH₵)</label>
          <input type="number" class="form-input" value="${state.menuConfig.deliveryFee}" onchange="state.menuConfig.deliveryFee = parseFloat(this.value) || 0; showToast('Delivery Fee Updated!'); renderApp();">
        </div>
      </div>

    </div>
  `;
}

function toggleDailyJollof() {
  state.menuConfig.jollofAvailable = !state.menuConfig.jollofAvailable;
  showToast(`Daily Jollof set to ${state.menuConfig.jollofAvailable ? 'ON' : 'OFF'}`);
  renderApp();
}

function toggleCondimentStock(key, value) {
  state.menuConfig.condiments[key] = value;
  showToast(`Condiment ${key.toUpperCase()} availability updated`);
  renderApp();
}

// Rider Management
function renderV5RiderManagement() {
  return `
    <div class="page-header">
      <h2>Rider Pool Management</h2>
      <p>Manage delivery riders available for dispatch assignment.</p>
    </div>

    <div class="riders-list">
      ${state.riders.map(r => `
        <div class="rider-row">
          <div>
            <strong>${r.name}</strong>
            <div style="font-size:12px; color:var(--color-text-secondary);">${r.phone}</div>
          </div>
          <label class="toggle-row">
            <span>Active Status:</span>
            <input type="checkbox" ${r.active ? 'checked' : ''} onchange="r.active = this.checked; showToast('Rider status updated'); renderApp();">
          </label>
        </div>
      `).join('')}
    </div>
  `;
}

// Sales Summary
function renderV6SalesSummary() {
  const completedOrders = state.orders.filter(o => o.status === 'Delivered');
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);

  return `
    <div class="page-header">
      <h2>Daily Sales Book & Summary</h2>
      <p>Digital accounting book for De Joe Fast Food Dome, Accra.</p>
    </div>

    <div class="sales-hero-card">
      <span class="stat-label">TOTAL DELIVERED SALES TODAY</span>
      <div class="sales-total-display">GH₵ ${totalSales.toFixed(2)}</div>
      <div style="font-size:13px; color:var(--color-brand-secondary); margin-top:6px;">Completed Orders: ${completedOrders.length}</div>
    </div>

    <div class="orders-history-list" style="margin-top:24px;">
      ${completedOrders.map(o => `
        <div class="history-order-card">
          <div class="hoc-header">
            <span>#${o.id} - ${o.customerName}</span>
            <span class="hoc-price">GH₵ ${o.total.toFixed(2)}</span>
          </div>
          <div style="font-size:13px; color:var(--color-text-secondary);">${o.dish} • ${o.createdAt}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================================ */
/* 3. RIDER PORTAL                                              */
/* ============================================================ */
function renderRiderPortal(container) {
  container.innerHTML = `
    <nav class="portal-nav rider-theme">
      <div class="nav-brand">
        <img src="assets/logo.jpg" alt="Logo">
        <div>
          <div class="brand-title">DE JOE RIDER WORKSPACE</div>
          <div class="brand-sub">Rider: Kwame Osei • Delivery Scanner</div>
        </div>
      </div>
      <div class="nav-tabs">
        <button class="nav-tab ${state.riderTab === 'assigned' ? 'active' : ''}" onclick="switchRiderTab('assigned')">
          <i class="fa-solid fa-motorcycle"></i> Assigned Jobs
        </button>
        <button class="nav-tab ${state.riderTab === 'scan' ? 'active' : ''}" onclick="switchRiderTab('scan')">
          <i class="fa-solid fa-qrcode"></i> Scan QR Confirm
        </button>
      </div>
    </nav>

    <div class="portal-body">
      ${getRiderTabHTML()}
    </div>
  `;
}

function getRiderTabHTML() {
  if (state.riderTab === 'assigned') return renderR3AssignedJobs();
  if (state.riderTab === 'scan') return renderR4ScanConfirm();
  return '';
}

function renderR3AssignedJobs() {
  const assigned = state.orders.filter(o => o.status === 'Dispatched' && o.fulfillment === 'delivery');

  return `
    <div class="page-header">
      <h2>Assigned Deliveries</h2>
      <p>Active dispatched deliveries assigned to you.</p>
    </div>

    ${assigned.length === 0 ? `
      <div class="empty-state-card">
        <i class="fa-solid fa-circle-check" style="font-size:48px; color:var(--color-brand-secondary); margin-bottom:12px;"></i>
        <h3>No Assigned Deliveries Right Now</h3>
        <p style="font-size:13px; color:var(--color-text-muted);">You will see new dispatched orders here once assigned by the vendor.</p>
      </div>
    ` : `
      <div class="rider-jobs-list">
        ${assigned.map(job => `
          <div class="rider-job-card">
            <div class="rjc-header">
              <strong>Order #${job.id}</strong>
              <span class="badge-status status-dispatched">Dispatched</span>
            </div>
            
            <div class="rjc-body">
              <div><strong>Customer:</strong> ${job.customerName} (${job.customerPhone})</div>
              <div><strong>Address:</strong> ${job.address}</div>
              <div><strong>Notes:</strong> <em>"${job.notes}"</em></div>
              <div style="margin-top:8px;"><strong>Meal:</strong> ${job.dish}</div>
            </div>

            <button class="btn-primary-hero" style="width:100%; margin-top:14px;" onclick="openRiderScanFor('${job.id}')">
              <i class="fa-solid fa-camera"></i> Scan Customer QR Code at Door
            </button>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function openRiderScanFor(id) {
  state.trackingOrderId = id;
  state.riderTab = 'scan';
  renderApp();
}

// Scan-to-Confirm Delivery
function renderR4ScanConfirm() {
  return `
    <div class="page-header">
      <h2>Scan-to-Confirm Delivery</h2>
      <p>Scan the QR Code on the customer's phone to complete delivery (or enter fallback PIN).</p>
    </div>

    <div class="scanner-card">
      <div class="camera-preview-sim">
        <i class="fa-solid fa-qrcode scanner-icon fa-beat-fade"></i>
        <div class="scanner-line"></div>
        <div class="cam-text">Camera Active - Point at Customer Phone</div>
      </div>

      <div class="scanner-fallback-box">
        <h4>OR Enter Manual Fallback PIN</h4>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <input type="text" class="form-input" id="manual-pin-input" placeholder="e.g. DJ-8492" value="${state.trackingOrderId || ''}">
          <button class="btn-primary-hero" onclick="verifyManualPin()"><i class="fa-solid fa-check"></i> Verify</button>
        </div>
      </div>
    </div>
  `;
}

function verifyManualPin() {
  const pin = document.getElementById('manual-pin-input')?.value.trim();
  if (!pin) {
    showToast('Please enter an order PIN');
    return;
  }

  const order = state.orders.find(o => o.id === pin);
  if (order) {
    order.status = 'Delivered';
    showToast(`Order #${pin} Verified & Delivered Successfully!`);
    state.riderTab = 'assigned';
    renderApp();
  } else {
    showToast(`Order #${pin} not found or invalid`);
  }
}

// Silent Refresh Function for Live Orders
function refreshLiveOrderFeeds() {
  if (state.activePortal === 'vendor' || state.customerTab === 'tracking') {
    renderApp();
  }
}

// Toast Notification System
function showToast(msg) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-popup';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
