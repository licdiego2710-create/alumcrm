// =====================================================
//  AlumCRM — Dashboard Module (Supabase async)
// =====================================================

async function renderDashboard() {
  const [clients, quotes, orders, payments, followups] = await Promise.all([
    DB.getClients(), DB.getQuotes(), DB.getOrders(),
    DB.getPayments(), DB.getFollowups()
  ]);

  const totalCobrado = payments.reduce((s, p) => s + Number(p.monto || 0), 0);
  const ordenesPendientes = orders.filter(o => ['Pendiente','En Fabricación','Listo'].includes(o.estado)).length;
  const cotizacionesPendientes = quotes.filter(q => q.estado === 'Enviada').length;
  const saldoPendiente = orders.reduce((s, o) => s + Number(o.saldo || 0), 0);
  const monthlyData = getMonthlyData(payments);

  document.getElementById('page-content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card gold" onclick="navigate('clients')" style="cursor:pointer">
        <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div class="stat-info"><div class="stat-value">${clients.length}</div><div class="stat-label">Clientes registrados</div></div>
      </div>
      <div class="stat-card blue" onclick="navigate('quotes')" style="cursor:pointer">
        <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="stat-info"><div class="stat-value">${quotes.length}</div><div class="stat-label">Cotizaciones · <span style="color:var(--warning)">${cotizacionesPendientes} pend.</span></div></div>
      </div>
      <div class="stat-card purple" onclick="navigate('orders')" style="cursor:pointer">
        <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
        <div class="stat-info"><div class="stat-value">${ordenesPendientes}</div><div class="stat-label">Pedidos activos</div></div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="stat-info"><div class="stat-value">${fmt.currency(totalCobrado)}</div><div class="stat-label">Total cobrado</div></div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div class="stat-info"><div class="stat-value">${fmt.currency(saldoPendiente)}</div><div class="stat-label">Saldo por cobrar</div></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><div><div class="card-title">Pipeline de Ventas</div><div class="card-subtitle">Estado actual de todos los procesos</div></div></div>
      <div class="pipeline">
        ${pipelineStage('Nuevos', clients.filter(c=>c.estado==='Nuevo').length, 'active')}
        ${pipelineStage('Cotizados', quotes.filter(q=>['Borrador','Enviada'].includes(q.estado)).length, '')}
        ${pipelineStage('Aprobado', quotes.filter(q=>q.estado==='Aprobada').length, '')}
        ${pipelineStage('Fabricación', orders.filter(o=>o.estado==='En Fabricación').length, 'active')}
        ${pipelineStage('Instalación', orders.filter(o=>o.estado==='Listo').length, '')}
        ${pipelineStage('Completado', orders.filter(o=>o.estado==='Instalado').length, 'done')}
      </div>
    </div>

    <div class="dashboard-grid">
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="card">
          <div class="card-header"><div><div class="card-title">Ingresos Mensuales</div><div class="card-subtitle">Últimos 6 meses</div></div></div>
          <div class="chart-container"><canvas id="incomeChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Cotizaciones Recientes</div><button class="btn-secondary btn-sm" onclick="navigate('quotes')">Ver todas</button></div>
          ${recentQuotesTable(quotes.slice(0,5), clients)}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">Actividad Reciente</div></div>
          <div class="recent-activity" id="activity-list">
            <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">Cargando actividad...</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Pedidos en Proceso</div><button class="btn-secondary btn-sm" onclick="navigate('orders')">Ver todos</button></div>
          ${recentOrdersWidget(orders, clients)}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Seguimientos Pendientes</div><button class="btn-secondary btn-sm" onclick="navigate('followup')">Ver todos</button></div>
          ${pendingFollowups(followups, clients)}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => initIncomeChart(monthlyData), 50);

  // Load activity async
  DB.getActivity().then(activity => {
    const el = document.getElementById('activity-list');
    if (el) el.innerHTML = renderActivityHtml(activity);
  });
}

function pipelineStage(label, count, cls) {
  return `<div class="pipeline-stage ${cls}"><span class="pipeline-count">${count}</span>${label}</div>`;
}

function recentQuotesTable(quotes, clients) {
  if (!quotes.length) return `<div class="empty-state" style="padding:24px"><p>Sin cotizaciones aún</p></div>`;
  return `<div class="table-wrapper"><table>
    <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
    <tbody>
      ${quotes.map(q => {
        const cl = clients.find(c => c.id === (q.clientId || q.client_id));
        return `<tr style="cursor:pointer" onclick="navigate('quotes')">
          <td class="td-muted">#${q.num}</td>
          <td><strong>${escHtml(cl ? cl.nombre : '—')}</strong></td>
          <td><strong>${fmt.currency(q.total)}</strong></td>
          <td>${statusBadge(q.estado)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div>`;
}

function recentOrdersWidget(orders, clients) {
  const active = orders.filter(o => ['Pendiente','En Fabricación','Listo'].includes(o.estado)).slice(0,4);
  if (!active.length) return `<div class="empty-state" style="padding:20px"><p>No hay pedidos activos</p></div>`;
  return active.map(o => {
    const cl = clients.find(c => c.id === (o.clientId || o.client_id));
    const pct = o.total > 0 ? Math.round(((Number(o.total) - Number(o.saldo)) / Number(o.total)) * 100) : 0;
    return `<div style="margin-bottom:12px;cursor:pointer" onclick="navigate('orders')">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${escHtml(cl ? cl.nombre : '—')}</span>
        ${statusBadge(o.estado)}
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Pedido #${o.num} · ${fmt.currency(o.total)}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="font-size:10px;color:var(--text-muted);text-align:right;margin-top:3px">Cobrado ${pct}%</div>
    </div>`;
  }).join('');
}

function pendingFollowups(followups, clients) {
  const pending = followups.filter(f => f.estado !== 'Completado').slice(0,4);
  if (!pending.length) return `<div class="empty-state" style="padding:20px"><p>Sin seguimientos pendientes 🎉</p></div>`;
  const iconMap = { Garantía:'🛡️', Servicio:'🔧', Llamada:'📞', Visita:'🏠' };
  return pending.map(f => {
    const cl = clients.find(c => c.id === (f.clientId || f.client_id));
    return `<div class="task-item" style="cursor:pointer" onclick="navigate('followup')">
      <span style="font-size:16px">${iconMap[f.tipo]||'📋'}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${escHtml(f.tipo)} — ${escHtml(cl ? cl.nombre : '—')}</div>
        <div style="font-size:11px;color:var(--text-muted)">${escHtml(f.descripcion||'')} · ${fmt.date(f.fechaPrograma || f.fecha_programa)}</div>
      </div>
    </div>`;
  }).join('');
}

function renderActivityHtml(activity) {
  if (!activity.length) return `<div class="empty-state" style="padding:20px"><p>Sin actividad aún</p></div>`;
  return activity.slice(0,7).map(a => `
    <div class="activity-item">
      <div class="activity-dot ${a.type}"></div>
      <div class="activity-text">${a.msg}</div>
      <div class="activity-time">${fmt.relativeTime(a.created_at)}</div>
    </div>`).join('');
}

function getMonthlyData(payments) {
  const labels = [], data = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    labels.push(d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }));
    const sum = payments.filter(p => (p.fecha||'').startsWith(key)).reduce((s,p) => s + Number(p.monto||0), 0);
    data.push(sum);
  }
  return { labels, data };
}

let incomeChartInstance = null;
function initIncomeChart({ labels, data }) {
  const canvas = document.getElementById('incomeChart');
  if (!canvas) return;
  if (incomeChartInstance) incomeChartInstance.destroy();
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(245,158,11,0.3)');
  gradient.addColorStop(1, 'rgba(245,158,11,0)');
  incomeChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Ingresos', data, borderColor: '#f59e0b', backgroundColor: gradient, borderWidth: 2.5, pointBackgroundColor: '#f59e0b', pointRadius: 4, pointHoverRadius: 7, tension: 0.4, fill: true }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e2330', borderColor: 'rgba(245,158,11,0.3)', borderWidth: 1, titleColor: '#f0f2f7', bodyColor: '#8b93a8', callbacks: { label: ctx => ' ' + fmt.currency(ctx.raw) } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a6278', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a6278', font: { size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } }
      }
    }
  });
}
