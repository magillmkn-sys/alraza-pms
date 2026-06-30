// Pharmacy Management System - Main JS Logic (Updated with Optional Tax, Phone Search & PDF Download)
// Current System Date simulation: 2026-06-29

const TRANSLATIONS = {
  ur: {
    login_title: "لاگ ان کیجیے",
    login_subtitle: "فارمیسی پورٹل تک رسائی کے لیے لاگ ان کریں",
    lbl_username: "یوزر نیم (Username)",
    lbl_password: "پاس ورڈ (Password)",
    btn_login: "لاگ ان کریں",
    test_users_title: "ٹیسٹ لاگ ان معلومات (For Testing)",
    brand_name: "Al-Raza PMS",
    nav_dashboard: "ڈیش بورڈ",
    nav_pos: "پوائنٹ آف سیل (POS)",
    nav_inventory: "اسٹاک اور انوینٹری",
    nav_suppliers: "سپلائر اور خریداری",
    nav_khata: "کسٹمر کھاتہ",
    nav_ledger: "کیش لیجر (اکاؤنٹس)",
    nav_users: "ملازمین (Users)",
    nav_logout: "لاگ آؤٹ",
    btn_reset: "ڈیٹا ری سیٹ",
    title_dashboard: "ڈیش بورڈ کارکردگی",
    title_pos: "پوائنٹ آف سیل (POS) بلنگ",
    title_inventory: "اسٹاک اور انوینٹری ریکارڈز",
    title_suppliers: "خریداری اور سپلائر لیجر",
    title_khata: "کسٹمر کھاتہ اور ادھار لیجر",
    title_ledger: "کیش لیجر (آئیٹم وار کھاتہ)",
    title_users: "ملازمین کے اکاؤنٹس کی مینجمنٹ"
  },
  en: {
    login_title: "Login to System",
    login_subtitle: "Enter credentials to access pharmacy portal",
    lbl_username: "Username",
    lbl_password: "Password",
    btn_login: "Login Now",
    test_users_title: "Test Login Credentials (For Testing)",
    brand_name: "Al-Raza PMS",
    nav_dashboard: "Dashboard",
    nav_pos: "Point of Sale (POS)",
    nav_inventory: "Stock & Inventory",
    nav_suppliers: "Suppliers & Purchases",
    nav_khata: "Khata (Customers)",
    nav_ledger: "Cash Ledger",
    nav_users: "Employees (Users)",
    nav_logout: "Logout",
    btn_reset: "Reset Data",
    title_dashboard: "Dashboard Analytics",
    title_pos: "Point of Sale (POS) Billing",
    title_inventory: "Stock & Inventory Records",
    title_suppliers: "Purchases & Supplier Ledger",
    title_khata: "Customer Credit & Ledger (Khata)",
    title_ledger: "Cash Ledger (Accounts)",
    title_users: "Employee Accounts Management"
  }
};

class PharmacyApp {
  constructor() {
    this.currentUser = null;
    this.cart = [];
    this.activeTab = 'dashboard';
    this.currentLanguage = 'ur';
    
    // Core Collections
    this.users = [];
    this.inventory = [];
    this.suppliers = [];
    this.customers = [];
    this.sales = [];
    this.ledger = [];
    this.purchases = [];
    this.expenseCategories = [];
    this.pendingImports = [];
    this.lastSale = null;

    // Seeding base financials:
    this.baseCashBalance = 15000.00;
    this.baseBankBalance = 400000.00;
    this.simulatedCurrentDate = new Date("2026-06-29");
  }

  init() {
    this.loadFromDB();
    this.setLanguage(this.currentLanguage);

    const savedUser = sessionStorage.getItem('pms_logged_in_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showApp();
    } else {
      this.showLogin();
    }
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    document.body.dir = lang === 'ur' ? 'rtl' : 'ltr';
    if (lang === 'ur') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.innerText = TRANSLATIONS[lang][key];
      }
    });

    const usernameInput = document.getElementById('login-username');
    if (usernameInput) {
      usernameInput.placeholder = lang === 'ur' ? 'username' : 'Enter username';
    }

    const btnUr = document.getElementById('lang-btn-ur');
    const btnEn = document.getElementById('lang-btn-en');
    if (btnUr && btnEn) {
      if (lang === 'ur') {
        btnUr.style.fontWeight = 'bold';
        btnUr.style.color = 'var(--primary)';
        btnEn.style.fontWeight = 'normal';
        btnEn.style.color = 'var(--text-muted)';
      } else {
        btnEn.style.fontWeight = 'bold';
        btnEn.style.color = 'var(--primary)';
        btnUr.style.fontWeight = 'normal';
        btnUr.style.color = 'var(--text-muted)';
      }
    }

    const titleEl = document.getElementById('current-tab-title');
    if (titleEl) {
      const key = `title_${this.activeTab}`;
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        titleEl.innerText = TRANSLATIONS[lang][key];
      }
    }
    
    const d = this.simulatedCurrentDate;
    if (lang === 'ur') {
      const days = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
      const months = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
      document.getElementById('header-date').innerText = `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } else {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById('header-date').innerText = d.toLocaleDateString('en-US', options);
    }
  }

  loadFromDB() {
    this.users = window.PMS_DB.get('users', []);
    this.inventory = window.PMS_DB.get('inventory', []);
    this.suppliers = window.PMS_DB.get('suppliers', []);
    this.customers = window.PMS_DB.get('customers', []);
    this.sales = window.PMS_DB.get('sales', []);
    this.ledger = window.PMS_DB.get('ledger', []);
    this.purchases = window.PMS_DB.get('purchases', []);
    this.expenseCategories = window.PMS_DB.get('expense_categories', ['Electricity Bill', 'Rent', 'Salaries', 'Refreshment', 'Other']);
    this.pendingImports = window.PMS_DB.get('pending_imports', []);
  }

  saveToDB(key, data) {
    window.PMS_DB.set(key, data);
  }

  resetDB() {
    if(confirm('کیا آپ واقعی پورا ڈیٹا ری سیٹ کر کے ڈیفالٹ سیڈ ڈیٹا بحال کرنا چاہتے ہیں؟')) {
      window.PMS_DB.reset();
      this.loadFromDB();
      this.showToast('ڈیٹا کامیابی سے ری سیٹ کر دیا گیا ہے!', 'success');
      this.renderAllViews();
    }
  }

  // --- Auth Handlers ---
  handleLogin() {
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();

    const user = this.users.find(u => u.username === usernameInput && u.password === passwordInput);

    if (user) {
      if (user.status !== 'Active') {
        this.showToast('یہ اکاؤنٹ بلاک کر دیا گیا ہے!', 'danger');
        return;
      }
      this.currentUser = user;
      sessionStorage.setItem('pms_logged_in_user', JSON.stringify(user));
      this.showToast(`خوش آمدید، ${user.name}!`, 'success');
      this.showApp();
    } else {
      this.showToast('غلط یوزر نیم یا پاس ورڈ!', 'danger');
    }
  }

  handleLogout() {
    this.currentUser = null;
    sessionStorage.removeItem('pms_logged_in_user');
    this.showLogin();
  }

  showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }

  showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    
    document.getElementById('nav-user-name').innerText = this.currentUser.name;
    document.getElementById('nav-user-role').innerText = this.translateRole(this.currentUser.role);
    document.getElementById('nav-user-avatar').innerText = this.currentUser.name.charAt(0).toUpperCase();

    const expenseCatManager = document.getElementById('admin-expense-cat-manager');
    if (expenseCatManager) {
      expenseCatManager.style.display = this.currentUser.role === 'Admin' ? 'flex' : 'none';
    }

    this.applyPermissions();
    this.switchTab('dashboard');
  }

  applyPermissions() {
    const role = this.currentUser.role;
    document.getElementById('nav-pos').style.display = 'flex';
    document.getElementById('nav-inventory').style.display = 'flex';
    document.getElementById('nav-suppliers').style.display = 'flex';
    document.getElementById('nav-khata').style.display = 'flex';
    document.getElementById('nav-ledger').style.display = 'flex';
    document.getElementById('nav-users').style.display = 'flex';

    if (role === 'Cashier') {
      document.getElementById('nav-inventory').style.display = 'none';
      document.getElementById('nav-suppliers').style.display = 'none';
      document.getElementById('nav-khata').style.display = 'none';
      document.getElementById('nav-ledger').style.display = 'none';
      document.getElementById('nav-users').style.display = 'none';
    } else if (role === 'Pharmacist') {
      document.getElementById('nav-khata').style.display = 'none';
      document.getElementById('nav-ledger').style.display = 'none';
      document.getElementById('nav-users').style.display = 'none';
    }
  }

  translateRole(role) {
    switch(role) {
      case 'Admin': return 'ایڈمن (Admin)';
      case 'Pharmacist': return 'فارماسسٹ (Pharmacist)';
      case 'Cashier': return 'کیشیئر (Cashier)';
      default: return role;
    }
  }

  // --- Router / Tab Switching ---
  switchTab(tabId) {
    this.activeTab = tabId;
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-target') === tabId) {
        item.classList.add('active');
      }
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(`view-${tabId}`).classList.add('active');

    const key = `title_${tabId}`;
    const lang = this.currentLanguage || 'ur';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      document.getElementById('current-tab-title').innerText = TRANSLATIONS[lang][key];
    } else {
      document.getElementById('current-tab-title').innerText = 'System';
    }

    this.renderView(tabId);
  }

  renderAllViews() {
    this.renderView('dashboard');
    this.renderView('pos');
    this.renderView('inventory');
    this.renderView('suppliers');
    this.renderView('khata');
    this.renderView('ledger');
    this.renderView('users');
  }

  renderView(viewId) {
    switch(viewId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'pos':
        this.renderPOS();
        break;
      case 'inventory':
        this.renderInventory();
        break;
      case 'suppliers':
        this.renderSuppliers();
        break;
      case 'khata':
        this.renderKhata();
        break;
      case 'ledger':
        this.renderLedger();
        break;
      case 'users':
        this.renderUsers();
        break;
    }
  }

  // ==========================================
  // DASHBOARD VIEW
  // ==========================================
  renderDashboard() {
    const todayStr = this.simulatedCurrentDate.toISOString().split('T')[0];
    
    let todaySales = 0;
    let todayProfit = 0;

    this.sales.forEach(sale => {
      const saleDate = sale.timestamp.split('T')[0];
      if (saleDate === todayStr) {
        todaySales += sale.totals.grandTotal;
        todayProfit += sale.totals.netProfit;
      }
    });

    let expiredCount = 0;
    let lowStockCount = 0;
    let criticalAlertsHTML = '';
    let expiryAlertsHTML = '';

    this.inventory.forEach(med => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      
      if (totalStock <= med.reorderLevel) {
        lowStockCount++;
        criticalAlertsHTML += `
          <div class="alert-banner warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <span><strong>اسٹاک الرٹ:</strong> دوا <strong>${med.name}</strong> کا اسٹاک کم ہے (موجودہ: ${totalStock} گولیاں، حد: ${med.reorderLevel})</span>
          </div>
        `;
      }

      med.batches.forEach(b => {
        const expDate = new Date(b.expiryDate);
        const diffTime = expDate - this.simulatedCurrentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          expiredCount++;
          expiryAlertsHTML += `
            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-right: 4px solid var(--danger); padding: 12px; border-radius: 8px;">
              <div style="display:flex; justify-content:space-between; font-weight: 600; font-size:0.9rem;">
                <span style="color: var(--danger);">${med.name}</span>
                <span>بیچ: ${b.batchNumber}</span>
              </div>
              <div style="font-size:0.8rem; color: var(--text-muted); margin-top:4px; display:flex; justify-content:space-between;">
                <span>ایکسپائر ہو چکی ہے!</span>
                <span style="color: var(--danger); font-weight:bold;">${b.expiryDate}</span>
              </div>
              <div style="font-size:0.8rem; color: var(--text-muted); margin-top:2px;">مقدار باقی: ${b.quantity} گولیاں</div>
            </div>
          `;
        } else if (diffDays <= 90) {
          expiryAlertsHTML += `
            <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-right: 4px solid var(--warning); padding: 12px; border-radius: 8px;">
              <div style="display:flex; justify-content:space-between; font-weight: 600; font-size:0.9rem;">
                <span style="color: var(--warning);">${med.name}</span>
                <span>بیچ: ${b.batchNumber}</span>
              </div>
              <div style="font-size:0.8rem; color: var(--text-muted); margin-top:4px; display:flex; justify-content:space-between;">
                <span>قریبِ ایکسپائری (${diffDays} دن باقی)</span>
                <span style="color: var(--warning); font-weight:bold;">${b.expiryDate}</span>
              </div>
              <div style="font-size:0.8rem; color: var(--text-muted); margin-top:2px;">مقدار باقی: ${b.quantity} گولیاں</div>
            </div>
          `;
        }
      });
    });

    document.getElementById('stat-sales').innerText = `Rs ${todaySales.toFixed(2)}`;
    document.getElementById('stat-profit').innerText = `Rs ${todayProfit.toFixed(2)}`;
    document.getElementById('stat-expired').innerText = expiredCount;
    document.getElementById('stat-low-stock').innerText = lowStockCount;
    document.getElementById('dashboard-critical-alerts').innerHTML = criticalAlertsHTML;

    document.getElementById('dash-expiry-alerts-list').innerHTML = expiryAlertsHTML || `
      <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>تمام ادویات محفوظ اور کارآمد ہیں!</p>
      </div>
    `;

    let recentSalesHTML = '';
    const sortedSales = [...this.sales].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    
    sortedSales.forEach(s => {
      const time = new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const itemsCount = s.items.reduce((sum, i) => sum + i.quantity, 0);
      recentSalesHTML += `
        <tr>
          <td><strong style="color: var(--primary)">${s.invoiceNumber}</strong></td>
          <td>${s.customer.name || 'Walk-in Customer'}</td>
          <td>${time}</td>
          <td>${itemsCount} یونٹس</td>
          <td><strong>Rs ${s.totals.grandTotal.toFixed(2)}</strong></td>
          <td><span class="badge badge-success">${s.payment.method}</span></td>
        </tr>
      `;
    });
    
    document.getElementById('dash-recent-sales').innerHTML = recentSalesHTML || `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">کوئی سیل ٹرانزیکشن نہیں پائی گئی</td>
      </tr>
    `;

    const targetSales = 10000;
    const weeklySalesSum = this.sales.reduce((sum, s) => sum + s.totals.grandTotal, 0);
    const pct = Math.min(Math.round((weeklySalesSum / targetSales) * 100), 100);
    document.getElementById('sales-progress-label').innerText = `Rs ${weeklySalesSum.toFixed(0)} حاصل شدہ (${pct}%)`;
    document.getElementById('sales-progress-bar').style.width = `${pct}%`;
  }

  // ==========================================
  // POS (POINT OF SALE) VIEW
  // ==========================================
  renderPOS() {
    this.populatePOSCustomersDropdown();
    this.filterCategory('All');
    this.renderCart();
  }

  populatePOSCustomersDropdown() {
    const select = document.getElementById('pos-customer-select');
    let options = '<option value="">-- عام کسٹمر (Walk-in Customer) --</option>';
    this.customers.forEach(c => {
      const warningText = c.currentOutstanding > 0 ? ` (ادھار بقایا: Rs ${c.currentOutstanding.toFixed(0)})` : '';
      options += `<option value="${c.customerId}">${c.name} [${c.category}]${warningText}</option>`;
    });
    select.innerHTML = options;
  }

  searchCustomerByPhone() {
    const query = document.getElementById('pos-customer-search-phone').value.trim();
    const select = document.getElementById('pos-customer-select');
    
    if (!query) return;

    // Find customer whose phone contains the query
    const match = this.customers.find(c => c.phone.replace(/[\s-+]/g, '').includes(query));
    if (match) {
      select.value = match.customerId;
      this.handlePOSCustomerSelect();
    }
  }

  handlePOSCustomerSelect() {
    const custId = document.getElementById('pos-customer-select').value;
    const nameInput = document.getElementById('pos-customer-name');
    const phoneInput = document.getElementById('pos-customer-phone');
    const taxIdInput = document.getElementById('checkout-customer-tax-id');
    const prevBalLabel = document.getElementById('pos-summary-prev-balance');

    if (custId) {
      const cust = this.customers.find(c => c.customerId === custId);
      if (cust) {
        nameInput.value = cust.name;
        phoneInput.value = cust.phone;
        if (taxIdInput) {
          taxIdInput.value = cust.cnic || cust.ntn || '';
        }
        if (prevBalLabel) {
          prevBalLabel.innerText = `Rs ${cust.currentOutstanding.toFixed(2)}`;
        }
        this.showToast(`کھاتہ دار منتخب: ${cust.name} (${cust.category})`, 'success');
        
        if (cust.currentOutstanding > 0) {
          this.showToast(`انتباہ: گاہک پر پہلے ہی Rs ${cust.currentOutstanding.toFixed(2)} ادھار بقایا جات ہیں۔`, 'warning');
        }
      }
    } else {
      nameInput.value = '';
      phoneInput.value = '';
      if (taxIdInput) taxIdInput.value = '';
      if (prevBalLabel) prevBalLabel.innerText = 'Rs 0.00';
    }

    this.calculateCartTotals();
  }

  filterCategory(cat) {
    document.querySelectorAll('.catalog-search-area + div button').forEach(b => {
      b.classList.remove('btn-active');
      b.classList.add('btn-secondary');
    });
    
    const targetBtn = document.getElementById(`cat-${cat}`);
    if (targetBtn) {
      targetBtn.classList.remove('btn-secondary');
      targetBtn.classList.add('btn-active');
    }

    this.currentCatalogCategory = cat;
    this.filterCatalog();
  }

  filterCatalog() {
    const searchVal = document.getElementById('pos-search-input').value.toLowerCase();
    const cat = this.currentCatalogCategory || 'All';
    let html = '';

    const filtered = this.inventory.filter(med => {
      const matchSearch = med.name.toLowerCase().includes(searchVal) || 
                          med.formula.toLowerCase().includes(searchVal) ||
                          med.barcode.includes(searchVal);
      const matchCat = (cat === 'All' || med.category === cat);
      return matchSearch && matchCat;
    });

    filtered.forEach(med => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      const standardPrice = med.pricing ? med.pricing.retailPerTablet : (med.batches.length > 0 ? med.batches[0].retailPrice : 0);
      const isOutOfStock = totalStock <= 0;

      let stockColor = 'var(--text-muted)';
      if (isOutOfStock) stockColor = 'var(--danger)';
      else if (totalStock <= med.reorderLevel) stockColor = 'var(--warning)';

      html += `
        <div class="catalog-item-card" style="opacity: ${isOutOfStock ? '0.6' : '1'};">
          <div onclick="app.addToCart('${med.medicineId}')" style="cursor: pointer; flex-grow: 1;">
            <div class="catalog-item-name">${med.name}</div>
            <div class="catalog-item-formula" style="font-size:0.75rem; color: var(--text-muted);">${med.formula}</div>
            <div class="catalog-item-stock" style="color: ${stockColor}; margin-top: 4px;">اسٹاک: ${totalStock} Tabs</div>
          </div>
          <div class="catalog-item-bottom" style="display:flex; justify-content:space-between; align-items:center;">
            <span class="catalog-item-price" style="font-weight:700; color:var(--primary)">Rs ${standardPrice.toFixed(2)}/Tab</span>
            <div style="display:flex; gap: 4px;">
              <button class="btn btn-secondary" style="padding: 2px 6px; font-size:0.7rem;" onclick="app.openSubstitutesModal('${med.medicineId}')" title="متبادل تلاش کریں">متبادل</button>
              ${med.prescriptionRequired ? '<span class="badge badge-danger" style="font-size:0.6rem; padding: 2px 4px;">Rx</span>' : ''}
            </div>
          </div>
        </div>
      `;
    });

    document.getElementById('pos-catalog-grid').innerHTML = html || `
      <div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 40px 0;">
        کوئی دوا میچ نہیں ہوئی
      </div>
    `;
  }

  openSubstitutesModal(medId) {
    const med = this.inventory.find(m => m.medicineId === medId);
    if (!med) return;

    document.getElementById('substitute-formula-name').innerText = med.formula;
    
    const tbody = document.getElementById('substitute-list-tbody');
    let html = '';
    const shownBrandNames = new Set();

    // 1. List matching brands from our actual inventory first
    const inventoryMatches = this.inventory.filter(
      m => m.formula.toLowerCase().trim() === med.formula.toLowerCase().trim()
    );

    inventoryMatches.forEach(s => {
      shownBrandNames.add(s.name.toLowerCase().trim());
      const stock = s.batches.reduce((sum, b) => sum + b.quantity, 0);
      const retail = s.pricing ? s.pricing.retailPerTablet : (s.batches.length > 0 ? s.batches[0].retailPrice : 0);
      
      html += `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.brand} / ${s.category}</td>
          <td>Rs ${retail.toFixed(2)}</td>
          <td><strong style="color: ${stock<=s.reorderLevel ? 'var(--warning)' : 'inherit'}">${stock} Tabs</strong></td>
          <td>${s.rackLocation || 'Shelf'}</td>
          <td>
            <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.closeModal('modal-substitute'); app.addToCart('${s.medicineId}')">
              کارٹ میں لائیں
            </button>
          </td>
        </tr>
      `;
    });

    // 2. List matching brands from the master directory that are not in our inventory
    const dirMatches = (window.PAK_MEDICINE_DIRECTORY || []).filter(
      d => d.formula.toLowerCase().trim() === med.formula.toLowerCase().trim()
    );

    dirMatches.forEach(s => {
      if (!shownBrandNames.has(s.name.toLowerCase().trim())) {
        shownBrandNames.add(s.name.toLowerCase().trim());
        
        // Escape strings for inline JS call safely
        const escName = s.name.replace(/'/g, "\\'");
        const escFormula = s.formula.replace(/'/g, "\\'");
        const escCat = s.category.replace(/'/g, "\\'");
        const escBrand = s.brand.replace(/'/g, "\\'");

        html += `
          <tr style="opacity: 0.85; background: rgba(14, 165, 233, 0.02);">
            <td><strong>${s.name}</strong> <span style="font-size:0.7rem; color:var(--text-muted);">(ڈائریکٹری)</span></td>
            <td>${s.brand} / ${s.category}</td>
            <td>Rs ${s.retailPerTablet.toFixed(2)}</td>
            <td><span class="badge badge-danger">0 Tabs (دستیاب نہیں)</span></td>
            <td>N/A</td>
            <td>
              <button class="btn btn-success" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.bringToStock('${escName}', '${escFormula}', '${escCat}', '${escBrand}', ${s.stripsPerBox}, ${s.tabletsPerStrip}, ${s.retailPerTablet}, ${s.costPerTablet})">
                اسٹاک میں لائیں
              </button>
            </td>
          </tr>
        `;
      }
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">اس فارمولے کی متبادل کوئی دوسری دوا انوینٹری یا ڈائریکٹری میں موجود نہیں ہے</td>
      </tr>
    `;

    this.openModal('modal-substitute');
  }

  bringToStock(name, formula, category, brand, stripsPerBox, tabletsPerStrip, retailPerTablet, costPerTablet) {
    this.closeModal('modal-substitute');
    this.openAddMedicineModal();
    
    // Auto populate the edit/new medicine form
    document.getElementById('med-name').value = name;
    document.getElementById('med-brand').value = brand;
    document.getElementById('med-formula').value = formula;
    document.getElementById('med-category').value = category;
    
    document.getElementById('med-strips-box').value = stripsPerBox;
    document.getElementById('med-tablets-strip').value = tabletsPerStrip;
    document.getElementById('med-cost-tablet').value = costPerTablet;
    document.getElementById('med-retail-tablet').value = retailPerTablet;
    document.getElementById('med-retail-strip').value = (retailPerTablet * tabletsPerStrip).toFixed(2);
    document.getElementById('med-retail-box').value = (retailPerTablet * tabletsPerStrip * stripsPerBox * 0.9).toFixed(2);
    
    this.showToast(`دوا "${name}" کی تفصیلات خودکار طور پر فارم میں بھر دی گئی ہیں۔ بیچ اور سپلائر سیٹ کر کے سیو کریں۔`, 'success');
  }

  addToCart(medId) {
    const med = this.inventory.find(m => m.medicineId === medId);
    if (!med) return;

    if (med.prescriptionRequired && !this.cart.some(i => i.medicineId === medId)) {
      this.showToast(`نوٹ: دوا "${med.name}" کے لیے ڈاکٹر کا نسخہ ضروری ہے۔`, 'warning');
    }

    const existing = this.cart.find(item => item.medicineId === medId);
    const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);

    if (existing) {
      let conversion = 1;
      if (existing.unit === 'Box') conversion = med.packaging.totalTabletsPerBox;
      else if (existing.unit === 'Strip') conversion = med.packaging.tabletsPerStrip;

      if ((existing.quantity + 1) * conversion > totalStock) {
        this.showToast('اس سے زیادہ اسٹاک دستیاب نہیں ہے!', 'danger');
        return;
      }
      existing.quantity++;
    } else {
      if (totalStock <= 0) {
        this.showToast('آؤٹ آف اسٹاک!', 'danger');
        return;
      }
      this.cart.push({
        medicineId: med.medicineId,
        name: med.name,
        quantity: 1,
        unit: "Tablet",
        unitPrice: med.pricing ? med.pricing.retailPerTablet : (med.batches.length > 0 ? med.batches[0].retailPrice : 0),
        costPrice: med.pricing ? med.pricing.costPerTablet : (med.batches.length > 0 ? med.batches[0].purchasePrice : 0)
      });
    }

    this.renderCart();
    this.showToast(`${med.name} کارٹ میں شامل کر دی گئی`, 'success');
  }

  updateCartQty(medId, delta) {
    const item = this.cart.find(i => i.medicineId === medId);
    if (!item) return;

    const med = this.inventory.find(m => m.medicineId === medId);
    const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);

    let conversion = 1;
    if (item.unit === 'Box') conversion = med.packaging.totalTabletsPerBox;
    else if (item.unit === 'Strip') conversion = med.packaging.tabletsPerStrip;

    item.quantity += delta;
    if (item.quantity * conversion > totalStock) {
      this.showToast('اس سے زیادہ اسٹاک دستیاب نہیں ہے!', 'danger');
      item.quantity = Math.floor(totalStock / conversion);
    }

    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.medicineId !== medId);
    }

    this.renderCart();
  }

  changeCartUnit(medId, unit) {
    const item = this.cart.find(i => i.medicineId === medId);
    const med = this.inventory.find(m => m.medicineId === medId);
    if (!item || !med) return;

    item.unit = unit;
    
    if (unit === 'Box') {
      item.unitPrice = med.pricing ? med.pricing.retailPerBox : (med.batches.length > 0 ? med.batches[0].retailPrice * med.packaging.totalTabletsPerBox : 0);
      item.costPrice = med.pricing ? med.pricing.costPerTablet * med.packaging.totalTabletsPerBox : (med.batches.length > 0 ? med.batches[0].purchasePrice * med.packaging.totalTabletsPerBox : 0);
    } else if (unit === 'Strip') {
      item.unitPrice = med.pricing ? med.pricing.retailPerStrip : (med.batches.length > 0 ? med.batches[0].retailPrice * med.packaging.tabletsPerStrip : 0);
      item.costPrice = med.pricing ? med.pricing.costPerTablet * med.packaging.tabletsPerStrip : (med.batches.length > 0 ? med.batches[0].purchasePrice * med.packaging.tabletsPerStrip : 0);
    } else {
      item.unitPrice = med.pricing ? med.pricing.retailPerTablet : (med.batches.length > 0 ? med.batches[0].retailPrice : 0);
      item.costPrice = med.pricing ? med.pricing.costPerTablet : (med.batches.length > 0 ? med.batches[0].purchasePrice : 0);
    }

    const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
    let conversion = 1;
    if (unit === 'Box') conversion = med.packaging.totalTabletsPerBox;
    else if (unit === 'Strip') conversion = med.packaging.tabletsPerStrip;

    if (item.quantity * conversion > totalStock) {
      this.showToast('پیک سائز کے مطابق اسٹاک کافی نہیں ہے! مقدار تبدیل کر دی گئی۔', 'warning');
      item.quantity = Math.floor(totalStock / conversion);
      if (item.quantity <= 0) {
        item.quantity = 1;
      }
    }

    this.renderCart();
  }

  clearCart() {
    this.cart = [];
    this.renderCart();
    document.getElementById('pos-customer-select').value = '';
    document.getElementById('pos-customer-name').value = '';
    document.getElementById('pos-customer-phone').value = '';
    document.getElementById('pos-discount-input').value = 0;
    const prevBalLabel = document.getElementById('pos-summary-prev-balance');
    if (prevBalLabel) prevBalLabel.innerText = 'Rs 0.00';
    document.getElementById('pos-customer-search-phone').value = '';
  }

  renderCart() {
    const container = document.getElementById('pos-cart-items');
    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); margin-top: 100px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 12px;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>کارٹ خالی ہے۔ دوا شامل کرنے کے لیے بائیں جانب کلک کریں۔</p>
        </div>
      `;
      this.calculateCartTotals();
      return;
    }

    let html = '';
    this.cart.forEach(item => {
      const subtotal = item.quantity * item.unitPrice;
      html += `
        <div class="cart-item-row">
          <div class="cart-item-details">
            <span class="cart-item-name">${item.name}</span>
            <div style="display:flex; align-items:center; gap: 8px; margin-top: 4px;">
              <span class="cart-item-meta">Rs ${item.unitPrice.toFixed(2)} / </span>
              <select class="form-control" style="width: auto; padding: 2px 4px; font-size: 0.75rem; background: var(--bg-card-hover); height: auto; margin:0;" onchange="app.changeCartUnit('${item.medicineId}', this.value)">
                <option value="Tablet" ${item.unit==='Tablet'?'selected':''}>Tablet (گولی)</option>
                <option value="Strip" ${item.unit==='Strip'?'selected':''}>Strip (پتہ)</option>
                <option value="Box" ${item.unit==='Box'?'selected':''}>Box (ڈبی)</option>
              </select>
            </div>
          </div>
          <div class="cart-item-qty-actions">
            <button class="qty-btn" onclick="app.updateCartQty('${item.medicineId}', -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="app.updateCartQty('${item.medicineId}', 1)">+</button>
          </div>
          <div class="cart-item-subtotal">Rs ${subtotal.toFixed(2)}</div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.calculateCartTotals();
  }

  calculateCartTotals() {
    let subtotal = 0;
    this.cart.forEach(item => {
      subtotal += item.quantity * item.unitPrice;
    });

    const custId = document.getElementById('pos-customer-select').value;
    let autoDiscPct = 0;
    if (custId) {
      const cust = this.customers.find(c => c.customerId === custId);
      if (cust) {
        if (cust.category === 'Chronic Patient') autoDiscPct = 5.0;
        else if (cust.category === 'Doctor/Clinic') autoDiscPct = 12.0;
      }
    }

    const discInput = document.getElementById('pos-discount-input');
    let discount = parseFloat(discInput.value) || 0;
    
    if (autoDiscPct > 0 && discount === 0) {
      discount = subtotal * (autoDiscPct / 100);
      discInput.value = discount.toFixed(2);
    }

    if (discount < 0) discount = 0;
    if (discount > subtotal) discount = subtotal;

    const taxableAmount = subtotal - discount;
    
    // Optional Sales Tax logic and dynamic percentage input
    const taxToggle = document.getElementById('pos-tax-toggle');
    const taxPercentInput = document.getElementById('pos-tax-percent-input');
    
    let taxPercent = 0;
    if (taxToggle && taxToggle.checked) {
      taxPercent = parseFloat(taxPercentInput.value) || 0;
    }
    
    const tax = taxableAmount * (taxPercent / 100);
    const grandTotal = taxableAmount + tax;

    document.getElementById('pos-summary-subtotal').innerText = `Rs ${subtotal.toFixed(2)}`;
    document.getElementById('pos-summary-total').innerText = `Rs ${grandTotal.toFixed(2)}`;
    
    return { subtotal, discount, tax, taxPercent, grandTotal };
  }

  simScanner() {
    const code = prompt("بارکوڈ اسکینر کی نقل کے لیے بارکوڈ درج کریں:\n8961012345678 (Panadol)\n8961012345689 (Amoxil)\n8961012345699 (Arinac)");
    if (!code) return;

    const med = this.inventory.find(m => m.barcode === code);
    if (med) {
      this.addToCart(med.medicineId);
    } else {
      this.showToast("نامعلوم بارکوڈ! کوئی دوا نہیں ملی۔", "danger");
    }
  }

  openCheckoutModal() {
    if (this.cart.length === 0) {
      this.showToast('کارٹ خالی ہے!', 'warning');
      return;
    }
    const totals = this.calculateCartTotals();
    document.getElementById('checkout-payable-total').innerText = `Rs ${totals.grandTotal.toFixed(2)}`;
    document.getElementById('checkout-cash-received').value = Math.ceil(totals.grandTotal);
    
    const custId = document.getElementById('pos-customer-select').value;
    const taxIdInput = document.getElementById('checkout-customer-tax-id');
    if (custId && taxIdInput) {
      const cust = this.customers.find(c => c.customerId === custId);
      if (cust) {
        taxIdInput.value = cust.cnic || cust.ntn || '';
      }
    } else if (taxIdInput) {
      taxIdInput.value = '';
    }

    this.handlePaymentMethodChange();
    this.calculateChange();
    this.openModal('modal-checkout');
  }

  handlePaymentMethodChange() {
    const method = document.getElementById('checkout-method').value;
    const cashGroup = document.getElementById('group-cash-paid');
    const changeRow = document.getElementById('row-change-return');

    if (method === 'Cash') {
      cashGroup.style.display = 'block';
      changeRow.style.display = 'flex';
    } else {
      cashGroup.style.display = 'none';
      changeRow.style.display = 'none';
    }
  }

  calculateChange() {
    const totals = this.calculateCartTotals();
    const cashRec = parseFloat(document.getElementById('checkout-cash-received').value) || 0;
    const change = Math.max(0, cashRec - totals.grandTotal);
    document.getElementById('checkout-change-returned').innerText = `Rs ${change.toFixed(2)}`;
  }

  processCheckout() {
    const totals = this.calculateCartTotals();
    const paymentMethod = document.getElementById('checkout-method').value;
    const customerName = document.getElementById('pos-customer-name').value.trim() || 'Walk-in Customer';
    const customerPhone = document.getElementById('pos-customer-phone').value.trim();
    const cashRec = parseFloat(document.getElementById('checkout-cash-received').value) || 0;
    const custId = document.getElementById('pos-customer-select').value;
    const customerTaxId = document.getElementById('checkout-customer-tax-id').value.trim();

    let customerObj = null;
    let prevOutstandingBalance = 0.0;

    if (paymentMethod === 'Cash' && cashRec < totals.grandTotal) {
      this.showToast('وصول کردہ کیش کل بل سے کم ہے!', 'danger');
      return;
    }

    if (custId) {
      customerObj = this.customers.find(c => c.customerId === custId);
      if (customerObj) {
        prevOutstandingBalance = customerObj.currentOutstanding;
      }
    }

    if (paymentMethod === 'Khata') {
      if (!custId) {
        this.showToast('ادھار بل کے لیے کسٹمر منتخب کرنا لازمی ہے!', 'danger');
        return;
      }
      if (!customerObj) return;

      if (customerObj.currentOutstanding + totals.grandTotal > customerObj.creditLimit) {
        this.showToast(`بل کی منظوری نامظور! کسٹمر کی کریڈٹ حد (Rs ${customerObj.creditLimit}) سے تجاوز ہو رہا ہے۔`, 'danger');
        return;
      }
    }

    // Deduct stock FIFO
    const soldItemsWithCost = [];
    let totalCost = 0;

    for (const item of this.cart) {
      const med = this.inventory.find(m => m.medicineId === item.medicineId);
      let conversion = 1;
      if (item.unit === 'Box') conversion = med.packaging.totalTabletsPerBox;
      else if (item.unit === 'Strip') conversion = med.packaging.tabletsPerStrip;

      let tabletsToDeduct = item.quantity * conversion;
      med.batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

      for (const batch of med.batches) {
        if (tabletsToDeduct <= 0) break;
        if (batch.quantity <= 0) continue;

        const deduct = Math.min(tabletsToDeduct, batch.quantity);
        batch.quantity -= deduct;
        tabletsToDeduct -= deduct;

        soldItemsWithCost.push({
          medicineId: item.medicineId,
          batchNumber: batch.batchNumber,
          quantity: deduct,
          unit: item.unit,
          unitPrice: item.unitPrice,
          costPrice: batch.purchasePrice,
          subtotal: deduct * (item.unitPrice / conversion)
        });

        totalCost += deduct * batch.purchasePrice;
      }
      med.totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);
    }

    const now = new Date();
    const randomFbrNum = Math.floor(10000000 + Math.random() * 90000000);
    const invoiceNum = `INV-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fbrInvoiceNumber = `POS-${randomFbrNum}-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(100 + Math.random() * 900)}`;
    const fbrVerifyCode = `FBR-VERIFY-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;

    const newSale = {
      saleId: `sal_${Date.now()}`,
      invoiceNumber: invoiceNum,
      fbrInvoiceNumber: fbrInvoiceNumber,
      fbrVerificationCode: fbrVerifyCode,
      timestamp: now.toISOString(),
      cashierId: this.currentUser.userId,
      items: soldItemsWithCost,
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        taxPercent: totals.taxPercent,
        grandTotal: totals.grandTotal,
        totalCost: totalCost,
        netProfit: totals.grandTotal - totalCost - totals.tax
      },
      payment: {
        method: paymentMethod,
        amountPaid: paymentMethod === 'Cash' ? cashRec : totals.grandTotal,
        changeReturned: paymentMethod === 'Cash' ? Math.max(0, cashRec - totals.grandTotal) : 0
      },
      customer: {
        name: customerName,
        phone: customerPhone,
        id: custId,
        taxId: customerTaxId,
        previousBalance: prevOutstandingBalance
      }
    };

    this.sales.push(newSale);
    this.saveToDB('sales', this.sales);
    this.saveToDB('inventory', this.inventory);

    if (paymentMethod === 'Khata' && customerObj) {
      customerObj.currentOutstanding += totals.grandTotal;
      customerObj.ledger.push({
        transactionId: `txn_k_${Date.now()}`,
        timestamp: now.toISOString(),
        type: "Debit",
        amount: totals.grandTotal,
        referenceInvoice: invoiceNum,
        description: "ادھار خریداری بل (FBR Tax Ready)",
        performedBy: this.currentUser.userId
      });
      this.saveToDB('customers', this.customers);

      const ledgerEntry = {
        ledgerId: `led_${Date.now()}`,
        timestamp: now.toISOString(),
        type: "Inflow",
        category: "Sale (Credit)",
        account: "Receivables",
        amount: totals.grandTotal,
        referenceId: newSale.saleId,
        description: `ادھار سیل انوائس ${invoiceNum} - کسٹمر: ${customerObj.name}`,
        performedBy: this.currentUser.userId
      };
      this.ledger.push(ledgerEntry);
    } else {
      const destinationAccount = paymentMethod === 'Cash' ? 'Cash-in-Hand' : 'Bank';
      const ledgerEntry = {
        ledgerId: `led_${Date.now()}`,
        timestamp: now.toISOString(),
        type: "Inflow",
        category: "Sale",
        account: destinationAccount,
        amount: totals.grandTotal,
        referenceId: newSale.saleId,
        description: `سیل انوائس ${invoiceNum} (${destinationAccount} کھاتے میں جمع)`,
        performedBy: this.currentUser.userId
      };
      this.ledger.push(ledgerEntry);
    }

    this.saveToDB('ledger', this.ledger);
    this.lastSale = newSale;
    
    this.printReceipt(newSale);

    this.showToast('بل کامیابی سے درج ہو چکا ہے!', 'success');
    this.closeModal('modal-checkout');
    
    document.getElementById('completed-sale-wa-number').value = customerPhone ? customerPhone.replace(/[\s-+]/g, '') : '';
    this.openModal('modal-sale-complete');

    this.clearCart();
    this.renderAllViews();
  }

  downloadReceiptPDF() {
    if (!this.lastSale) return;

    // Trigger html2pdf convert on receipt-to-print element
    const element = document.getElementById('receipt-to-print');
    
    const opt = {
      margin:       0.2,
      filename:     `Invoice-${this.lastSale.invoiceNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // run conversion
    html2pdf().set(opt).from(element).save();
    this.showToast('پی ڈی ایف بل ڈاؤن لوڈنگ شروع ہو گئی ہے!', 'success');
  }

  sendReceiptViaWhatsApp() {
    if (!this.lastSale) return;

    let phone = document.getElementById('completed-sale-wa-number').value.trim();
    if (!phone) {
      this.showToast('براہ کرم واٹس ایپ نمبر درج کریں!', 'danger');
      return;
    }

    phone = phone.replace(/[\s-+]/g, '');
    if (phone.startsWith('0')) {
      phone = '92' + phone.substring(1);
    }

    let itemsStr = '';
    this.lastSale.items.forEach(item => {
      const med = this.inventory.find(m => m.medicineId === item.medicineId);
      itemsStr += `- ${med ? med.name : 'Unknown'}: ${item.quantity} ${item.unit} @ Rs ${item.unitPrice.toFixed(2)}\n`;
    });

    const isKhata = this.lastSale.payment.method === 'Khata';
    const prevBal = this.lastSale.customer.previousBalance || 0;
    const netOutstanding = prevBal + (isKhata ? this.lastSale.totals.grandTotal : 0);

    const text = `*الرازق فارمیسی (Al-Raza Pharmacy)*\n` +
                 `Developed by MAGILL\n` +
                 `---------------------------\n` +
                 `*رسید نمبر:* ${this.lastSale.invoiceNumber}\n` +
                 `*FBR ID:* ${this.lastSale.fbrInvoiceNumber}\n` +
                 `*گاہک:* ${this.lastSale.customer.name}\n` +
                 `---------------------------\n` +
                 `*آئیٹمز:*\n${itemsStr}` +
                 `---------------------------\n` +
                 `*سب ٹوٹل:* Rs ${this.lastSale.totals.subtotal.toFixed(2)}\n` +
                 `*ڈسکاؤنٹ:* Rs ${this.lastSale.totals.discount.toFixed(2)}\n` +
                 `*ٹیکس (GST):* Rs ${this.lastSale.totals.tax.toFixed(2)}\n` +
                 `*کل رقم:* Rs ${this.lastSale.totals.grandTotal.toFixed(2)}\n` +
                 `*طریقہ ادائیگی:* ${this.lastSale.payment.method}\n` +
                 `---------------------------\n` +
                 `*سابقہ بقایا:* Rs ${prevBal.toFixed(2)}\n` +
                 `*موجودہ کل بقایا:* Rs ${netOutstanding.toFixed(2)}\n` +
                 `---------------------------\n` +
                 `خریداری کا شکریہ!`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    this.closeModal('modal-sale-complete');
    this.showToast('WhatsApp پر بھیجنے کی ونڈو کھل گئی ہے!', 'success');
  }

  printReceipt(sale) {
    const printArea = document.getElementById('receipt-to-print');
    
    let itemsRows = '';
    sale.items.forEach(item => {
      const med = this.inventory.find(m => m.medicineId === item.medicineId);
      itemsRows += `
        <tr>
          <td colspan="3"><strong>${med ? med.name : 'Unknown'}</strong> [${item.batchNumber}]</td>
        </tr>
        <tr>
          <td>${item.quantity} Units (${item.unit})</td>
          <td>x ${item.unitPrice.toFixed(2)}</td>
          <td style="text-align:right">Rs ${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });

    const isKhata = sale.payment.method === 'Khata';
    const prevBal = sale.customer.previousBalance || 0;
    const currentBill = sale.totals.grandTotal;
    const netOutstanding = prevBal + (isKhata ? currentBill : 0);

    const dateStr = new Date(sale.timestamp).toLocaleString();
    printArea.innerHTML = `
      <div class="receipt-header">
        <h2 style="font-size:16px;">الرضا فارمیسی (Al-Raza Pharmacy)</h2>
        <p style="font-size:10px;">FBR POS ID: FBR-POS-LAHORE-0192</p>
        <p style="font-size:9px; font-weight:bold;">Developed by MAGILL</p>
      </div>
      <div class="receipt-line"></div>
      <div class="receipt-row" style="font-size: 10px;">
        <span>FBR انوائس نمبر:</span>
        <strong>${sale.fbrInvoiceNumber || 'N/A'}</strong>
      </div>
      <div class="receipt-row">
        <span>انوائس نمبر:</span>
        <span>${sale.invoiceNumber}</span>
      </div>
      <div class="receipt-row">
        <span>تاریخ:</span>
        <span>${dateStr}</span>
      </div>
      <div class="receipt-row">
        <span>گاہک کا نام:</span>
        <span>${sale.customer.name}</span>
      </div>
      ${sale.customer.taxId ? `
      <div class="receipt-row">
        <span>CNIC/NTN:</span>
        <span>${sale.customer.taxId}</span>
      </div>` : ''}
      <div class="receipt-line"></div>
      <table class="receipt-table">
        <thead>
          <tr>
            <th colspan="2">آئیٹم تفصیل</th>
            <th style="text-align:right">ٹوٹل</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="receipt-line"></div>
      <div class="receipt-row">
        <span>ذیلی ٹوٹل:</span>
        <span>Rs ${sale.totals.subtotal.toFixed(2)}</span>
      </div>
      <div class="receipt-row">
        <span>ڈسکاؤنٹ:</span>
        <span>Rs ${sale.totals.discount.toFixed(2)}</span>
      </div>
      <div class="receipt-row">
        <span>سیلز ٹیکس (${sale.totals.taxPercent || 0}% GST):</span>
        <span>Rs ${sale.totals.tax.toFixed(2)}</span>
      </div>
      <div class="receipt-row" style="font-size:14px; font-weight:bold;">
        <span>کل بل رقم:</span>
        <span>Rs ${sale.totals.grandTotal.toFixed(2)}</span>
      </div>
      <div class="receipt-line"></div>
      <div class="receipt-row">
        <span>پیمنٹ موڈ:</span>
        <span>${sale.payment.method}</span>
      </div>
      <div class="receipt-row" style="color:var(--warning);">
        <span>سابقہ بقایا جات:</span>
        <span>Rs ${prevBal.toFixed(2)}</span>
      </div>
      <div class="receipt-row" style="font-weight:bold; color:var(--primary);">
        <span>موجودہ کل بقایا:</span>
        <span>Rs ${netOutstanding.toFixed(2)}</span>
      </div>
      <div class="receipt-line"></div>
      <div style="text-align:center; font-size:10px; margin-bottom: 8px;">
        <span>FBR تصدیقی کوڈ:</span><br>
        <strong>${sale.fbrVerificationCode || 'N/A'}</strong>
      </div>
      <div style="text-align:center; font-size:9px; color:#555;">
        ایف بی آر ٹیکس ریڈی کمپیوٹرائزڈ رسید۔<br>
        <strong>دوبارہ تشریف لائیں۔ شکریہ!</strong>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 250);
  }

  // ==========================================
  // INVENTORY VIEW
  // ==========================================
  renderInventory() {
    const tbody = document.getElementById('inventory-list-tbody');
    let html = '';

    this.inventory.forEach(med => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      
      let badgeClass = 'badge-success';
      let statusText = 'دستیاب';
      if (totalStock === 0) {
        badgeClass = 'badge-danger';
        statusText = 'آؤٹ آف اسٹاک';
      } else if (totalStock <= med.reorderLevel) {
        badgeClass = 'badge-warning';
        statusText = 'کم اسٹاک الرٹ';
      }

      html += `
        <tr>
          <td>
            <div style="font-weight: 600;">${med.name}</div>
            ${med.prescriptionRequired ? '<span class="badge badge-danger" style="font-size:0.65rem; padding: 2px 6px;">Rx (نسخہ لازمی)</span>' : ''}
          </td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${med.formula}</td>
          <td>
            <div>${med.brand}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${med.category}</div>
          </td>
          <td><code>${med.barcode || 'N/A'}</code></td>
          <td>${med.rackLocation || 'Shelf 1'}</td>
          <td><strong style="font-size: 1.05rem;">${totalStock} Tabs</strong></td>
          <td><span class="badge ${badgeClass}">${statusText}</span></td>
          <td>${med.batches.length} بیچز</td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.openBatchesModal('${med.medicineId}')">بیچز</button>
            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.openEditMedicineModal('${med.medicineId}')">ترمیم</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="9" style="text-align: center; color: var(--text-muted);">کوئی ادویات موجود نہیں ہیں</td>
      </tr>
    `;

    this.renderExpiryReturnsSheet();
    this.renderPendingImports();
  }

  // --- CSV Import / Uploader (With Admin Approval) ---
  openImportStockModal() {
    document.getElementById('import-csv-text').value = '';
    document.getElementById('import-csv-file').value = '';
    this.openModal('modal-import-stock');
  }

  handleImportStock() {
    const textVal = document.getElementById('import-csv-text').value.trim();
    const fileEl = document.getElementById('import-csv-file');

    if (textVal) {
      this.parseAndQueueCSV(textVal);
    } else if (fileEl.files.length > 0) {
      const file = fileEl.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseAndQueueCSV(e.target.result);
      };
      reader.readAsText(file);
    } else {
      this.showToast('براہ کرم کوئی فائل منتخب کریں یا ڈیٹا پیسٹ کریں!', 'danger');
    }
  }

  parseAndQueueCSV(csvText) {
    const lines = csvText.split('\n');
    const parsed = [];

    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length >= 10 && index > 0) {
        parsed.push({
          name: parts[0]?.trim(),
          formula: parts[1]?.trim(),
          brand: parts[2]?.trim(),
          category: parts[3]?.trim(),
          barcode: parts[4]?.trim() || '',
          reorderLevel: parseInt(parts[5]) || 100,
          batchNumber: parts[6]?.trim() || `B-${Date.now().toString().slice(-4)}`,
          purchasePrice: parseFloat(parts[7]) || 1.0,
          retailPrice: parseFloat(parts[8]) || 1.25,
          quantity: parseInt(parts[9]) || 0,
          expiryDate: parts[10]?.trim() || '2028-12-31',
          defaultSupplierId: parts[11]?.trim() || 'sup_1'
        });
      }
    });

    if (parsed.length === 0) {
      this.showToast('CSV پارسنگ کے دوران کوئی ریکارڈ نہیں ملا! فارمیٹ چیک کریں۔', 'danger');
      return;
    }

    this.pendingImports = parsed;
    this.saveToDB('pending_imports', this.pendingImports);
    
    this.closeModal('modal-import-stock');
    
    if (this.currentUser.role === 'Admin') {
      this.showToast('اسٹاک امپورٹ فائل لوڈ ہو گئی ہے۔ نیچے پینل میں منظوری دیں!', 'warning');
    } else {
      this.showToast('اسٹاک فائل اپ لوڈ کر دی گئی ہے اور منظوری کے لیے ایڈمن کو بھیج دی گئی ہے۔', 'success');
    }

    this.renderAllViews();
  }

  renderPendingImports() {
    const panel = document.getElementById('pending-imports-approval-panel');
    const tbody = document.getElementById('pending-imports-tbody');

    if (this.currentUser.role === 'Admin' && this.pendingImports.length > 0) {
      panel.style.display = 'block';
      let html = '';
      
      this.pendingImports.forEach(item => {
        html += `
          <tr>
            <td><strong>${item.name}</strong> (${item.brand})</td>
            <td>${item.formula}</td>
            <td><code>${item.batchNumber}</code></td>
            <td>Rs ${item.purchasePrice.toFixed(2)}</td>
            <td>Rs ${item.retailPrice.toFixed(2)}</td>
            <td><strong style="color:var(--primary)">${item.quantity} گولیاں</strong></td>
            <td>${item.expiryDate}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } else {
      panel.style.display = 'none';
    }
  }

  approvePendingImport() {
    if (this.currentUser.role !== 'Admin') {
      this.showToast('صرف ایڈمن کو منظوری کی اجازت ہے!', 'danger');
      return;
    }

    if (confirm('کیا آپ اس امپورٹ فائل کا تمام اسٹاک منظور کر کے انوینٹری میں شامل کرنا چاہتے ہیں؟')) {
      this.pendingImports.forEach(item => {
        let med = this.inventory.find(m => m.name.toLowerCase().trim() === item.name.toLowerCase().trim());
        
        if (!med) {
          med = {
            medicineId: `med_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            name: item.name,
            brand: item.brand,
            formula: item.formula,
            category: item.category,
            barcode: item.barcode,
            reorderLevel: item.reorderLevel,
            totalQuantity: 0,
            rackLocation: 'Shelf 1',
            prescriptionRequired: false,
            packaging: {
              stripsPerBox: 10,
              tabletsPerStrip: 10,
              totalTabletsPerBox: 100
            },
            pricing: {
              costPerTablet: item.purchasePrice,
              retailPerTablet: item.retailPrice,
              retailPerStrip: item.retailPrice * 10,
              retailPerBox: item.retailPrice * 90
            },
            defaultSupplierId: item.defaultSupplierId,
            batches: []
          };
          this.inventory.push(med);
        }

        med.batches.push({
          batchNumber: item.batchNumber,
          purchasePrice: item.purchasePrice,
          retailPrice: item.retailPrice,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          receivedDate: new Date().toISOString().split('T')[0]
        });

        med.totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      });

      this.pendingImports = [];
      this.saveToDB('inventory', this.inventory);
      this.saveToDB('pending_imports', this.pendingImports);
      
      this.showToast('اسٹاک امپورٹ کامیابی سے منظور کر دیا گیا اور انوینٹری اپ ڈیٹ ہو گئی!', 'success');
      this.renderAllViews();
    }
  }

  rejectPendingImport() {
    if (this.currentUser.role !== 'Admin') {
      this.showToast('صرف ایڈمن کو مسترد کرنے کی اجازت ہے!', 'danger');
      return;
    }

    if (confirm('کیا آپ اس اسٹاک امپورٹ کو مسترد کرنا چاہتے ہیں؟')) {
      this.pendingImports = [];
      this.saveToDB('pending_imports', this.pendingImports);
      this.showToast('اسٹاک امپورٹ کی درخواست مسترد کر دی گئی ہے۔', 'warning');
      this.renderAllViews();
    }
  }

  renderExpiryReturnsSheet() {
    const tbody = document.getElementById('expiry-returns-tbody');
    let html = '';

    this.inventory.forEach(med => {
      med.batches.forEach((batch, index) => {
        const expDate = new Date(batch.expiryDate);
        const diffTime = expDate - this.simulatedCurrentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 90 && batch.quantity > 0) {
          const supplierName = this.suppliers.find(s => s.supplierId === med.defaultSupplierId)?.companyName || 'Unknown';
          const refundValue = batch.quantity * batch.purchasePrice;

          html += `
            <tr>
              <td><strong>${med.name}</strong></td>
              <td><code>${batch.batchNumber}</code></td>
              <td><strong style="color:var(--danger)">${batch.expiryDate}</strong></td>
              <td>${diffDays <= 0 ? 'ایکسپائر ہو چکی ہے' : `${diffDays} دن باقی`}</td>
              <td>${batch.quantity} Tabs</td>
              <td><strong>Rs ${refundValue.toFixed(2)}</strong></td>
              <td>${supplierName}</td>
              <td>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size:0.75rem;" onclick="app.returnToSupplier('${med.medicineId}', '${batch.batchNumber}', ${batch.quantity}, ${batch.purchasePrice}, '${med.defaultSupplierId}')">
                  سپلائر واپسی (Debit Note)
                </button>
              </td>
            </tr>
          `;
        }
      });
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px 0;">اگلے 1 سے 3 ماہ میں ایکسپائر ہونے والا کوئی بھی اسٹاک نہیں ہے۔</td>
      </tr>
    `;
  }

  returnToSupplier(medId, batchNum, quantity, costPrice, supplierId) {
    const debitNoteId = `DN-${this.simulatedCurrentDate.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (confirm(`کیا آپ اس بیچ کا اسٹاک (${quantity} گولیاں) سپلائر کو واپس کرنا چاہتے ہیں؟\nڈیبٹ نوٹ نمبر: ${debitNoteId}\nواپسی مالیت: Rs ${(quantity * costPrice).toFixed(2)} سپلائر بقایاجات سے منہا ہوگی۔`)) {
      const med = this.inventory.find(m => m.medicineId === medId);
      const supplier = this.suppliers.find(s => s.supplierId === supplierId);

      if (!med) return;
      
      const batch = med.batches.find(b => b.batchNumber === batchNum);
      if (batch) {
        batch.quantity = 0;
      }
      med.totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);

      const refund = quantity * costPrice;
      if (supplier) {
        supplier.outstandingBalance = Math.max(0, supplier.outstandingBalance - refund);
        this.saveToDB('suppliers', this.suppliers);
      }

      const ledgerEntry = {
        ledgerId: `led_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "Inflow",
        category: "Supplier Return",
        account: "Receivables",
        amount: refund,
        referenceId: supplierId,
        description: `ایکسپائری اسٹاک ڈیبٹ نوٹ ${debitNoteId} - سپلائر: ${supplier ? supplier.companyName : 'N/A'}`,
        performedBy: this.currentUser.userId
      };
      this.ledger.push(ledgerEntry);

      this.saveToDB('inventory', this.inventory);
      this.saveToDB('ledger', this.ledger);
      
      this.showToast(`ڈیبٹ نوٹ ${debitNoteId} کامیابی سے جاری کر دیا گیا ہے اور اسٹاک سپلائر کو واپس بھیج دیا گیا ہے!`, 'success');
      this.renderAllViews();
    }
  }

  populateMedicineSuppliersDropdown() {
    const select = document.getElementById('med-supplier');
    let options = '';
    this.suppliers.forEach(s => {
      options += `<option value="${s.supplierId}">${s.companyName}</option>`;
    });
    select.innerHTML = options || '<option value="">پہلے کوئی سپلائر ایڈ کریں</option>';
  }

  openAddMedicineModal() {
    this.populateMedicineSuppliersDropdown();
    document.getElementById('medicine-form').reset();
    document.getElementById('medicine-id-field').value = '';
    document.getElementById('medicine-modal-title').innerText = 'نئی دوا انوینٹری میں شامل کریں';
    this.openModal('modal-medicine');
  }

  openEditMedicineModal(medId) {
    this.populateMedicineSuppliersDropdown();
    const med = this.inventory.find(m => m.medicineId === medId);
    if (!med) return;

    document.getElementById('medicine-id-field').value = med.medicineId;
    document.getElementById('med-name').value = med.name;
    document.getElementById('med-brand').value = med.brand;
    document.getElementById('med-formula').value = med.formula;
    document.getElementById('med-category').value = med.category;
    document.getElementById('med-barcode').value = med.barcode;
    document.getElementById('med-rack').value = med.rackLocation;
    document.getElementById('med-reorder').value = med.reorderLevel;
    document.getElementById('med-prescription').checked = med.prescriptionRequired;

    document.getElementById('med-strips-box').value = med.packaging ? med.packaging.stripsPerBox : 10;
    document.getElementById('med-tablets-strip').value = med.packaging ? med.packaging.tabletsPerStrip : 10;
    
    document.getElementById('med-cost-tablet').value = med.pricing ? med.pricing.costPerTablet : 1.20;
    document.getElementById('med-retail-tablet').value = med.pricing ? med.pricing.retailPerTablet : 1.50;
    document.getElementById('med-retail-strip').value = med.pricing ? med.pricing.retailPerStrip : 15.00;
    document.getElementById('med-retail-box').value = med.pricing ? med.pricing.retailPerBox : 140.00;

    document.getElementById('med-supplier').value = med.defaultSupplierId || '';

    document.getElementById('medicine-modal-title').innerText = 'دوا کے ریکارڈ میں ترمیم کریں';
    this.openModal('modal-medicine');
  }

  saveMedicine() {
    const id = document.getElementById('medicine-id-field').value;
    const name = document.getElementById('med-name').value.trim();
    const brand = document.getElementById('med-brand').value.trim();
    const formula = document.getElementById('med-formula').value.trim();
    const category = document.getElementById('med-category').value;
    const barcode = document.getElementById('med-barcode').value.trim();
    const rack = document.getElementById('med-rack').value.trim();
    const reorder = parseInt(document.getElementById('med-reorder').value) || 100;
    const prescription = document.getElementById('med-prescription').checked;

    const stripsBox = parseInt(document.getElementById('med-strips-box').value) || 10;
    const tabletsStrip = parseInt(document.getElementById('med-tablets-strip').value) || 10;
    const costTablet = parseFloat(document.getElementById('med-cost-tablet').value) || 0;
    const retailTablet = parseFloat(document.getElementById('med-retail-tablet').value) || 0;
    const retailStrip = parseFloat(document.getElementById('med-retail-strip').value) || 0;
    const retailBox = parseFloat(document.getElementById('med-retail-box').value) || 0;
    const supplierId = document.getElementById('med-supplier').value;

    const packagingObj = {
      stripsPerBox: stripsBox,
      tabletsPerStrip: tabletsStrip,
      totalTabletsPerBox: stripsBox * tabletsStrip
    };

    const pricingObj = {
      costPerTablet: costTablet,
      retailPerTablet: retailTablet,
      retailPerStrip: retailStrip,
      retailPerBox: retailBox
    };

    if (id) {
      const med = this.inventory.find(m => m.medicineId === id);
      if (med) {
        med.name = name;
        med.brand = brand;
        med.formula = formula;
        med.category = category;
        med.barcode = barcode;
        med.rackLocation = rack;
        med.reorderLevel = reorder;
        med.prescriptionRequired = prescription;
        med.packaging = packagingObj;
        med.pricing = pricingObj;
        med.defaultSupplierId = supplierId;
      }
      this.showToast('دوا کا ریکارڈ اپ ڈیٹ ہو گیا ہے', 'success');
    } else {
      const newMed = {
        medicineId: `med_${Date.now()}`,
        name: name,
        brand: brand,
        formula: formula,
        category: category,
        barcode: barcode,
        batches: [],
        reorderLevel: reorder,
        totalQuantity: 0,
        rackLocation: rack,
        prescriptionRequired: prescription,
        packaging: packagingObj,
        pricing: pricingObj,
        defaultSupplierId: supplierId
      };
      this.inventory.push(newMed);
      this.showToast('نئی دوا کامیابی سے شامل کر دی گئی ہے', 'success');
    }

    this.saveToDB('inventory', this.inventory);
    this.closeModal('modal-medicine');
    this.renderAllViews();
  }

  openBatchesModal(medId) {
    const med = this.inventory.find(m => m.medicineId === medId);
    if (!med) return;

    document.getElementById('batch-med-id').value = med.medicineId;
    document.getElementById('batches-modal-title').innerText = `بیچ مینجمنٹ - ${med.name}`;
    document.getElementById('batch-form').reset();

    if (med.pricing) {
      document.getElementById('batch-cost').value = med.pricing.costPerTablet.toFixed(2);
      document.getElementById('batch-retail').value = med.pricing.retailPerTablet.toFixed(2);
    }

    this.renderBatchesList(med);
    this.openModal('modal-batches');
  }

  renderBatchesList(med) {
    const tbody = document.getElementById('batches-list-tbody');
    let html = '';

    med.batches.forEach((batch, index) => {
      const expDate = new Date(batch.expiryDate);
      const diffTime = expDate - this.simulatedCurrentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let badge = '<span class="badge badge-success">محفوظ</span>';
      if (diffDays <= 0) {
        badge = '<span class="badge badge-danger">ایکسپائرڈ</span>';
      } else if (diffDays <= 90) {
        badge = `<span class="badge badge-warning">${diffDays} دن باقی</span>`;
      }

      html += `
        <tr>
          <td><strong>${batch.batchNumber}</strong></td>
          <td>${batch.quantity} Tabs</td>
          <td>Rs ${batch.purchasePrice.toFixed(2)}</td>
          <td>Rs ${batch.retailPrice.toFixed(2)}</td>
          <td><strong style="color: ${diffDays<=90 ? 'var(--danger)' : 'inherit'}">${batch.expiryDate}</strong></td>
          <td>${badge}</td>
          <td>
            <button class="btn btn-danger btn-icon-only" onclick="app.deleteBatch('${med.medicineId}', ${index})">
              &times;
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted);">اس دوا کا فی الحال کوئی فعال بیچ موجود نہیں ہے</td>
      </tr>
    `;
  }

  saveNewBatch() {
    const medId = document.getElementById('batch-med-id').value;
    const num = document.getElementById('batch-num').value.trim();
    const qty = parseInt(document.getElementById('batch-qty').value) || 0;
    const cost = parseFloat(document.getElementById('batch-cost').value) || 0;
    const retail = parseFloat(document.getElementById('batch-retail').value) || 0;
    const expiry = document.getElementById('batch-expiry').value;

    const med = this.inventory.find(m => m.medicineId === medId);
    if (!med) return;

    if (med.batches.some(b => b.batchNumber === num)) {
      this.showToast('یہ بیچ نمبر پہلے سے موجود ہے!', 'danger');
      return;
    }

    const newBatch = {
      batchNumber: num,
      purchasePrice: cost,
      retailPrice: retail,
      quantity: qty,
      expiryDate: expiry,
      receivedDate: new Date().toISOString().split('T')[0]
    };

    med.batches.push(newBatch);
    med.totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);

    this.saveToDB('inventory', this.inventory);
    this.renderBatchesList(med);
    this.renderAllViews();
    this.showToast('نیا بیچ کامیابی سے شامل کر دیا گیا', 'success');
    document.getElementById('batch-form').reset();
  }

  deleteBatch(medId, index) {
    const med = this.inventory.find(m => m.medicineId === medId);
    if (!med) return;

    if (confirm('کیا آپ اس بیچ کو حذف کرنا چاہتے ہیں؟')) {
      med.batches.splice(index, 1);
      med.totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      
      this.saveToDB('inventory', this.inventory);
      this.renderBatchesList(med);
      this.renderAllViews();
      this.showToast('بیچ حذف کر دیا گیا', 'warning');
    }
  }

  // ==========================================
  // CUSTOMER KHATA (LEDGER) VIEW
  // ==========================================
  renderKhata() {
    const tbody = document.getElementById('customers-list-tbody');
    let html = '';

    this.customers.forEach(c => {
      html += `
        <tr>
          <td>
            <strong>${c.name}</strong>
            ${c.cnic ? `<div style="font-size:0.75rem; color:var(--text-muted);">CNIC: ${c.cnic}</div>` : ''}
            ${c.ntn ? `<div style="font-size:0.75rem; color:var(--text-muted);">NTN: ${c.ntn}</div>` : ''}
          </td>
          <td>${c.phone}</td>
          <td><span class="badge badge-secondary">${c.category}</span></td>
          <td><strong style="color: ${c.currentOutstanding > 0 ? 'var(--warning)' : 'inherit'}">Rs ${c.currentOutstanding.toFixed(2)}</strong></td>
          <td>Rs ${c.creditLimit.toFixed(2)}</td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.viewCustomerLedger('${c.customerId}')">کھاتہ دیکھیں</button>
            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.populateCustomerForm('${c.customerId}')">ترمیم</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">کوئی کھاتہ دار کسٹمر نہیں ہے</td>
      </tr>
    `;
  }

  populateCustomerForm(custId) {
    const c = this.customers.find(x => x.customerId === custId);
    if (!c) return;

    document.getElementById('customer-id-field').value = c.customerId;
    document.getElementById('cust-name').value = c.name;
    document.getElementById('cust-phone').value = c.phone;
    document.getElementById('cust-address').value = c.address;
    document.getElementById('cust-limit').value = c.creditLimit;
    document.getElementById('cust-category').value = c.category;
    document.getElementById('cust-cnic').value = c.cnic || '';
    document.getElementById('cust-ntn').value = c.ntn || '';
  }

  saveCustomerAccount() {
    const id = document.getElementById('customer-id-field').value;
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const limit = parseFloat(document.getElementById('cust-limit').value) || 10000;
    const category = document.getElementById('cust-category').value;
    const cnic = document.getElementById('cust-cnic').value.trim();
    const ntn = document.getElementById('cust-ntn').value.trim();

    if (id) {
      const c = this.customers.find(x => x.customerId === id);
      if (c) {
        c.name = name;
        c.phone = phone;
        c.address = address;
        c.creditLimit = limit;
        c.category = category;
        c.cnic = cnic;
        c.ntn = ntn;
      }
      this.showToast('کسٹمر فائل اپ ڈیٹ ہو گئی ہے', 'success');
    } else {
      const newCust = {
        customerId: `cust_${Date.now()}`,
        name: name,
        phone: phone,
        address: address,
        creditLimit: limit,
        currentOutstanding: 0.0,
        category: category,
        cnic: cnic,
        ntn: ntn,
        status: "Active",
        ledger: []
      };
      this.customers.push(newCust);
      this.showToast('نیا کسٹمر کھاتہ کامیابی سے رجسٹر ہو گیا ہے', 'success');
    }

    this.saveToDB('customers', this.customers);
    document.getElementById('customer-form').reset();
    document.getElementById('customer-id-field').value = '';
    this.renderAllViews();
  }

  viewCustomerLedger(custId) {
    const cust = this.customers.find(c => c.customerId === custId);
    if (!cust) return;

    document.getElementById('khata-history-panel').style.display = 'block';
    
    let taxDetails = '';
    if (cust.cnic) taxDetails += ` | CNIC: ${cust.cnic}`;
    if (cust.ntn) taxDetails += ` | NTN: ${cust.ntn}`;

    document.getElementById('khata-active-name').innerText = `${cust.name} (${cust.category})${taxDetails} - بقایا: Rs ${cust.currentOutstanding.toFixed(2)}`;

    const tbody = document.getElementById('khata-history-tbody');
    let html = '';

    const sortedLedger = [...cust.ledger].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedLedger.forEach(l => {
      const dateStr = new Date(l.timestamp).toLocaleString();
      const isDebit = l.type === 'Debit';
      html += `
        <tr>
          <td>${dateStr}</td>
          <td>
            <span class="badge ${isDebit ? 'badge-danger' : 'badge-success'}">
              ${isDebit ? 'خریداری (Debit)' : 'ادائیگی (Credit)'}
            </span>
          </td>
          <td><strong style="color: ${isDebit ? 'var(--danger)' : 'var(--primary)'}">Rs ${l.amount.toFixed(2)}</strong></td>
          <td>${l.referenceInvoice || 'N/A'}</td>
          <td>${l.description}</td>
          <td>${l.performedBy}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 12px 0;">اس کھاتے میں فی الحال کوئی ٹرانزیکشن ہسٹری موجود نہیں ہے۔</td>
      </tr>
    `;

    document.getElementById('khata-history-panel').scrollIntoView({ behavior: 'smooth' });
  }

  openReceivePaymentModal() {
    const select = document.getElementById('rec-customer-select');
    let options = '';
    this.customers.forEach(c => {
      options += `<option value="${c.customerId}">${c.name} (Outstanding: Rs ${c.currentOutstanding.toFixed(0)})</option>`;
    });
    select.innerHTML = options || '<option value="">کوئی کسٹمر نہیں ہے</option>';

    this.updateCustomerOutstandingLabel();
    this.openModal('modal-receive-payment');
  }

  updateCustomerOutstandingLabel() {
    const custId = document.getElementById('rec-customer-select').value;
    const c = this.customers.find(x => x.customerId === custId);
    const balance = c ? c.currentOutstanding : 0;
    document.getElementById('cust-outstanding-label').innerText = `موجودہ کل ادھار بقایا جات: Rs ${balance.toFixed(2)}`;
  }

  saveReceivePayment() {
    const custId = document.getElementById('rec-customer-select').value;
    const amount = parseFloat(document.getElementById('rec-amount').value) || 0;
    const desc = document.getElementById('rec-description').value.trim() || 'ادھار وصولی';
    const account = document.getElementById('rec-account').value;

    const cust = this.customers.find(x => x.customerId === custId);
    if (!cust) return;

    if (amount <= 0 || amount > cust.currentOutstanding) {
      this.showToast('وصول کردہ رقم کی درست مقدار درج کریں (بقایا سے زیادہ نہیں ہو سکتی)!', 'danger');
      return;
    }

    cust.currentOutstanding = Math.max(0, cust.currentOutstanding - amount);
    
    cust.ledger.push({
      transactionId: `txn_k_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "Credit",
      amount: amount,
      referenceInvoice: "",
      description: `ادھار وصولی جمع شدہ برائے ${account}`,
      performedBy: this.currentUser.userId
    });

    this.saveToDB('customers', this.customers);

    const newEntry = {
      ledgerId: `led_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "Inflow",
      category: "Credit Payment Receipt",
      account: account,
      amount: amount,
      referenceId: custId,
      description: `کھاتہ دار ${cust.name} سے ادھار وصولی - اکاؤنٹ: ${account}`,
      performedBy: this.currentUser.userId
    };
    this.ledger.push(newEntry);
    this.saveToDB('ledger', this.ledger);

    this.showToast('ادھار وصولی کامیابی سے درج کر دی گئی ہے!', 'success');
    this.closeModal('modal-receive-payment');
    this.renderAllViews();
  }

  // ==========================================
  // SUPPLIER & PURCHASE ORDER VIEW
  // ==========================================
  renderSuppliers() {
    const supTbody = document.getElementById('suppliers-list-tbody');
    let supHtml = '';

    this.suppliers.forEach(s => {
      supHtml += `
        <tr>
          <td><strong>${s.companyName}</strong></td>
          <td>${s.contactPerson}</td>
          <td>${s.phone}</td>
          <td>${s.address || 'Pakistan'}</td>
          <td><strong style="color: ${s.outstandingBalance > 0 ? 'var(--warning)' : 'inherit'}">Rs ${s.outstandingBalance.toFixed(2)}</strong></td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.populateSupplierForm('${s.supplierId}')">ترمیم</button>
          </td>
        </tr>
      `;
    });

    supTbody.innerHTML = supHtml || `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">کوئی سپلائر نہیں ہے</td>
      </tr>
    `;

    const purTbody = document.getElementById('purchases-list-tbody');
    let purHtml = '';

    this.purchases.forEach(p => {
      const supplierName = this.suppliers.find(s => s.supplierId === p.supplierId)?.companyName || 'Unknown';
      const dateStr = new Date(p.purchaseDate).toLocaleDateString();

      let badgeClass = 'badge-success';
      if (p.status === 'Partially Paid') badgeClass = 'badge-warning';
      else if (p.status === 'Unpaid') badgeClass = 'badge-danger';

      purHtml += `
        <tr>
          <td><strong style="color: var(--secondary)">${p.invoiceNumber}</strong></td>
          <td>${supplierName}</td>
          <td>${dateStr}</td>
          <td>Rs ${p.totals.grandTotal.toFixed(2)}</td>
          <td>Rs ${p.totals.amountPaid.toFixed(2)}</td>
          <td>Rs ${p.totals.balanceDue.toFixed(2)}</td>
          <td><span class="badge ${badgeClass}">${p.status}</span></td>
        </tr>
      `;
    });

    purTbody.innerHTML = purHtml || `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted);">خریداری کی کوئی انوائس ریکارڈ نہیں ہے</td>
      </tr>
    `;

    this.renderAutoPODrafts();
  }

  renderAutoPODrafts() {
    const container = document.getElementById('auto-po-list-container');
    const groupedDrafts = {};
    
    this.inventory.forEach(med => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalStock <= med.reorderLevel) {
        const supId = med.defaultSupplierId || 'sup_1';
        
        if (!groupedDrafts[supId]) {
          groupedDrafts[supId] = [];
        }
        
        groupedDrafts[supId].push({
          medId: med.medicineId,
          name: med.name,
          currentStock: totalStock,
          reorderLevel: med.reorderLevel,
          suggestedQty: med.reorderLevel * 2,
          costPrice: med.pricing ? med.pricing.costPerTablet : 1.2
        });
      }
    });

    let html = '';
    
    Object.keys(groupedDrafts).forEach(supId => {
      const supplier = this.suppliers.find(s => s.supplierId === supId);
      if (!supplier) return;

      const items = groupedDrafts[supId];
      let itemsListHTML = '';
      let totalCost = 0;

      items.forEach(item => {
        const cost = item.suggestedQty * item.costPrice;
        totalCost += cost;
        itemsListHTML += `
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.03); padding:6px 0;">
            <span>${item.name} (${item.currentStock} Tabs left)</span>
            <strong>${item.suggestedQty} Qty @ Rs ${item.costPrice.toFixed(2)}</strong>
          </div>
        `;
      });

      html += `
        <div class="panel-card" style="margin-bottom:0; background: rgba(14, 165, 233, 0.02); border-color: rgba(14, 165, 233, 0.2);">
          <div style="font-weight: 600; font-size: 0.95rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:10px;">
            <span style="color:var(--secondary)">${supplier.companyName}</span>
            <span class="badge badge-warning">${items.length} ادویات</span>
          </div>
          <div>
            ${itemsListHTML}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top:8px;">
            Trigger: Low Stock Rule (Reorder Match)
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-weight:bold; font-size:0.9rem;">
            <span>کل تخمینی بل:</span>
            <span style="color: var(--secondary)">Rs ${totalCost.toFixed(2)}</span>
          </div>
          <button class="btn btn-primary" style="width:100%; justify-content:center; padding: 6px 12px; font-size: 0.8rem; margin-top:12px;" onclick="app.confirmAutoPO('${supId}')">
            کنفرم اور آرڈر بھیجیں
          </button>
        </div>
      `;
    });

    container.innerHTML = html || `
      <div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 20px 0;">
        بہترین! کوئی دوا ری آرڈر لیول سے نیچے نہیں ہے، کوئی ڈرافٹ خالی نہیں ہے۔
      </div>
    `;
  }

  confirmAutoPO(supId) {
    const supplier = this.suppliers.find(s => s.supplierId === supId);
    if (!supplier) return;

    if (confirm(`${supplier.companyName} کو آٹو پرچیز آرڈر بھیج کر گودام اسٹاک اپ ڈیٹ کریں؟`)) {
      const medsToUpdate = this.inventory.filter(m => (m.defaultSupplierId || 'sup_1') === supId && m.batches.reduce((sum,b)=>sum+b.quantity, 0) <= m.reorderLevel);
      
      let grandTotal = 0;
      const orderItems = [];

      medsToUpdate.forEach(med => {
        const reorderSize = med.reorderLevel * 2;
        const cost = med.pricing ? med.pricing.costPerTablet : 1.2;
        const retail = med.pricing ? med.pricing.retailPerTablet : 1.5;
        const total = reorderSize * cost;
        grandTotal += total;

        const batchNum = `B-AUTO-${Date.now().toString().slice(-4)}`;
        med.batches.push({
          batchNumber: batchNum,
          purchasePrice: cost,
          retailPrice: retail,
          quantity: reorderSize,
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
          receivedDate: new Date().toISOString().split('T')[0]
        });
        med.totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);

        orderItems.push({
          medicineId: med.medicineId,
          batchNumber: batchNum,
          quantity: reorderSize,
          purchasePrice: cost,
          expiryDate: med.batches[med.batches.length - 1].expiryDate
        });
      });

      supplier.outstandingBalance += grandTotal;

      const invoiceNum = `SUP-AUTO-${Date.now().toString().slice(-6)}`;
      const newPurchase = {
        purchaseId: `pur_${Date.now()}`,
        supplierId: supId,
        invoiceNumber: invoiceNum,
        purchaseDate: new Date().toISOString(),
        items: orderItems,
        totals: {
          grandTotal: grandTotal,
          amountPaid: 0.0,
          balanceDue: grandTotal
        },
        status: "Unpaid"
      };

      this.purchases.push(newPurchase);

      this.saveToDB('inventory', this.inventory);
      this.saveToDB('suppliers', this.suppliers);
      this.saveToDB('purchases', this.purchases);

      this.showToast('آٹو پرچیز بل کامیابی سے پروسیس ہو گیا ہے اور اسٹاک جمع ہو گیا ہے!', 'success');
      this.renderAllViews();
    }
  }

  populateSupplierForm(supId) {
    const s = this.suppliers.find(x => x.supplierId === supId);
    if (!s) return;
    document.getElementById('supplier-id-field').value = s.supplierId;
    document.getElementById('supplier-name').value = s.companyName;
    document.getElementById('supplier-contact').value = s.contactPerson;
    document.getElementById('supplier-phone').value = s.phone;
    document.getElementById('supplier-email').value = s.email;
    document.getElementById('supplier-address').value = s.address;
  }

  saveSupplier() {
    const id = document.getElementById('supplier-id-field').value;
    const name = document.getElementById('supplier-name').value.trim();
    const contact = document.getElementById('supplier-contact').value.trim();
    const phone = document.getElementById('supplier-phone').value.trim();
    const email = document.getElementById('supplier-email').value.trim();
    const address = document.getElementById('supplier-address').value.trim();

    if (id) {
      const s = this.suppliers.find(x => x.supplierId === id);
      if (s) {
        s.companyName = name;
        s.contactPerson = contact;
        s.phone = phone;
        s.email = email;
        s.address = address;
      }
      this.showToast('سپلائر ریکارڈ اپ ڈیٹ ہو گیا ہے', 'success');
    } else {
      const newSup = {
        supplierId: `sup_${Date.now()}`,
        companyName: name,
        contactPerson: contact,
        phone: phone,
        email: email,
        address: address,
        outstandingBalance: 0.0
      };
      this.suppliers.push(newSup);
      this.showToast('سپلائر کامیابی سے رجسٹر ہو گیا ہے', 'success');
    }

    this.saveToDB('suppliers', this.suppliers);
    document.getElementById('supplier-form').reset();
    document.getElementById('supplier-id-field').value = '';
    this.renderAllViews();
  }

  openSupplierPaymentModal() {
    const select = document.getElementById('pay-supplier-select');
    let options = '';
    this.suppliers.forEach(s => {
      options += `<option value="${s.supplierId}">${s.companyName}</option>`;
    });
    select.innerHTML = options;
    
    this.updateOutstandingBalanceLabel();
    this.openModal('modal-supplier-payment');
  }

  updateOutstandingBalanceLabel() {
    const supId = document.getElementById('pay-supplier-select').value;
    const s = this.suppliers.find(x => x.outstandingBalance === supId);
    const balance = s ? s.outstandingBalance : 0;
    document.getElementById('outstanding-balance-label').innerText = `موجودہ کل بقایا جات: Rs ${balance.toFixed(2)}`;
  }

  saveSupplierPayment() {
    const supId = document.getElementById('pay-supplier-select').value;
    const amount = parseFloat(document.getElementById('pay-amount').value) || 0;
    const desc = document.getElementById('pay-description').value.trim() || 'بقایاجات کی ادائیگی';

    const s = this.suppliers.find(x => x.supplierId === supId);
    if (!s) return;

    if (amount <= 0) {
      this.showToast('رقم کی درست مقدار درج کریں!', 'danger');
      return;
    }

    s.outstandingBalance = Math.max(0, s.outstandingBalance - amount);
    this.saveToDB('suppliers', this.suppliers);

    const newEntry = {
      ledgerId: `led_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "Outflow",
      category: "Supplier Payment",
      account: "Bank",
      amount: amount,
      referenceId: supId,
      description: `${s.companyName} کو بقایاجات کی ادائیگی (Bank IBFT): ${desc}`,
      performedBy: this.currentUser.userId
    };
    this.ledger.push(newEntry);
    this.saveToDB('ledger', this.ledger);

    this.showToast('ادائیگی کامیابی سے درج کر دی گئی ہے', 'success');
    this.closeModal('modal-supplier-payment');
    this.renderAllViews();
  }

  openNewPurchaseModal() {
    const supSelect = document.getElementById('pur-supplier');
    let supOptions = '';
    this.suppliers.forEach(s => {
      supOptions += `<option value="${s.supplierId}">${s.companyName}</option>`;
    });
    supSelect.innerHTML = supOptions || '<option value="">پہلے کوئی سپلائر ایڈ کریں</option>';

    const medSelect = document.getElementById('pur-medicine');
    let medOptions = '';
    this.inventory.forEach(m => {
      medOptions += `<option value="${m.medicineId}">${m.name} (${m.brand})</option>`;
    });
    medSelect.innerHTML = medOptions || '<option value="">پہلے کوئی دوا ایڈ کریں</option>';

    this.openModal('modal-purchase');
  }

  savePurchaseInvoice() {
    const supId = document.getElementById('pur-supplier').value;
    const invoiceNum = document.getElementById('pur-invoice-num').value.trim();
    const medId = document.getElementById('pur-medicine').value;
    const batchNum = document.getElementById('pur-batch-number').value.trim();
    const costPrice = parseFloat(document.getElementById('pur-price-cost').value) || 0;
    const retailPrice = parseFloat(document.getElementById('pur-price-retail').value) || 0;
    const qty = parseInt(document.getElementById('pur-quantity').value) || 0;
    const expiry = document.getElementById('pur-expiry').value;
    const paidAmount = parseFloat(document.getElementById('pur-paid-amount').value) || 0;

    const supplier = this.suppliers.find(s => s.supplierId === supId);
    const medicine = this.inventory.find(m => m.medicineId === medId);

    if (!supplier || !medicine) {
      this.showToast('براہ کرم تمام معلومات درست منتخب کریں!', 'danger');
      return;
    }

    const totalBill = costPrice * qty;
    const balanceDue = Math.max(0, totalBill - paidAmount);

    const existingBatch = medicine.batches.find(b => b.batchNumber === batchNum);
    if (existingBatch) {
      existingBatch.quantity += qty;
      existingBatch.purchasePrice = costPrice;
      existingBatch.retailPrice = retailPrice;
      existingBatch.expiryDate = expiry;
    } else {
      medicine.batches.push({
        batchNumber: batchNum,
        purchasePrice: costPrice,
        retailPrice: retailPrice,
        quantity: qty,
        expiryDate: expiry,
        receivedDate: new Date().toISOString().split('T')[0]
      });
    }
    medicine.totalQuantity = medicine.batches.reduce((sum, b) => sum + b.quantity, 0);
    supplier.outstandingBalance += balanceDue;

    const status = balanceDue === 0 ? 'Paid' : (paidAmount > 0 ? 'Partially Paid' : 'Unpaid');
    const newPurchase = {
      purchaseId: `pur_${Date.now()}`,
      supplierId: supId,
      invoiceNumber: invoiceNum,
      purchaseDate: new Date().toISOString(),
      items: [{
        medicineId: medId,
        batchNumber: batchNum,
        quantity: qty,
        purchasePrice: costPrice,
        expiryDate: expiry
      }],
      totals: {
        grandTotal: totalBill,
        amountPaid: paidAmount,
        balanceDue: balanceDue
      },
      status: status
    };

    this.purchases.push(newPurchase);

    if (paidAmount > 0) {
      const ledgerOutflow = {
        ledgerId: `led_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "Outflow",
        category: "Purchase Payment",
        account: "Bank",
        amount: paidAmount,
        referenceId: newPurchase.purchaseId,
        description: `خریداری انوائس ${invoiceNum} (بینک اکاؤنٹ سے نقد ادا شدہ)`,
        performedBy: this.currentUser.userId
      };
      this.ledger.push(ledgerOutflow);
    }

    this.saveToDB('inventory', this.inventory);
    this.saveToDB('suppliers', this.suppliers);
    this.saveToDB('purchases', this.purchases);
    this.saveToDB('ledger', this.ledger);

    this.showToast('خریداری آرڈر درج ہو چکا ہے اور اسٹاک اپ ڈیٹ کر دیا گیا ہے', 'success');
    this.closeModal('modal-purchase');
    this.renderAllViews();
  }

  // ==========================================
  // FINANCIAL LEDGER VIEW
  // ==========================================
  renderLedger() {
    const tbody = document.getElementById('ledger-list-tbody');
    let html = '';
    
    const sortedLedger = [...this.ledger].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let cashInflow = 0;
    let cashOutflow = 0;
    let bankInflow = 0;
    let bankOutflow = 0;

    sortedLedger.forEach(l => {
      const dateStr = new Date(l.timestamp).toLocaleString();
      const inFlow = l.type === 'Inflow';
      const isCash = l.account === 'Cash-in-Hand';
      const isBank = l.account === 'Bank';

      if (inFlow) {
        if (isCash) cashInflow += l.amount;
        else if (isBank) bankInflow += l.amount;
      } else {
        if (isCash) cashOutflow += l.amount;
        else if (isBank) bankOutflow += l.amount;
      }

      html += `
        <tr>
          <td>${dateStr}</td>
          <td>
            <span class="badge ${inFlow ? 'badge-success' : 'badge-danger'}">
              ${inFlow ? 'کیش آمد (Inflow)' : 'کیش اخراج (Outflow)'}
            </span>
          </td>
          <td>${l.category}</td>
          <td><strong style="color: ${inFlow ? 'var(--primary)' : 'var(--danger)'}">Rs ${l.amount.toFixed(2)}</strong></td>
          <td><span class="badge badge-secondary" style="font-size:0.75rem;">${l.account || 'Receivables'}</span></td>
          <td style="font-size:0.85rem;">${l.description}</td>
          <td>${l.performedBy}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html || `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">کوئی کھاتہ ہسٹری موجود نہیں ہے</td>
      </tr>
    `;

    const currentCashBalance = this.baseCashBalance + cashInflow - cashOutflow;
    const currentBankBalance = this.baseBankBalance + bankInflow - bankOutflow;

    document.getElementById('ledger-cash-in-hand').innerText = `Rs ${currentCashBalance.toFixed(2)}`;
    document.getElementById('ledger-bank-balance').innerText = `Rs ${currentBankBalance.toFixed(2)}`;
    document.getElementById('ledger-total-balance').innerText = `Rs ${(currentCashBalance + currentBankBalance).toFixed(2)}`;

    this.compileTaxProfitReport();
  }

  populateExpenseCategoriesDropdown() {
    const select = document.getElementById('exp-category');
    if (!select) return;
    
    let html = '';
    this.expenseCategories.forEach(cat => {
      html += `<option value="${cat}">${cat}</option>`;
    });
    select.innerHTML = html;
  }

  addExpenseCategory() {
    if (this.currentUser.role !== 'Admin') {
      this.showToast('صرف ایڈمن کو کیٹیگری ایڈ کرنے کا اختیار ہے!', 'danger');
      return;
    }

    const input = document.getElementById('new-expense-category-input');
    const val = input.value.trim();
    if (!val) {
      this.showToast('کیٹیگری کا نام درج کریں!', 'danger');
      return;
    }

    if (this.expenseCategories.includes(val)) {
      this.showToast('یہ کیٹیگری پہلے سے موجود ہے!', 'danger');
      return;
    }

    this.expenseCategories.push(val);
    this.saveToDB('expense_categories', this.expenseCategories);
    
    input.value = '';
    this.showToast(`اخراجات کیٹیگری "${val}" کامیابی سے شامل کر دی گئی!`, 'success');
    this.populateExpenseCategoriesDropdown();
  }

  exportLedger(format) {
    if (this.ledger.length === 0) {
      this.showToast('لیجر میں کوئی ڈیٹا موجود نہیں ہے!', 'warning');
      return;
    }

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      let rowsHtml = '';
      this.ledger.forEach(l => {
        rowsHtml += `
          <tr>
            <td>${new Date(l.timestamp).toLocaleString()}</td>
            <td>${l.type}</td>
            <td>${l.category}</td>
            <td>Rs ${l.amount.toFixed(2)}</td>
            <td>${l.account || 'Receivables'}</td>
            <td>${l.description}</td>
            <td>${l.performedBy}</td>
          </tr>
        `;
      });

      printWindow.document.write(`
        <html>
        <head>
          <title>Al-Raza PMS - Accounts Cash Ledger</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #0284c7; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f3f4f6; }
            .meta { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>الرازق فارمیسی مینجمنٹ سسٹم (Al-Raza PMS)</h1>
          <div class="meta">فنانشل کیش لیجر رپورٹ | تاریخ: ${new Date().toLocaleDateString()} | Developed by MAGILL</div>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Account</th>
                <th>Description</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
      this.showToast('رپورٹ پی ڈی ایف پرنٹ ونڈو کھل گئی ہے', 'success');
      return;
    }

    let csvContent = 'Timestamp,Type,Category,Amount,Account,Description,Performed By\n';
    this.ledger.forEach(l => {
      const desc = l.description.replace(/,/g, ' ');
      csvContent += `"${new Date(l.timestamp).toLocaleString()}","${l.type}","${l.category}",${l.amount},"${l.account || 'Receivables'}","${desc}","${l.performedBy}"\n`;
    });

    const mime = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv';
    const filename = format === 'excel' ? 'cash_ledger_report.xls' : 'cash_ledger_report.csv';
    
    const blob = new Blob([csvContent], { type: mime + ';charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast(`رپورٹ کامیابی سے بطور ${format.toUpperCase()} ڈاؤن لوڈ ہو گئی ہے!`, 'success');
    }
  }

  compileTaxProfitReport() {
    let totalOutputGst = 0;
    let totalGrossSalesRevenue = 0;
    let totalCogs = 0;

    this.sales.forEach(sale => {
      totalOutputGst += sale.totals.tax || 0;
      totalGrossSalesRevenue += sale.totals.grandTotal;
      totalCogs += sale.totals.totalCost || 0;
    });

    let totalInputGst = 0;
    this.purchases.forEach(pur => {
      totalInputGst += pur.totals.grandTotal * 0.15;
    });

    const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);

    let totalExpenses = 0;
    this.ledger.forEach(l => {
      if (l.type === 'Outflow' && l.category !== 'Supplier Payment' && l.category !== 'Purchase Payment') {
        totalExpenses += l.amount;
      }
    });

    const salesRevenueExcludingGst = totalGrossSalesRevenue - totalOutputGst;
    const grossProfit = salesRevenueExcludingGst - totalCogs;
    const netProfit = grossProfit - totalExpenses - netGstPayable;

    document.getElementById('gst-output').innerText = `Rs ${totalOutputGst.toFixed(2)}`;
    document.getElementById('gst-input').innerText = `Rs ${totalInputGst.toFixed(2)}`;
    document.getElementById('gst-payable').innerText = `Rs ${netGstPayable.toFixed(2)}`;
    
    const profitEl = document.getElementById('statement-net-profit');
    profitEl.innerText = `Rs ${netProfit.toFixed(2)}`;
    if (netProfit < 0) {
      profitEl.style.color = 'var(--danger)';
    } else {
      profitEl.style.color = 'var(--success)';
    }
  }

  openRecordExpenseModal() {
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-description').value = '';
    this.populateExpenseCategoriesDropdown();
    this.openModal('modal-expense');
  }

  saveExpense() {
    const category = document.getElementById('exp-category').value;
    const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
    const desc = document.getElementById('exp-description').value.trim();
    const account = document.getElementById('exp-account').value;

    if (amount <= 0) {
      this.showToast('رقم کی درست مقدار درج کریں!', 'danger');
      return;
    }

    const newLedgerEntry = {
      ledgerId: `led_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "Outflow",
      category: category,
      account: account,
      amount: amount,
      referenceId: '',
      description: desc,
      performedBy: this.currentUser.userId
    };

    this.ledger.push(newLedgerEntry);
    this.saveToDB('ledger', this.ledger);

    this.showToast('اخراجات کا اندارج ہو چکا ہے', 'success');
    this.closeModal('modal-expense');
    this.renderAllViews();
  }

  // ==========================================
  // USERS / EMPLOYEES VIEW
  // ==========================================
  renderUsers() {
    const tbody = document.getElementById('users-list-tbody');
    let html = '';

    this.users.forEach(u => {
      const isSelf = u.userId === this.currentUser.userId;
      const isBlocked = u.status !== 'Active';

      html += `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td><code>${u.username}</code></td>
          <td><span class="badge badge-secondary" style="font-size:0.8rem;">${u.role}</span></td>
          <td>
            <span class="badge ${isBlocked ? 'badge-danger' : 'badge-success'}">
              ${isBlocked ? 'بلاک شدہ (Blocked)' : 'فعال (Active)'}
            </span>
          </td>
          <td>
            ${isSelf ? '<span style="color:var(--text-muted); font-size:0.8rem;">یہ آپ کا اپنا اکاؤنٹ ہے</span>' : `
              <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.toggleUserStatus('${u.userId}')">
                ${isBlocked ? 'بلاک ختم کریں' : 'بلاک کریں'}
              </button>
            `}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  openAddUserModal() {
    document.getElementById('usr-name').value = '';
    document.getElementById('usr-username').value = '';
    document.getElementById('usr-password').value = '';
    this.openModal('modal-user');
  }

  saveUser() {
    const name = document.getElementById('usr-name').value.trim();
    const username = document.getElementById('usr-username').value.trim().toLowerCase();
    const pass = document.getElementById('usr-password').value.trim();
    const role = document.getElementById('usr-role').value;

    if (this.users.some(u => u.username === username)) {
      this.showToast('یہ یوزر نیم پہلے ہی زیرِ استعمال ہے!', 'danger');
      return;
    }

    const newUser = {
      userId: `usr_${Date.now()}`,
      name: name,
      username: username,
      password: pass,
      role: role,
      status: "Active"
    };

    this.users.push(newUser);
    this.saveToDB('users', this.users);
    
    this.showToast('نیا ملازم لاگ ان کامیابی سے تیار کر دیا گیا ہے', 'success');
    this.closeModal('modal-user');
    this.renderUsers();
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.userId === userId);
    if (!user) return;

    user.status = user.status === 'Active' ? 'Blocked' : 'Active';
    this.saveToDB('users', this.users);
    this.showToast(`یوزر اسٹیٹس کامیابی سے تبدیل ہو گیا`, 'success');
    this.renderUsers();
  }

  // ==========================================
  // CORE HELPER UTILITIES
  // ==========================================
  
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let svgIcon = '';
    if (type === 'success') {
      svgIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'warning') {
      svgIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>';
    } else {
      svgIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    }

    toast.innerHTML = `
      ${svgIcon}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'none';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }
}

const app = new PharmacyApp();
window.app = app;
app.init();
