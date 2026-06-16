'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // CONFIG
    const CONFIG = {
        users: [
            { name: 'Bentar', pin: '112233', role: 'Kasir Pagi', avatar: 'B' },
            { name: 'Aufa', pin: '808080', role: 'Kasir Sore', avatar: 'A' },
            { name: 'Shally', pin: '999999', role: 'Kasir Midnight', avatar: 'A' },
            { name: 'Ivan', pin: '123456', role: 'Administrator', avatar: 'A' }
        ],
        storeName: 'Kabuki Restaurant',
        storeAddress: 'Jl. Gajah MAda No. 5, Semarang Tengah',
        thankYouMessage: 'Terima kasih telah berbelanja!'
    };

    // PRODUCT DATA
    const products = [
        { id: 'P001', name: 'Ramen Chicken', price: 25000, emoji: '🍜' },
        { id: 'P001', name: 'Ramen Katsu', price: 25000, emoji: '🍜' },
        { id: 'P002', name: 'Ramen Beef', price: 28000, emoji: '🥩' },
        { id: 'P003', name: 'Ramen Basic', price: 18000, emoji: '🍥' },
        { id: 'P004', name: 'Dry Ramen Chicken', price: 22000, category: 'Dry Ramen', emoji: '🥢' },
        { id: 'P005', name: 'Dry Ramen Beef', price: 25000, category: 'Dry Ramen', emoji: '🥩' },
        { id: 'P006', name: 'Tepanyaki Chicken', price: 25000, category: 'Tepanyaki', emoji: '🍱' },
        { id: 'P007', name: 'Tepanyaki Beef', price: 30000, category: 'Tepanyaki', emoji: '🥩' },
        { id: 'P008', name: 'Hikiniku Steam Rice', price: 22000, category: 'Hikiniku', emoji: '🍚' },
        { id: 'P009', name: 'Hikiniku Steak', price: 28000, category: 'Hikiniku', emoji: '🥩' },
        { id: 'P010', name: 'Steam Rice', price: 4000, category: 'Sides', emoji: '🍚' },
        { id: 'P011', name: 'Fried Rice', price: 10000, category: 'Sides', emoji: '🍳' },
        { id: 'P012', name: 'Osen Egg', price: 7000, category: 'Sides', emoji: '🥚' },
        { id: 'P013', name: 'Es Teh Jumbo', price: 8000, category: 'Drinks', emoji: '🥤' },
        { id: 'P014', name: 'Drink Botol', price: 18000, category: 'Drinks', emoji: '🍾' },
        { id: 'P015', name: 'Es Batu', price: 2000, category: 'Drinks', emoji: '🧊' },
    ];

    // STATE
    let cart = [];
    let currentPinInput = '';
    let currentUser = null;
    let currentCategory = 'All'; // Default category filter
    let transactions = [];
    let dailyRekap = { date: '', qrisTotal: 0, cashTotal: 0, productSales: {} };

    // Load data from localStorage with error handling
    try {
        transactions = JSON.parse(localStorage.getItem('kasir_transactions')) || [];
        dailyRekap = JSON.parse(localStorage.getItem('kasir_dailyRekap')) || {
            date: '', qrisTotal: 0, cashTotal: 0, productSales: {}
        };
    } catch (e) {
        console.error("Error loading data from localStorage:", e);
        // Reset to default if parsing fails or data is corrupted
        transactions = [];
        dailyRekap = { date: '', qrisTotal: 0, cashTotal: 0, productSales: {} };
    };

    // DOM REFS
    const $ = (id) => document.getElementById(id);
    const loginPage = $('login-page');
    const appPage = $('app-page');
    const pinDisplay = $('pin-display');
    const loginError = $('login-error');
    const loginBtn = $('login-button');
    const logoutBtn = $('logout-button');

    const productGrid = $('product-grid');
    const productSearch = $('product-search');
    const cartItemsWrap = $('cart-items');
    const cartEmpty = $('cart-empty');
    const cartTotal = $('cart-total');
    const cartSubtotal = $('cart-subtotal');
    const checkoutBtn = $('checkout-button');
    const clearCartBtn = $('clear-cart-btn');
    const productCount = $('product-count');
    const categoryTabs = $('category-tabs');

    const paymentView = $('payment-view');
    const backToKasirBtn = $('back-to-kasir');
    const paymentTotal = $('payment-total');
    const paymentOrderItems = $('payment-order-items');
    const qrisPaymentBtn = $('qris-payment');
    const cashPaymentBtn = $('cash-payment');

    const qrisModal = $('qris-modal');
    const qrisAmountDisplay = $('qris-amount-display');
    const printQrisBtn = $('print-qris-struk');

    const cashModal = $('cash-modal');
    const cashReceived = $('cash-received');
    const cashTotalDisplay = $('cash-total-display');
    const cashChange = $('cash-change');
    const quickCashBtns = $('quick-cash-buttons');
    const printCashBtn = $('print-cash-struk');

    const strukNotif = $('struk-notification');
    const printedStrukDetails = $('printed-struk-details');
    const backAfterPrintBtn = $('back-to-kasir-after-print');

    const transactionListDiv = $('transaction-list');
    const historyCount = $('history-count');

    const rekapQrisTotal = $('rekap-qris-total');
    const rekapTunaiTotal = $('rekap-tunai-total');
    const rekapAllTotal = $('rekap-all-total');
    const showDetailedRekapBtn = $('show-detailed-rekap');
    const detailedRekapContent = $('detailed-rekap-content');
    const rekapProductQty = $('rekap-product-qty');
    const tutupTokoBtn = $('tutup-toko');

    const printArea = $('print-area');
    const sidebarTime = $('sidebar-time');
    const headerDate = $('header-date');
    const pageTitle = $('page-title');

    const navItems = document.querySelectorAll('.nav-item');

    // UTILITIES
    const formatRp = (n) => `Rp ${n.toLocaleString('id-ID')}`;

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const generateId = () => `TRX-${Date.now().toString(36).toUpperCase()}`;

    const saveData = () => {
        localStorage.setItem('kasir_transactions', JSON.stringify(transactions));
        try {
            localStorage.setItem('kasir_dailyRekap', JSON.stringify(dailyRekap));
        } catch (e) {
            console.error("Error saving daily rekap to localStorage:", e);
        }
    };    

    const getTodayStr = () => new Date().toDateString();

    // CLOCK

    const updateClock = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        if (sidebarTime) sidebarTime.textContent = timeStr;
        if (headerDate) headerDate.textContent = dateStr;
    };

    updateClock();
    setInterval(updateClock, 1000);

    // ============================================================
    // DAILY REKAP RESET
    // ============================================================
    const checkDailyReset = () => {
        if (dailyRekap.date !== getTodayStr()) {
            dailyRekap = { date: getTodayStr(), qrisTotal: 0, cashTotal: 0, productSales: {} };
            saveData();
        }
    };

    checkDailyReset();

    // ============================================================
    // LOGIN — PIN NUMPAD
    // ============================================================
    const updatePinDots = () => {
        for (let i = 1; i <= 6; i++) {
            const dot = $(`dot-${i}`);
            dot.classList.remove('filled', 'error');
            if (i <= currentPinInput.length) dot.classList.add('filled');
        }
    };

    const showPinError = () => {
        for (let i = 1; i <= 6; i++) {
            $(`dot-${i}`).classList.add('error');
        }
        setTimeout(() => {
            currentPinInput = '';
            updatePinDots();
        }, 600);
    };

    const attemptLogin = () => {
        const user = CONFIG.users.find(u => u.pin === currentPinInput);
        if (user) {
            currentUser = user;
            loginError.textContent = '';
            loginPage.classList.remove('active');
            appPage.classList.add('active');
            initApp();
        } else {
            loginError.textContent = 'PIN salah, coba lagi.';
            showPinError();
        }
    };

    document.querySelectorAll('.numpad-btn[data-num]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentPinInput.length < 6) {
                currentPinInput += btn.dataset.num;
                updatePinDots();
                loginError.textContent = '';
                if (currentPinInput.length === 6) {
                    setTimeout(attemptLogin, 200);
                }
            }
        });
    });

    $('numpad-del').addEventListener('click', () => {
        currentPinInput = currentPinInput.slice(0, -1);
        updatePinDots();
    });

    $('numpad-clear').addEventListener('click', () => {
        currentPinInput = '';
        updatePinDots();
        loginError.textContent = '';
    });

    loginBtn.addEventListener('click', () => {
        if (currentPinInput.length === 6) attemptLogin();
        else loginError.textContent = 'Masukkan 6 digit PIN.';
    });

    // Keyboard support for PIN
    document.addEventListener('keydown', (e) => {
        if (!loginPage.classList.contains('active')) return;
        if (e.key >= '0' && e.key <= '9' && currentPinInput.length < 6) {
            currentPinInput += e.key;
            updatePinDots();
            if (currentPinInput.length === 6) setTimeout(attemptLogin, 200);
        } else if (e.key === 'Backspace') {
            currentPinInput = currentPinInput.slice(0, -1);
            updatePinDots();
        } else if (e.key === 'Escape') {
            currentPinInput = '';
            updatePinDots();
        }
    });

    // ============================================================
    // LOGOUT
    // ============================================================
    logoutBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin keluar?')) {
            appPage.classList.remove('active');
            loginPage.classList.add('active');
            currentPinInput = '';
            currentUser = null;
            updatePinDots();
        }
    });

    // ============================================================
    // INIT APP
    // ============================================================
    const initApp = () => {
        // Update UI with User Data
        $('cashier-name').textContent = currentUser.name;
        $('cashier-name-sidebar').textContent = `Kasir: ${currentUser.name}`;
        $('store-name-sidebar').textContent = CONFIG.storeName;
        
        const userAvatars = document.querySelectorAll('.user-avatar, .store-avatar');
        userAvatars.forEach(av => av.textContent = currentUser.avatar);
        
        document.querySelector('.user-role').textContent = currentUser.role;

        renderCategories();
        renderProducts(products);
        renderCart();
        renderHistory();
        renderRekap();
    };

    // ============================================================
    // NAVIGATION
    // ============================================================
    const viewTitles = {
        'kasir-view': 'Kasir',
        'history-view': 'Riwayat Transaksi',
        'rekap-harian-view': 'Rekap Harian'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(target)?.classList.add('active');
            pageTitle.textContent = viewTitles[target] || '';

            const searchWrap = $('header-search-wrap');
            searchWrap.style.display = target === 'kasir-view' ? 'flex' : 'none';

            if (target === 'history-view') renderHistory();
            if (target === 'rekap-harian-view') renderRekap();
        });
    });

    // ============================================================
    // PRODUCTS
    // ============================================================
    const renderCategories = () => {
        const cats = ['All', ...new Set(products.map(p => p.category))];
        categoryTabs.innerHTML = '';
        cats.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-btn ${currentCategory === cat ? 'active' : ''}`;
            btn.textContent = cat;
            btn.onclick = () => {
                currentCategory = cat;
                renderCategories();
                const filtered = cat === 'All' 
                    ? products 
                    : products.filter(p => p.category === cat);
                renderProducts(filtered);
            };
            categoryTabs.appendChild(btn);
        });
    };

    const renderProducts = (list) => {
        productGrid.innerHTML = '';
        productCount.textContent = `${list.length} item`;
        list.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-card-emoji">${p.emoji}</div>
                <h3>${p.name}</h3>
                <p class="product-price">${formatRp(p.price)}</p>
                <div class="add-indicator"><i class="fas fa-plus"></i></div>
            `;
            card.addEventListener('click', () => addToCart(p));
            productGrid.appendChild(card);
        });
    };

    productSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(q));
        renderProducts(filtered);
    });

    // ============================================================
    // CART
    // ============================================================
    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        renderCart();
        // Ripple feedback
        const cards = productGrid.querySelectorAll('.product-card');
        cards.forEach(c => {
            if (c.querySelector('h3').textContent === product.name) {
                c.style.borderColor = 'var(--border-purple)';
                setTimeout(() => c.style.borderColor = '', 300);
            }
        });
    };

    const updateQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        renderCart();
    };

    const removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        renderCart();
    };

    const getCartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

    const renderCart = () => {
        const total = getCartTotal();

        // Remove old cart items (keep cart-empty)
        const existing = cartItemsWrap.querySelectorAll('.cart-item');
        existing.forEach(el => el.remove());

        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
        } else {
            cartEmpty.style.display = 'none';
            cart.forEach(item => {
                const el = document.createElement('div');
                el.className = 'cart-item';
                el.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${formatRp(item.price)} × ${item.qty} = ${formatRp(item.price * item.qty)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn remove" data-id="${item.id}"><i class="fas fa-trash-alt" style="font-size:0.6rem"></i></button>
                        <button class="qty-btn" data-id="${item.id}" data-delta="-1"><i class="fas fa-minus" style="font-size:0.6rem"></i></button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" data-id="${item.id}" data-delta="1"><i class="fas fa-plus" style="font-size:0.6rem"></i></button>
                    </div>
                `;
                cartItemsWrap.appendChild(el);
            });

            // Events
            cartItemsWrap.querySelectorAll('.qty-btn[data-delta]').forEach(btn => {
                btn.addEventListener('click', () => updateQty(btn.dataset.id, parseInt(btn.dataset.delta)));
            });
            cartItemsWrap.querySelectorAll('.qty-btn.remove').forEach(btn => {
                btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
            });
        }

        cartSubtotal.textContent = formatRp(total);
        cartTotal.textContent = formatRp(total);
        checkoutBtn.disabled = cart.length === 0;
    };

    clearCartBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        if (confirm('Kosongkan keranjang?')) {
            cart = [];
            renderCart();
        }
    });

    // ============================================================
    // CHECKOUT — go to payment view
    // ============================================================
    checkoutBtn.addEventListener('click', () => {
        const total = getCartTotal();
        paymentTotal.textContent = formatRp(total);

        // Render order summary
        paymentOrderItems.innerHTML = '';
        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'payment-order-item';
            row.innerHTML = `<span>${item.name} ×${item.qty}</span><span>${formatRp(item.price * item.qty)}</span>`;
            paymentOrderItems.appendChild(row);
        });

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        paymentView.classList.add('active');
        pageTitle.textContent = 'Pembayaran';
    });

    backToKasirBtn.addEventListener('click', () => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        $('kasir-view').classList.add('active');
        pageTitle.textContent = 'Kasir';
        navItems.forEach(n => {
            n.classList.toggle('active', n.dataset.target === 'kasir-view');
        });
    });

    // QRIS PAYMENT
    qrisPaymentBtn.addEventListener('click', () => {
        qrisAmountDisplay.textContent = formatRp(getCartTotal());
        qrisModal.classList.add('active');
    });

    printQrisBtn.addEventListener('click', () => {
        qrisModal.classList.remove('active');
        completeTransaction('QRIS', getCartTotal(), 0);
    });

    // CASH PAYMENT
    cashPaymentBtn.addEventListener('click', () => {
        const total = getCartTotal();
        cashTotalDisplay.textContent = formatRp(total);
        cashReceived.value = '';
        cashChange.textContent = formatRp(0);
        cashChange.className = 'change-amount';
        printCashBtn.disabled = true;

        // Quick cash buttons
        quickCashBtns.innerHTML = '';
        const suggestions = generateQuickCash(total);
        suggestions.forEach(amount => {
            const btn = document.createElement('button');
            btn.className = 'quick-cash-btn';
            btn.textContent = formatRp(amount);
            btn.addEventListener('click', () => {
                cashReceived.value = amount;
                cashReceived.dispatchEvent(new Event('input'));
            });
            quickCashBtns.appendChild(btn);
        });

        cashModal.classList.add('active');
    });

    const generateQuickCash = (total) => {
        const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
        const results = new Set();
        denominations.forEach(d => {
            const rounded = Math.ceil(total / d) * d;
            if (rounded >= total) results.add(rounded);
        });
        return [...results].slice(0, 4);
    };

    cashReceived.addEventListener('input', () => {
        const total = getCartTotal();
        const received = parseFloat(cashReceived.value) || 0;
        const change = received - total;
        cashChange.textContent = change >= 0 ? formatRp(change) : `- ${formatRp(Math.abs(change))}`;
        cashChange.className = 'change-amount' + (change < 0 ? ' negative' : '');
        printCashBtn.disabled = received < total;
    });

    printCashBtn.addEventListener('click', () => {
        const total = getCartTotal();
        const received = parseFloat(cashReceived.value) || 0;
        const change = received - total;
        cashModal.classList.remove('active');
        completeTransaction('Tunai', total, change);
    });

    // COMPLETE TRANSACTION
    const completeTransaction = (method, total, change) => {
        const trx = {
            id: generateId(),
            date: new Date().toISOString(),
            items: [...cart],
            method,
            total,
            change
        };

        transactions.unshift(trx);

        // Update rekap
        checkDailyReset();
        if (method === 'QRIS') dailyRekap.qrisTotal += total;
        else dailyRekap.cashTotal += total;
        cart.forEach(item => {
            dailyRekap.productSales[item.id] = (dailyRekap.productSales[item.id] || 0) + item.qty;
        });

        saveData();

        // Build struk
        const strukHTML = buildStrukHTML(trx);
        printArea.innerHTML = buildStrukPrintHTML(trx);
        printedStrukDetails.innerHTML = strukHTML;

        // Print
        window.print();

        // Show success
        strukNotif.classList.add('active');
    };

    backAfterPrintBtn.addEventListener('click', () => {
        strukNotif.classList.remove('active');
        cart = [];
        renderCart();
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        $('kasir-view').classList.add('active');
        pageTitle.textContent = 'Kasir';
        navItems.forEach(n => {
            n.classList.toggle('active', n.dataset.target === 'kasir-view');
        });
    });

    const buildStrukHTML = (trx) => {
        const lines = [
            `<strong>${CONFIG.storeName}</strong>`,
            `<span style="color:var(--text-muted);font-size:0.7rem">${CONFIG.storeAddress}</span>`,
            `<hr style="border-color:var(--border);margin:6px 0">`,
            `ID: ${trx.id}`,
            `Tgl: ${formatDate(trx.date)}`,
            `<hr style="border-color:var(--border);margin:6px 0">`,
        ];
        trx.items.forEach(item => {
            lines.push(`${item.name}`);
            lines.push(`<span style="color:var(--text-muted)">${item.qty} × ${formatRp(item.price)} = ${formatRp(item.price * item.qty)}</span>`);
        });
        lines.push(`<hr style="border-color:var(--border);margin:6px 0">`);
        lines.push(`<strong>TOTAL: ${formatRp(trx.total)}</strong>`);
        lines.push(`Metode: ${trx.method}`);
        if (trx.method === 'Tunai') {
            lines.push(`Bayar: ${formatRp(trx.total + trx.change)}`);
            lines.push(`Kembali: ${formatRp(trx.change)}`);
        }
        lines.push(`<hr style="border-color:var(--border);margin:6px 0">`);
        lines.push(`<span style="text-align:center;display:block">${CONFIG.thankYouMessage}</span>`);
        return lines.map(l => `<div>${l}</div>`).join('');
    };

    const buildStrukPrintHTML = (trx) => {
        let html = `<h2>${CONFIG.storeName}</h2>`;
        html += `<p style="text-align:center;font-size:10px">${CONFIG.storeAddress}</p>`;
        html += `<div class="separator"></div>`;
        html += `<p>No: ${trx.id}</p>`;
        html += `<p>Tgl: ${formatDate(trx.date)}</p>`;
        html += `<p>Kasir: ${currentUser.name}</p>`;
        html += `<div class="separator"></div>`;
        trx.items.forEach(item => {
            html += `<div class="item-row">
                <span class="name">${item.name}</span>
                <span class="subtotal">${formatRp(item.price * item.qty)}</span>
            </div>`;
            html += `<p style="font-size:10px;color:#666">${item.qty} × ${formatRp(item.price)}</p>`;
        });
        html += `<div class="separator"></div>`;
        html += `<div class="total-row"><span>TOTAL</span><span>${formatRp(trx.total)}</span></div>`;
        html += `<div class="total-row"><span>Metode</span><span>${trx.method}</span></div>`;
        if (trx.method === 'Tunai') {
            html += `<div class="total-row"><span>Bayar</span><span>${formatRp(trx.total + trx.change)}</span></div>`;
            html += `<div class="total-row"><span>Kembali</span><span>${formatRp(trx.change)}</span></div>`;
        }
        html += `<p class="thank-you">${CONFIG.thankYouMessage}</p>`;
        return html;
    };

    // HISTORY
    const renderHistory = () => {
        transactionListDiv.innerHTML = '';
        historyCount.textContent = `${transactions.length} transaksi`;

        if (transactions.length === 0) {
            transactionListDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Belum ada transaksi</p>
                </div>`;
            return;
        }

        transactions.forEach(trx => {
            const el = document.createElement('div');
            el.className = 'transaction-item';
            el.innerHTML = `
                <div class="transaction-type-badge ${trx.method === 'QRIS' ? 'qris' : 'cash'}">
                    <i class="fas fa-${trx.method === 'QRIS' ? 'qrcode' : 'money-bill-wave'}"></i>
                </div>
                <div class="transaction-info">
                    <strong>${trx.id}</strong>
                    <small>${formatDate(trx.date)} · ${trx.items.length} item · ${trx.method}</small>
                </div>
                <span class="transaction-amount">${formatRp(trx.total)}</span>
            `;
            el.addEventListener('click', () => showTransactionDetail(trx));
            transactionListDiv.appendChild(el);
        });
    };

    const showTransactionDetail = (trx) => {
        const modal = $('transaction-detail-modal');
        const content = $('transaction-detail-content');
        content.innerHTML = buildStrukHTML(trx);
        modal.classList.add('active');
    };

    // REKAP HARIAN
    const renderRekap = () => {
        checkDailyReset();
        const allTotal = dailyRekap.qrisTotal + dailyRekap.cashTotal;
        rekapQrisTotal.textContent = formatRp(dailyRekap.qrisTotal);
        rekapTunaiTotal.textContent = formatRp(dailyRekap.cashTotal);
        rekapAllTotal.textContent = formatRp(allTotal);
    };

    showDetailedRekapBtn.addEventListener('click', () => {
        const isVisible = detailedRekapContent.style.display === 'block';
        detailedRekapContent.style.display = isVisible ? 'none' : 'block';
        showDetailedRekapBtn.innerHTML = isVisible
            ? '<i class="fas fa-list-alt"></i> Lihat Detail Penjualan'
            : '<i class="fas fa-eye-slash"></i> Sembunyikan Detail';

        if (!isVisible) {
            rekapProductQty.innerHTML = '';
            const sales = dailyRekap.productSales;
            const entries = Object.entries(sales);
            if (entries.length === 0) {
                rekapProductQty.innerHTML = '<li style="color:var(--text-muted);font-size:0.82rem">Belum ada penjualan hari ini</li>';
                return;
            }
            entries.sort((a, b) => b[1] - a[1]).forEach(([id, qty]) => {
                const product = products.find(p => p.id === id);
                const li = document.createElement('li');
                li.innerHTML = `<span>${product ? product.emoji + ' ' + product.name : id}</span><span>${qty} pcs</span>`;
                rekapProductQty.appendChild(li);
            });
        }
    });

    tutupTokoBtn.addEventListener('click', () => {
        if (confirm('Tutup toko hari ini? Data rekap harian akan direset.')) {
            dailyRekap = { date: getTodayStr(), qrisTotal: 0, cashTotal: 0, productSales: {} };
            saveData();
            renderRekap();
            detailedRekapContent.style.display = 'none';
            showDetailedRekapBtn.innerHTML = '<i class="fas fa-list-alt"></i> Lihat Detail Penjualan';
            alert('Toko telah ditutup. Selamat beristirahat!');
        }
    });

    // ============================================================
    // MODALS — Close buttons
    // ============================================================
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.modal)?.classList.remove('active');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

});