/* AutoInsight System — main.js
   Unified state management, routing, and all page wiring.
   Uses localStorage for demo data (no backend required). */

(function () {
    'use strict';

    const STORAGE_KEY = 'autoinsight_v1';

    /* ──────────────────────────────────────────────
       PATH / ROOT HELPERS
       Pages live at depth:
         - login.html, register.html, forgot-password.html → root (depth 0)
         - pages/admin/admin-dashboard.html              → depth 2
    ──────────────────────────────────────────────── */
    function rootPrefix() {
        const parts = location.pathname.replace(/\\/g, '/').split('/').filter(Boolean);
        // Count how many real path segments there are (ignoring the filename)
        // Root file      : ['login.html']           → 0 dirs → prefix ''
        // One deep       : ['pages', 'admin', 'x']  → 2 dirs → prefix '../../'
        const dirs = parts.length > 0 ? parts.length - 1 : 0;
        return dirs === 0 ? '' : '../'.repeat(dirs);
    }

    function toRoot(p) { return rootPrefix() + p; }

    const ROLE_TO_DASH = {
        admin: 'pages/admin/admin-dashboard.html',
        client: 'pages/client/client-dashboard.html',
        technician: 'pages/technician/technician-dashboard.html',
        'service-manager': 'pages/manager/manager-dashboard.html',
        'general-manager': 'pages/manager/general-manager-dashboard.html',
        'stock-keeper': 'pages/inventory/inventory-dashboard.html',
        'finance-manager': 'pages/finance/finance-dashboard.html',
        'data-analyst': 'pages/analytics/data-dashboard.html',
    };

    /* ──────────────────────────────────────────────
       STATE
    ──────────────────────────────────────────────── */
    function loadState() {
        try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
    }

    function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { } }

    function seed() {
        const s = {
            currentUser: null,
            users: [
                { email: 'admin@autoinsight.com', password: 'password', role: 'admin', name: 'Admin User', phone: '+1 555 0100', address: '1 Admin Way' },
                { email: 'client@autoinsight.com', password: 'password', role: 'client', name: 'Jane Doe', phone: '+1 555 0200', address: '42 Oak St' },
                { email: 'tech@autoinsight.com', password: 'password', role: 'technician', name: 'Mike Thompson', phone: '+1 555 0300', address: '7 Garage Rd' },
                { email: 'manager@autoinsight.com', password: 'password', role: 'service-manager', name: 'Sarah Brown', phone: '+1 555 0400', address: '15 Service Blvd' },
                { email: 'gm@autoinsight.com', password: 'password', role: 'general-manager', name: 'James Lee', phone: '+1 555 0500', address: '88 HQ Tower' },
                { email: 'stock@autoinsight.com', password: 'password', role: 'stock-keeper', name: 'Carlos Rivera', phone: '+1 555 0600', address: '22 Warehouse Ave' },
                { email: 'finance@autoinsight.com', password: 'password', role: 'finance-manager', name: 'Priya Sharma', phone: '+1 555 0700', address: '9 Finance St' },
                { email: 'analyst@autoinsight.com', password: 'password', role: 'data-analyst', name: 'Alex Kim', phone: '+1 555 0800', address: '3 Data Ln' },
            ],
            vehicles: [
                { id: 'V001', clientEmail: 'client@autoinsight.com', make: 'Ford', model: 'Bronco', year: 2021, plate: 'XYZ-1234', vin: '1FMEE5DP4MLA00001', color: 'Blue', status: 'Healthy' },
                { id: 'V002', clientEmail: 'client@autoinsight.com', make: 'Honda', model: 'Civic', year: 2018, plate: 'ABC-9876', vin: 'JHMFC1F35JX000002', color: 'Silver', status: 'Service Required' },
            ],
            workOrders: [
                { id: 'WO-4592', vehicleId: 'V001', vehicle: '2021 Ford Bronco', license: 'XYZ-1234', service: 'Engine Diagnostics', status: 'In Progress', priority: 'High', techEmail: 'tech@autoinsight.com', complaint: 'Check engine light on, shudders at speed.', notes: [{ at: 'Mar 5, 09:30 AM', text: 'OBD-II scan — P0301 misfire code. Checking plugs.' }], checklist: [] },
                { id: 'WO-4595', vehicleId: 'V002', vehicle: '2018 Honda Civic', license: 'ABC-9876', service: 'Brake Pad Replacement', status: 'Waiting on Parts', priority: 'Medium', techEmail: 'tech@autoinsight.com', complaint: 'Grinding noise during braking.', notes: [], checklist: [] },
                { id: 'WO-4601', vehicleId: 'V001', vehicle: '2021 Ford Bronco', license: 'XYZ-1234', service: 'Full Service Inspection', status: 'Queued', priority: 'Low', techEmail: '', complaint: 'Routine annual check.', notes: [], checklist: [] },
                { id: 'WO-4588', vehicleId: 'V002', vehicle: '2018 Honda Civic', license: 'ABC-9876', service: 'Oil Change', status: 'Completed', priority: 'Low', techEmail: 'tech@autoinsight.com', complaint: 'Routine oil change.', notes: [{ at: 'Mar 1, 02:00 PM', text: 'Completed. Used Mobil 1 5W-30.' }], checklist: [] },
            ],
            appointments: [
                { id: 'APT-001', clientEmail: 'client@autoinsight.com', vehicleId: 'V001', service: 'Oil Change', date: '2026-03-15', time: '10:00', notes: 'Need synthetic oil.', status: 'Confirmed' },
                { id: 'APT-002', clientEmail: 'client@autoinsight.com', vehicleId: 'V002', service: 'Brake Inspection', date: '2026-03-22', time: '14:00', notes: '', status: 'Pending' },
            ],
            inventory: [
                { sku: 'OIL-5W30', name: 'Synthetic Oil 5W-30', category: 'Fluids', qty: 45, unit: 'L', price: 8.50, minStock: 20 },
                { sku: 'BP-1002', name: 'Brake Pads (Front)', category: 'Brakes', qty: 2, unit: 'Units', price: 45.00, minStock: 15 },
                { sku: 'SP-102', name: 'Spark Plugs (Set)', category: 'Ignition', qty: 24, unit: 'Sets', price: 12.00, minStock: 10 },
                { sku: 'AF-205', name: 'Air Filter', category: 'Filters', qty: 18, unit: 'Units', price: 15.00, minStock: 10 },
                { sku: 'COL-001', name: 'Coolant (1L)', category: 'Fluids', qty: 8, unit: 'L', price: 6.50, minStock: 12 },
                { sku: 'TRW-88', name: 'Wiper Blades (Pair)', category: 'Accessories', qty: 30, unit: 'Pairs', price: 18.00, minStock: 10 },
            ],
            partsRequests: [
                { id: 'PR-001', woId: 'WO-4595', techEmail: 'tech@autoinsight.com', part: 'Brake Pads (Front)', qty: 2, priority: 'High', status: 'Pending', at: '2026-03-05' },
            ],
            invoices: [
                { id: 'INV-2001', clientEmail: 'client@autoinsight.com', woId: 'WO-4588', amount: 95.00, tax: 9.50, total: 104.50, status: 'Paid', dueDate: '2026-02-28', issuedDate: '2026-02-20' },
                { id: 'INV-2002', clientEmail: 'client@autoinsight.com', woId: 'WO-4592', amount: 340.00, tax: 34.00, total: 374.00, status: 'Pending', dueDate: '2026-03-20', issuedDate: '2026-03-05' },
                { id: 'INV-2003', clientEmail: 'client@autoinsight.com', woId: 'WO-4595', amount: 210.00, tax: 21.00, total: 231.00, status: 'Sent', dueDate: '2026-03-25', issuedDate: '2026-03-06' },
            ],
            payments: [
                { id: 'PAY-001', invoiceId: 'INV-2001', amount: 104.50, method: 'Card', at: '2026-02-28' },
            ],
            obdReadings: [
                { vehicleId: 'V001', ts: '2026-03-06T01:00:00Z', rpm: 780, speed: 0, coolant: 88, fuel: 72, battery: 14.1, engine_load: 12, o2: 3.2, health: 91, category: 'Good' },
                { vehicleId: 'V002', ts: '2026-03-06T01:00:00Z', rpm: 820, speed: 0, coolant: 95, fuel: 31, battery: 12.6, engine_load: 18, o2: 5.8, health: 54, category: 'Warning' },
            ],
            chatMessages: [],
        };
        saveState(s);
        return s;
    }

    function state() { return loadState() || seed(); }

    /* ──────────────────────────────────────────────
       UTILITIES
    ──────────────────────────────────────────────── */
    function toast(msg, type) {
        const color = type === 'error' ? '#f43f5e' : type === 'warning' ? '#f59e0b' : '#10b981';
        try {
            const wrap = document.createElement('div');
            wrap.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            wrap.style.zIndex = 99999;
            wrap.innerHTML = `
              <div class="toast align-items-center border-0 glass-toast custom-toast" role="alert" style="border-left-color:${color} !important">
                <div class="d-flex">
                  <div class="toast-body fw-semibold">${msg}</div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
              </div>`;
            document.body.appendChild(wrap);
            const t = wrap.querySelector('.toast');
            const bs = new bootstrap.Toast(t, { delay: 2800 });
            bs.show();
            t.addEventListener('hidden.bs.toast', () => wrap.remove());
        } catch { alert(msg); }
    }

    function dashboardHref() {
        const s = state();
        const role = s.currentUser?.role || 'admin';
        return toRoot(ROLE_TO_DASH[role] || ROLE_TO_DASH.admin);
    }

    function ensureUserPerms(u) {
        if (!u.permissions) {
            const map = {
                admin: ['admin', 'appointments', 'work_orders', 'inventory', 'finance', 'analytics'],
                client: ['appointments'],
                technician: ['work_orders'],
                'service-manager': ['appointments', 'work_orders'],
                'general-manager': ['analytics', 'finance', 'inventory', 'work_orders', 'appointments'],
                'stock-keeper': ['inventory'],
                'finance-manager': ['finance'],
                'data-analyst': ['analytics'],
            };
            u.permissions = map[u.role] || ['appointments'];
        }
        return u;
    }

    function avatarUrl(name, color) {
        const bg = (color || '4361ee').replace('#', '');
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${bg}&color=fff&rounded=true`;
    }

    /* ──────────────────────────────────────────────
       TOPBAR BACK BUTTON
    ──────────────────────────────────────────────── */
    function addTopbarBackButton() {
        const isAuthPage = /\/(login|register|forgot-password|change-password)\.html/.test(location.pathname);
        const isDashboard = /\/(admin|client|technician|manager|general-manager|inventory|finance|data)-dashboard\.html/.test(location.pathname) ||
            location.pathname.endsWith('admin-dashboard.html') ||
            location.pathname.endsWith('client-dashboard.html') ||
            location.pathname.endsWith('technician-dashboard.html') ||
            location.pathname.endsWith('manager-dashboard.html') ||
            location.pathname.endsWith('general-manager-dashboard.html') ||
            location.pathname.endsWith('inventory-dashboard.html') ||
            location.pathname.endsWith('finance-dashboard.html') ||
            location.pathname.endsWith('data-dashboard.html');
        const isIndex = /\/(index\.html|)$/.test(location.pathname);

        if (isAuthPage || isDashboard || isIndex) return;

        const topbar = document.querySelector('.topbar');
        if (!topbar) return;
        const title = topbar.querySelector('h1,h2,h3,h4,h5,h6');
        if (!title || title.querySelector('.topbar-back-btn')) return;

        const a = document.createElement('a');
        a.href = '#';
        a.className = 'topbar-back-btn';
        a.innerHTML = '<i class="bi bi-arrow-left"></i>';
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.history.length > 1) window.history.back();
            else location.href = dashboardHref();
        });
        title.classList.add('d-flex', 'align-items-center');
        title.prepend(a);
    }

    /* ──────────────────────────────────────────────
       THEME TOGGLE
    ──────────────────────────────────────────────── */
    function wireTheme() {
        const btn = document.getElementById('themeSwitch');
        if (!btn) return;
        const k = 'ai_theme';
        const saved = localStorage.getItem(k) || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem(k, next);
            btn.querySelector('i').className = next === 'dark' ? 'bi bi-moon-stars' : 'bi bi-sun';
        });
    }

    /* ──────────────────────────────────────────────
       SIDEBAR TOGGLE (mobile)
    ──────────────────────────────────────────────── */
    function wireSidebarToggle() {
        const btn = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        if (!btn || !sidebar) return;

        // Create overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        btn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    /* ──────────────────────────────────────────────
       TOPBAR: user info
    ──────────────────────────────────────────────── */
    function populateTopbarUser() {
        const s = state();
        const user = s.currentUser;
        if (!user) return;

        const nameEl = document.querySelector('.topbar-username');
        const imgEl = document.querySelector('.user-profile img');
        const roleEl = document.querySelector('.topbar-role');

        if (nameEl) nameEl.textContent = user.name || 'User';
        if (roleEl) roleEl.textContent = user.role || '';
        if (imgEl) imgEl.src = avatarUrl(user.name, '4361ee');

        const logoutLinks = document.querySelectorAll('.logout-link');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const s2 = state();
                s2.currentUser = null;
                saveState(s2);
                toast('Logged out.');
                setTimeout(() => location.href = toRoot('login.html'), 300);
            });
        });
    }

    /* ──────────────────────────────────────────────
       LOGIN
    ──────────────────────────────────────────────── */
    function wireLogin() {
        const form = document.getElementById('loginForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('#loginEmail')?.value?.trim() || '';
            const password = form.querySelector('#loginPassword')?.value || '';
            const roleSelect = form.querySelector('#roleSelect')?.value;

            const s = state();
            const user = s.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (user) {
                s.currentUser = user;
                saveState(s);
                toast('Welcome back, ' + user.name + '!');
                setTimeout(() => location.href = toRoot(ROLE_TO_DASH[user.role] || ROLE_TO_DASH.admin), 250);
            } else if (roleSelect) {
                // Demo mode: any credentials → route by selected role
                s.currentUser = { email: email || 'demo@autoinsight.com', name: 'Demo User', role: roleSelect };
                saveState(s);
                toast('Demo login as ' + roleSelect);
                setTimeout(() => location.href = toRoot(ROLE_TO_DASH[roleSelect] || ROLE_TO_DASH.admin), 250);
            } else {
                toast('Invalid email or password.', 'error');
            }
        });
    }

    /* ──────────────────────────────────────────────
       REGISTER
    ──────────────────────────────────────────────── */
    function wireRegister() {
        const form = document.getElementById('registerForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstName = form.querySelector('#regFirstName')?.value?.trim() || '';
            const lastName = form.querySelector('#regLastName')?.value?.trim() || '';
            const email = form.querySelector('#regEmail')?.value?.trim() || '';
            const phone = form.querySelector('#regPhone')?.value?.trim() || '';
            const p1 = form.querySelector('#regPassword')?.value || '';
            const p2 = form.querySelector('#regPasswordConfirm')?.value || '';

            if (p1 !== p2) { toast('Passwords do not match.', 'error'); return; }
            if (p1.length < 6) { toast('Password must be at least 6 characters.', 'error'); return; }

            const s = state();
            if (s.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                toast('An account with this email already exists.', 'error'); return;
            }
            const name = `${firstName} ${lastName}`.trim();
            const user = { email, password: p1, role: 'client', name, phone, address: '' };
            ensureUserPerms(user);
            s.users.push(user);
            s.currentUser = user;
            saveState(s);
            toast('Account created! Welcome, ' + name + '!');
            setTimeout(() => location.href = toRoot(ROLE_TO_DASH.client), 300);
        });
    }

    /* ──────────────────────────────────────────────
       FORGOT PASSWORD
    ──────────────────────────────────────────────── */
    function wireForgotPassword() {
        const form = document.getElementById('forgotForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const card = document.getElementById('forgotCard');
            const success = document.getElementById('forgotSuccess');
            if (card) card.style.display = 'none';
            if (success) success.style.display = 'block';
        });
    }

    /* ──────────────────────────────────────────────
       ADMIN: USER MANAGEMENT
    ──────────────────────────────────────────────── */
    function wireAdminUsers() {
        const table = document.getElementById('adminUsersTable');
        if (!table) return;

        const search = document.getElementById('adminUserSearch');
        const btnCreate = document.getElementById('btnCreateUser');
        const modalEl = document.getElementById('userModal');
        const permModalEl = document.getElementById('permModal');

        const s = state();
        s.users = (s.users || []).map(ensureUserPerms);
        saveState(s);

        const bsModal = modalEl && window.bootstrap ? new bootstrap.Modal(modalEl) : null;
        const bsPermModal = permModalEl && window.bootstrap ? new bootstrap.Modal(permModalEl) : null;

        function badgeList(perms) {
            const p = (perms || []).slice(0, 3);
            const more = (perms || []).length - p.length;
            return p.map(x => `<span class="badge badge-outline badge-outline-primary me-1">${x}</span>`).join('')
                + (more > 0 ? `<span class="badge badge-outline-primary ms-1">+${more}</span>` : '');
        }

        function render(rows) {
            const tbody = table.querySelector('.data-body-container');
            if (!tbody) return;
            tbody.innerHTML = rows.map(u => `
              <div class="data-row">
                <div class="data-cell">
                  <div class="d-flex align-items-center gap-2">
                    <img src="${avatarUrl(u.name)}" width="32" height="32" class="rounded-circle" alt="">
                    <span class="fw-bold">${u.name || '-'}</span>
                  </div>
                </div>
                <div class="data-cell data-cell-muted">${u.email || '-'}</div>
                <div class="data-cell"><span class="badge badge-outline text-white" style="border-color:rgba(255,255,255,.15)">${u.role}</span></div>
                <div class="data-cell">${badgeList(u.permissions)}</div>
                <div class="text-end">
                  <button class="row-action-btn" data-action="edit" data-email="${encodeURIComponent(u.email)}" title="Edit"><i class="bi bi-pencil"></i></button>
                  <button class="row-action-btn" data-action="perms" data-email="${encodeURIComponent(u.email)}" title="Permissions"><i class="bi bi-shield-lock"></i></button>
                  <button class="row-action-btn danger" data-action="delete" data-email="${encodeURIComponent(u.email)}" title="Delete"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            `).join('');
        }

        function refresh() {
            const q = (search?.value || '').trim().toLowerCase();
            const s2 = state();
            const users = (s2.users || []).map(ensureUserPerms);
            render(q ? users.filter(u => (u.name + u.email + u.role).toLowerCase().includes(q)) : users);
        }

        // Modal form elements
        const f = document.getElementById('userForm');
        const titleEl = document.getElementById('userModalTitle');
        const emailOriginal = document.getElementById('userFormEmailOriginal');
        const nameEl2 = document.getElementById('userFormName');
        const emailEl = document.getElementById('userFormEmail');
        const passEl = document.getElementById('userFormPassword');
        const roleEl = document.getElementById('userFormRole');

        if (btnCreate) btnCreate.addEventListener('click', () => {
            if (titleEl) titleEl.textContent = 'New User';
            if (emailOriginal) emailOriginal.value = '';
            [nameEl2, emailEl, passEl].forEach(el => { if (el) el.value = ''; });
            if (roleEl) roleEl.value = 'client';
            bsModal?.show();
        });

        if (f) f.addEventListener('submit', (e) => {
            e.preventDefault();
            const s3 = state();
            s3.users = (s3.users || []).map(ensureUserPerms);
            const original = (emailOriginal?.value || '').toLowerCase();
            const email = (emailEl?.value || '').trim();
            const role = roleEl?.value || 'client';
            const name = nameEl2?.value?.trim() || 'User';

            const exists = s3.users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.email.toLowerCase() !== original);
            if (exists) { toast('Email already exists.', 'error'); return; }

            if (original) {
                const u = s3.users.find(x => x.email.toLowerCase() === original);
                if (u) { u.email = email; u.name = name; u.password = passEl?.value || u.password; u.role = role; ensureUserPerms(u); }
                toast('User updated.');
            } else {
                const nu = { email, name, password: passEl?.value || 'password', role };
                ensureUserPerms(nu);
                s3.users.push(nu);
                toast('User created.');
            }
            saveState(s3);
            bsModal?.hide();
            refresh();
        });

        // Perm modal
        const permUserEmail = document.getElementById('permUserEmail');
        const permEmailHidden = document.getElementById('permEmail');
        const permForm = document.getElementById('permForm');
        const permKeys = ['appointments', 'work_orders', 'inventory', 'finance', 'analytics', 'admin'];

        function openPerms(user) {
            if (permUserEmail) permUserEmail.textContent = user.email;
            if (permEmailHidden) permEmailHidden.value = user.email;
            const perms = new Set(user.permissions || []);
            permKeys.forEach(k => {
                const el = document.getElementById('perm_' + k);
                if (el) el.checked = perms.has(k);
            });
            bsPermModal?.show();
        }

        if (permForm) permForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const s4 = state();
            const email = (permEmailHidden?.value || '').toLowerCase();
            const u = s4.users.find(x => x.email.toLowerCase() === email);
            if (!u) { toast('User not found.', 'error'); return; }
            u.permissions = permKeys.filter(k => document.getElementById('perm_' + k)?.checked);
            saveState(s4);
            toast('Permissions saved.');
            bsPermModal?.hide();
            refresh();
        });

        table.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const email = decodeURIComponent(btn.dataset.email || '');
            const s5 = state();
            const u = s5.users.map(ensureUserPerms).find(x => x.email === email);
            if (!u) return;
            if (action === 'edit') {
                if (titleEl) titleEl.textContent = 'Edit User';
                if (emailOriginal) emailOriginal.value = u.email;
                if (nameEl2) nameEl2.value = u.name;
                if (emailEl) emailEl.value = u.email;
                if (passEl) passEl.value = u.password || '';
                if (roleEl) roleEl.value = u.role;
                bsModal?.show();
            } else if (action === 'perms') {
                openPerms(u);
            } else if (action === 'delete') {
                if (s5.currentUser?.email === email) { toast('Cannot delete current user.', 'error'); return; }
                s5.users = s5.users.filter(x => x.email !== email);
                saveState(s5);
                toast('User deleted.');
                refresh();
            }
        });

        if (search) search.addEventListener('input', refresh);
        refresh();
    }

    /* ──────────────────────────────────────────────
       WORK ORDERS (technician / manager)
    ──────────────────────────────────────────────── */
    function wireWorkOrders() {
        const table = document.getElementById('workOrdersTable');
        if (!table) return;
        const search = document.getElementById('woSearch');
        const filter = document.getElementById('woFilter');
        const s = state();

        function stClass(st) {
            const map = { 'In Progress': 'in-progress', 'Completed': 'completed', 'Queued': 'queued', 'Waiting on Parts': 'pending' };
            return map[st] || 'queued';
        }
        function priBadge(p) { return p === 'High' ? 'bg-danger' : p === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'; }

        function render(rows) {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            tbody.innerHTML = rows.length ? rows.map(wo => `
              <tr>
                <td><span class="fw-bold">#${wo.id}</span></td>
                <td>${wo.vehicle}<br><small class="text-muted">${wo.license}</small></td>
                <td>${wo.service}</td>
                <td><span class="badge ${priBadge(wo.priority)}">${wo.priority}</span></td>
                <td><span class="status-badge ${stClass(wo.status)}">${wo.status}</span></td>
                <td>
                  <a class="btn btn-sm btn-primary me-1" href="work-order-details.html?wo=${wo.id}">Open</a>
                  ${wo.status !== 'Completed' ? `<button class="btn btn-sm btn-outline-success complete-wo-btn" data-wo="${wo.id}">Complete</button>` : ''}
                </td>
              </tr>
            `).join('') : `<tr><td colspan="6" class="text-center text-muted py-4">No work orders found.</td></tr>`;

            tbody.querySelectorAll('.complete-wo-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const s2 = state();
                    const wo2 = s2.workOrders.find(w => w.id === btn.dataset.wo);
                    if (wo2) { wo2.status = 'Completed'; saveState(s2); toast('Work order completed!'); refresh(); }
                });
            });
        }

        function refresh() {
            const q = (search?.value || '').toLowerCase();
            const f = filter?.value || 'all';
            let rows = state().workOrders;
            if (q) rows = rows.filter(w => (w.id + w.vehicle + w.service + w.status).toLowerCase().includes(q));
            if (f !== 'all') rows = rows.filter(w => w.status.toLowerCase().includes(f.toLowerCase()));
            render(rows);
        }

        if (search) search.addEventListener('input', refresh);
        if (filter) filter.addEventListener('change', refresh);
        refresh();
    }

    /* ──────────────────────────────────────────────
       WORK ORDER DETAILS
    ──────────────────────────────────────────────── */
    function wireWorkOrderDetails() {
        if (!location.pathname.includes('work-order-details')) return;
        const url = new URL(location.href);
        const id = url.searchParams.get('wo') || 'WO-4592';
        const s = state();
        const wo = s.workOrders.find(w => w.id === id) || s.workOrders[0];
        if (!wo) return;

        const setEl = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
        setEl('#wo-id', wo.id);
        setEl('#wo-vehicle', wo.vehicle);
        setEl('#wo-service', wo.service);
        setEl('#wo-status', wo.status);
        setEl('#wo-priority', wo.priority);
        setEl('#wo-license', wo.license);
        setEl('#wo-complaint', wo.complaint || '-');

        const notesContainer = document.getElementById('wo-notes');
        if (notesContainer) {
            notesContainer.innerHTML = (wo.notes || []).map(n =>
                `<div class="alert alert-secondary"><strong>${n.at}:</strong> ${n.text}</div>`
            ).join('') || '<p class="text-muted">No notes yet.</p>';
        }

        // Add note form
        const noteForm = document.getElementById('addNoteForm');
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const txt = noteForm.querySelector('textarea')?.value?.trim();
                if (!txt) return;
                const s2 = state();
                const wo2 = s2.workOrders.find(w => w.id === id);
                if (wo2) {
                    wo2.notes = wo2.notes || [];
                    wo2.notes.push({ at: new Date().toLocaleString(), text: txt });
                    saveState(s2);
                    toast('Note added.');
                    location.reload();
                }
            });
        }

        // Complete button
        const completeBtn = document.getElementById('completeOrderBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                const s3 = state();
                const wo3 = s3.workOrders.find(w => w.id === id);
                if (wo3) { wo3.status = 'Completed'; saveState(s3); toast('Work order marked complete!'); setTimeout(() => history.back(), 400); }
            });
        }
    }

    /* ──────────────────────────────────────────────
       APPOINTMENTS
    ──────────────────────────────────────────────── */
    function wireAppointments() {
        const form = document.getElementById('appointmentForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const s = state();
            const vehicleId = form.querySelector('#apptVehicle')?.value || '';
            const service = form.querySelector('#apptService')?.value || '';
            const date = form.querySelector('#apptDate')?.value || '';
            const time = form.querySelector('#apptTime')?.value || '';
            const notes = form.querySelector('#apptNotes')?.value || '';
            if (!date || !time) { toast('Please select date and time.', 'error'); return; }
            const id = 'APT-' + (Date.now() % 10000);
            s.appointments.push({ id, clientEmail: s.currentUser?.email || '', vehicleId, service, date, time, notes, status: 'Pending' });
            saveState(s);
            toast('Appointment booked!');
            setTimeout(() => location.href = toRoot(ROLE_TO_DASH.client), 300);
        });

        // Cancel buttons in list
        document.querySelectorAll('.cancel-appt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = state();
                const id = btn.dataset.appt;
                const appt = s.appointments.find(a => a.id === id);
                if (appt) { appt.status = 'Cancelled'; saveState(s); toast('Appointment cancelled.'); location.reload(); }
            });
        });

        // Populate vehicle dropdown
        const vehicleSelect = form.querySelector('#apptVehicle');
        if (vehicleSelect) {
            const s = state();
            const userEmail = s.currentUser?.email || '';
            const vehicles = s.vehicles.filter(v => v.clientEmail === userEmail);
            vehicleSelect.innerHTML = `<option value="">Select vehicle...</option>` +
                vehicles.map(v => `<option value="${v.id}">${v.year} ${v.make} ${v.model} (${v.plate})</option>`).join('');
        }
    }

    /* ──────────────────────────────────────────────
       PAYMENTS
    ──────────────────────────────────────────────── */
    function wirePayments() {
        const form = document.getElementById('paymentForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const method = form.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
            if (method === 'card') {
                const cn = form.querySelector('#cardNumber')?.value?.replace(/\D/g, '') || '';
                const cvv = form.querySelector('#cvv')?.value?.replace(/\D/g, '') || '';
                const exp = form.querySelector('#expiryDate')?.value || '';
                if (cn.length < 13 || cn.length > 16) { toast('Invalid card number.', 'error'); return; }
                if (cvv.length < 3) { toast('Invalid CVV.', 'error'); return; }
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) { toast('Expiry must be MM/YY', 'error'); return; }
            }
            const s = state();
            s.payments.push({ id: 'PAY-' + Date.now(), amount: 'demo', method, at: new Date().toISOString() });
            saveState(s);
            toast('Payment processed!');
            setTimeout(() => location.href = toRoot(ROLE_TO_DASH.client), 300);
        });

        // Toggle card fields
        const radioButtons = form.querySelectorAll('input[name="paymentMethod"]');
        const cardFields = document.getElementById('cardFields');
        radioButtons.forEach(r => r.addEventListener('change', () => {
            if (cardFields) cardFields.style.display = r.value === 'card' ? 'block' : 'none';
        }));
    }

    /* ──────────────────────────────────────────────
       INVENTORY
    ──────────────────────────────────────────────── */
    function wireInventory() {
        const table = document.getElementById('inventoryTable');
        if (!table) return;
        const search = document.getElementById('invSearch');
        const s = state();

        function render(rows) {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            tbody.innerHTML = rows.map(item => {
                const low = item.qty <= item.minStock;
                return `
                  <tr>
                    <td class="fw-mono">${item.sku}</td>
                    <td class="fw-bold">${item.name}</td>
                    <td><span class="badge bg-secondary">${item.category}</span></td>
                    <td>${item.qty} ${item.unit} ${low ? '<span class="badge bg-danger ms-1">Low</span>' : ''}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.minStock}</td>
                    <td>
                      <button class="row-action-btn inv-edit" data-sku="${item.sku}" title="Edit"><i class="bi bi-pencil"></i></button>
                      <button class="row-action-btn danger inv-del" data-sku="${item.sku}" title="Delete"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                `;
            }).join('') || `<tr><td colspan="7" class="text-center text-muted py-4">No items found.</td></tr>`;
        }

        function refresh() {
            const q = (search?.value || '').toLowerCase();
            const rows = q ? state().inventory.filter(i => (i.sku + i.name + i.category).toLowerCase().includes(q)) : state().inventory;
            render(rows);
        }

        if (search) search.addEventListener('input', refresh);

        table.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.inv-del');
            if (delBtn) {
                const s2 = state();
                s2.inventory = s2.inventory.filter(i => i.sku !== delBtn.dataset.sku);
                saveState(s2);
                toast('Item removed.');
                refresh();
            }
        });

        refresh();

        // Add item form
        const addForm = document.getElementById('addInventoryForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const s2 = state();
                const item = {
                    sku: addForm.querySelector('#invSku')?.value || '',
                    name: addForm.querySelector('#invName')?.value || '',
                    category: addForm.querySelector('#invCategory')?.value || '',
                    qty: parseInt(addForm.querySelector('#invQty')?.value || 0),
                    unit: addForm.querySelector('#invUnit')?.value || 'Units',
                    price: parseFloat(addForm.querySelector('#invPrice')?.value || 0),
                    minStock: parseInt(addForm.querySelector('#invMinStock')?.value || 0),
                };
                s2.inventory.push(item);
                saveState(s2);
                toast('Item added to inventory.');
                const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
                modal?.hide();
                refresh();
            });
        }
    }

    /* ──────────────────────────────────────────────
       INVOICES (finance)
    ──────────────────────────────────────────────── */
    function wireInvoices() {
        const table = document.getElementById('invoicesTable');
        if (!table) return;
        const s = state();

        function statusBadge(st) {
            const map = { Paid: 'bg-success', Pending: 'bg-warning text-dark', Sent: 'bg-info text-dark', Overdue: 'bg-danger' };
            return `<span class="badge ${map[st] || 'bg-secondary'}">${st}</span>`;
        }

        function render(rows) {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            tbody.innerHTML = rows.map(inv => `
              <tr>
                <td class="fw-bold">${inv.id}</td>
                <td>${inv.clientEmail}</td>
                <td>${inv.woId}</td>
                <td>$${inv.total.toFixed(2)}</td>
                <td>${statusBadge(inv.status)}</td>
                <td>${inv.dueDate}</td>
                <td>
                  <button class="row-action-btn send-inv" data-id="${inv.id}" title="Send"><i class="bi bi-send"></i></button>
                  <button class="row-action-btn success mark-paid" data-id="${inv.id}" title="Mark Paid"><i class="bi bi-check-circle"></i></button>
                </td>
              </tr>
            `).join('') || `<tr><td colspan="7" class="text-center text-muted py-4">No invoices found.</td></tr>`;

            tbody.querySelectorAll('.send-inv').forEach(btn => {
                btn.addEventListener('click', () => {
                    const s2 = state();
                    const inv = s2.invoices.find(i => i.id === btn.dataset.id);
                    if (inv && inv.status === 'Pending') { inv.status = 'Sent'; saveState(s2); toast('Invoice sent!'); render(state().invoices); }
                    else toast('Already sent or paid.', 'warning');
                });
            });

            tbody.querySelectorAll('.mark-paid').forEach(btn => {
                btn.addEventListener('click', () => {
                    const s2 = state();
                    const inv = s2.invoices.find(i => i.id === btn.dataset.id);
                    if (inv) { inv.status = 'Paid'; saveState(s2); toast('Marked as paid!'); render(state().invoices); }
                });
            });
        }

        render(s.invoices);
    }

    /* ──────────────────────────────────────────────
       CHATBOT
    ──────────────────────────────────────────────── */
    function wireChatbot() {
        const container = document.getElementById('chatMessages');
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSend');
        if (!container || !sendBtn) return;

        const botReplies = [
            "I can help you with vehicle maintenance, service bookings, and more!",
            "To book a service appointment, go to the Booking section in your dashboard.",
            "Your vehicle health status is updated automatically from OBD sensor data.",
            "Need to check your service history? Head to the Service History page.",
            "For payment assistance, visit the Payments section or call our support line.",
            "I'm still learning! For complex issues, our service managers are available 24/7.",
            "You can add or manage your vehicles from the 'My Vehicles' section.",
        ];

        let replyIdx = 0;

        function addMessage(text, role) {
            const div = document.createElement('div');
            div.className = `chat-bubble ${role}`;
            div.textContent = text;
            container.appendChild(div);

            if (role === 'user') {
                // Add typing indicator
                const typing = document.createElement('div');
                typing.className = 'chat-bubble bot';
                typing.innerHTML = '<i class="bi bi-three-dots-fill" style="animation: float 1s infinite"></i>';
                container.appendChild(typing);
                container.scrollTop = container.scrollHeight;

                setTimeout(() => {
                    container.removeChild(typing);
                    addMessage(botReplies[replyIdx % botReplies.length], 'bot');
                    replyIdx++;
                }, 1000);
            }

            container.scrollTop = container.scrollHeight;
        }

        sendBtn.addEventListener('click', () => {
            const text = input.value.trim();
            if (!text) return;
            addMessage(text, 'user');
            input.value = '';
        });

        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendBtn.click(); });

        // Quick chips
        document.querySelectorAll('.chat-quick-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                addMessage(chip.textContent.trim(), 'user');
            });
        });

        // Initial bot greeting
        addMessage('Hello! I\'m AutoInsight Assistant. How can I help you today?', 'bot');
    }

    /* ──────────────────────────────────────────────
       VEHICLE MANAGEMENT (client)
    ──────────────────────────────────────────────── */
    function wireAddVehicle() {
        const form = document.getElementById('addVehicleForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const s = state();
            const vehicle = {
                id: 'V' + (Date.now() % 10000),
                clientEmail: s.currentUser?.email || '',
                make: form.querySelector('#vMake')?.value || '',
                model: form.querySelector('#vModel')?.value || '',
                year: parseInt(form.querySelector('#vYear')?.value || 2020),
                plate: form.querySelector('#vPlate')?.value || '',
                vin: form.querySelector('#vVin')?.value || '',
                color: form.querySelector('#vColor')?.value || '',
                status: 'Healthy',
            };
            s.vehicles.push(vehicle);
            saveState(s);
            toast('Vehicle added!');
            setTimeout(() => location.href = toRoot(ROLE_TO_DASH.client), 300);
        });
    }

    /* ──────────────────────────────────────────────
       PROFILE
    ──────────────────────────────────────────────── */
    function wireProfile() {
        const form = document.getElementById('profileForm');
        const user = state().currentUser;
        if (!user) return;

        // Fill in read fields
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setVal('profileName', user.name);
        setVal('profileEmail', user.email);
        setVal('profilePhone', user.phone || '');
        setVal('profileAddress', user.address || '');

        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) avatarImg.src = avatarUrl(user.name);

        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const s = state();
            const u = s.users.find(x => x.email === user.email);
            if (u) {
                u.name = document.getElementById('profileName')?.value || u.name;
                u.phone = document.getElementById('profilePhone')?.value || u.phone;
                u.address = document.getElementById('profileAddress')?.value || u.address;
                s.currentUser = { ...s.currentUser, name: u.name };
                saveState(s);
                toast('Profile updated!');
            }
        });
    }

    /* ──────────────────────────────────────────────
       INIT
    ──────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.body.classList.contains('vms-app')) document.body.classList.add('vms-app');

        wireTheme();
        wireSidebarToggle();
        populateTopbarUser();
        addTopbarBackButton();

        wireLogin();
        wireRegister();
        wireForgotPassword();

        wireAdminUsers();
        wireWorkOrders();
        wireWorkOrderDetails();
        wireAppointments();
        wirePayments();
        wireInventory();
        wireInvoices();
        wireChatbot();
        wireAddVehicle();
        wireProfile();
    });
})();
