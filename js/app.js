// =====================================================
//  AlumCRM — App Router & Init (Supabase async version)
// =====================================================

const PAGES = {
  dashboard: {
    title: 'Dashboard',
    action: 'Nuevo Cliente',
    render: async () => { showLoading(); await renderDashboard(); },
    onAction: () => openClientModal()
  },
  clients: {
    title: 'Clientes',
    action: 'Nuevo Cliente',
    render: async () => { showLoading(); await renderClients(); },
    onAction: () => openClientModal()
  },
  quotes: {
    title: 'Cotizaciones',
    action: 'Nueva Cotización',
    render: async () => { showLoading(); await renderQuotes(); },
    onAction: () => openQuoteModal()
  },
  orders: {
    title: 'Pedidos',
    action: 'Ver Pedidos',
    render: async () => { showLoading(); await renderOrders(); },
    onAction: () => showToast('Convierte una cotización aprobada en pedido', 'info')
  },
  installations: {
    title: 'Instalaciones',
    action: 'Agendar Instalación',
    render: async () => { showLoading(); await renderInstallations(); },
    onAction: () => openInstallModal()
  },
  payments: {
    title: 'Pagos',
    action: 'Registrar Pago',
    render: async () => { showLoading(); await renderPayments(); },
    onAction: () => showToast('Selecciona un pedido para registrar pago', 'info')
  },
  followup: {
    title: 'Seguimiento',
    action: 'Nuevo Seguimiento',
    render: async () => { showLoading(); await renderFollowup(); },
    onAction: () => openFollowupModal()
  }
};

let currentPage = 'dashboard';

function showLoading() {
  document.getElementById('page-content').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:16px">
      <div style="width:36px;height:36px;border:3px solid var(--bg-400);border-top-color:var(--gold-400);border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <span style="color:var(--text-muted);font-size:13px">Cargando datos...</span>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `;
}

async function navigate(page) {
  if (!PAGES[page]) return;
  currentPage = page;

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Update topbar
  const dateStr = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('page-title').textContent = PAGES[page].title;
  document.getElementById('page-date').textContent = dateStr;
  document.getElementById('topbar-action-text').textContent = PAGES[page].action;

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');

  // Render (async)
  await PAGES[page].render();

  // Update URL hash
  window.location.hash = page;
  await updateBadges();
}

async function handleTopbarAction() {
  if (PAGES[currentPage]) {
    await PAGES[currentPage].onAction();
  }
}

async function updateBadges() {
  try {
    const [clients, quotes, orders] = await Promise.all([
      DB.getClients(),
      DB.getQuotes(),
      DB.getOrders()
    ]);
    const badges = {
      clients: clients.length,
      quotes: quotes.filter(q => q.estado === 'Enviada').length,
      orders: orders.filter(o => ['Pendiente','En Fabricación','Listo'].includes(o.estado)).length,
    };
    Object.entries(badges).forEach(([key, val]) => {
      const el = document.getElementById(`badge-${key}`);
      if (el) {
        el.textContent = val > 0 ? val : '';
        el.style.display = val > 0 ? '' : 'none';
      }
    });
  } catch(e) { /* no-op */ }
}

// ─── Init ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Set date
  const dateStr = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('page-date').textContent = dateStr;

  // Sidebar nav handlers
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });

  // Check Supabase connection
  const sb = getSupabase();
  if (!sb) {
    document.getElementById('page-content').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:20px;text-align:center;padding:24px">
        <div style="font-size:48px">⚠️</div>
        <h2 style="color:var(--warning)">Configura Supabase</h2>
        <p style="color:var(--text-secondary);max-width:480px;line-height:1.7">
          Edita el archivo <code style="background:var(--bg-600);padding:2px 8px;border-radius:4px">js/config.js</code>
          con tu <strong>Project URL</strong> y <strong>anon key</strong> de Supabase.<br><br>
          Ve a <a href="https://supabase.com" target="_blank" style="color:var(--gold-300)">supabase.com</a> → Tu proyecto → Settings → API
        </p>
        <a href="https://supabase.com/dashboard" target="_blank" class="btn-primary">
          Abrir Supabase Dashboard →
        </a>
      </div>
    `;
    return;
  }

  // Seed demo data on first run
  try { await DB.seedDemo(); } catch(e) { console.warn('Seed skipped:', e.message); }

  // Navigate to hash or dashboard
  const hash = window.location.hash.replace('#', '');
  await navigate(PAGES[hash] ? hash : 'dashboard');

  await updateBadges();

  setTimeout(() => showToast('¡Conectado a Supabase! 🚀', 'success'), 500);
});

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (PAGES[hash] && hash !== currentPage) {
    navigate(hash);
  }
});
