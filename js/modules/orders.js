// =====================================================
//  AlumCRM — Orders Module
// =====================================================

async function renderOrders(filter = 'all', search = '') {
  let [orders, clients] = await Promise.all([DB.getOrders(), DB.getClients()]);
  if (filter !== 'all') orders = orders.filter(o => o.estado === filter);
  if (search) {
    const s = search.toLowerCase();
    orders = orders.filter(o => {
      const cl = clients.find(c => c.id === (o.clientId||o.client_id));
      return (cl?.nombre||'').toLowerCase().includes(s) || String(o.num).includes(s);
    });
  }

  const statuses = ['all','Pendiente','En Fabricación','Listo','Instalado','Cancelado'];
  const statusLabels = { all:'Todos', Pendiente:'Pendiente', 'En Fabricación':'Fabricación', Listo:'Listo', Instalado:'Instalado', Cancelado:'Cancelado' };

  document.getElementById('page-content').innerHTML = `
    <div class="section-header">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar pedido..." value="${escHtml(search)}" oninput="renderOrders('${filter}', this.value)" />
      </div>
      <span style="font-size:12px;color:var(--text-muted)">${orders.length} pedidos</span>
    </div>
    <div class="filters-bar">
      ${statuses.map(f => `<span class="filter-chip ${filter===f?'active':''}" onclick="renderOrders('${f}','${escHtml(search)}')">${statusLabels[f]}</span>`).join('')}
    </div>

    ${orders.length === 0 ? `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Sin pedidos</h3>
          <p>Convierte una cotización aprobada en pedido</p>
        </div>
      </div>
    ` : `
      <div class="cards-grid">
        ${orders.map(o => {
          const cl = clients.find(c => c.id === (o.clientId||o.client_id));
          const pct = o.total > 0 ? Math.round(((Number(o.total) - Number(o.saldo)) / Number(o.total)) * 100) : 0;
          return `
            <div class="order-card" onclick="viewOrder('${o.id}')">
              <div class="order-card-header">
                <span class="order-id">PEDIDO #${o.num}</span>
                ${statusBadge(o.estado)}
              </div>
              <div class="order-client">${escHtml(cl?.nombre||'—')}</div>
              <div class="order-desc">${escHtml(o.notas||'Sin descripción')}</div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px">
                <span style="color:var(--text-muted)">Total: <strong style="color:var(--text-primary)">${fmt.currency(o.total)}</strong></span>
                <span style="color:var(--warning)">Saldo: ${fmt.currency(o.saldo)}</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
              <div style="font-size:10px;color:var(--text-muted);margin-top:3px;text-align:right">${pct}% cobrado</div>
              ${o.instalador ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:8px">🔧 ${escHtml(o.instalador)}</div>` : ''}
              ${o.fechaEntrega ? `<div style="font-size:11px;color:var(--text-muted)">📅 Entrega: ${fmt.date(o.fechaEntrega)}</div>` : ''}
            </div>`;
        }).join('')}
      </div>
    `}
  `;
  updateBadges();
}

async function viewOrder(id) {
  const [o, payments] = await Promise.all([DB.getOrder(id), DB.getPaymentsByOrder(id)]);
  if (!o) return;
  const cl = await DB.getClient(o.clientId || o.client_id);
  const totalPagado = payments.reduce((s, p) => s + Number(p.monto||0), 0);
  const pct = o.total > 0 ? Math.round((totalPagado / Number(o.total)) * 100) : 0;

  const stagesMap = ['Pendiente','En Fabricación','Listo','Instalado'];
  const stageIdx = stagesMap.indexOf(o.estado);

  document.getElementById('page-content').innerHTML = `
    <button class="back-btn" onclick="renderOrders()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Volver a Pedidos
    </button>

    <div class="detail-header">
      <div class="detail-avatar" style="font-size:16px">📦</div>
      <div class="detail-info">
        <div class="detail-name">Pedido #${o.num}</div>
        <div class="detail-meta">${escHtml(cl?.nombre||'—')} · Creado ${fmt.date(o.createdAt)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          ${statusBadge(o.estado)}
          <button class="btn-secondary btn-sm" onclick="editOrderStatus('${o.id}')">✏️ Cambiar Estado</button>
          <button class="btn-primary btn-sm" onclick="openPaymentModal('${o.id}')">+ Registrar Pago</button>
        </div>
      </div>
    </div>

    <!-- Status steps -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-title" style="margin-bottom:16px">Estado del Pedido</div>
      <div class="status-steps">
        ${stagesMap.map((s, i) => `
          <div class="status-step ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : ''}">
            <div class="step-dot">${i < stageIdx ? '✓' : i+1}</div>
            <div class="step-label">${s}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="detail-grid" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">📋 Detalles del Pedido</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${infoRow('Cliente', cl?.nombre||'—')}
          ${infoRow('Instalador', o.instalador||'—')}
          ${infoRow('Fecha creación', fmt.date(o.createdAt))}
          ${infoRow('Fecha entrega', o.fechaEntrega ? fmt.date(o.fechaEntrega) : '—')}
          ${infoRow('Estado', o.estado)}
          ${infoRow('Cotización', o.quoteId || o.quote_id ? '—' : '—')}
        </div>
        ${o.notas ? `<div style="margin-top:12px;padding:10px;background:var(--bg-800);border-radius:8px;font-size:12.5px;color:var(--text-secondary)">${escHtml(o.notas)}</div>` : ''}
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom:14px">💰 Estado de Cuenta</div>
        <div class="payment-summary">
          <div class="payment-stat">
            <div class="payment-stat-value" style="color:var(--text-primary)">${fmt.currency(o.total)}</div>
            <div class="payment-stat-label">Total</div>
          </div>
          <div class="payment-stat">
            <div class="payment-stat-value" style="color:var(--success)">${fmt.currency(totalPagado)}</div>
            <div class="payment-stat-label">Cobrado</div>
          </div>
          <div class="payment-stat">
            <div class="payment-stat-value" style="color:var(--warning)">${fmt.currency(Math.max(0, o.total - totalPagado))}</div>
            <div class="payment-stat-label">Saldo</div>
          </div>
        </div>
        <div class="progress-bar" style="margin-bottom:6px"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size:11px;color:var(--text-muted);text-align:right">${pct}% cobrado</div>
      </div>
    </div>

    <!-- Products from quote -->
    ${orderProductsTable(o)}

    <!-- Payments -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">Registro de Pagos</div>
        <button class="btn-primary btn-sm" onclick="openPaymentModal('${o.id}')">+ Pago</button>
      </div>
      ${payments.length ? payments.map(p => `
        <div class="payment-record">
          <div class="payment-record-icon income">💵</div>
          <div class="payment-record-info">
            <div class="payment-record-desc">${escHtml(p.concepto||'Pago')}</div>
            <div class="payment-record-meta">${escHtml(p.metodo||'—')} · ${fmt.date(p.fecha)}</div>
          </div>
          <div class="payment-record-amount income">${fmt.currency(p.monto)}</div>
          <button class="btn-icon danger" onclick="deletePaymentConfirm('${p.id}','${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>`).join('') :
        `<div class="empty-state" style="padding:20px"><p>Sin pagos registrados</p></div>`}
    </div>
  `;
}

function orderProductsTable(o) {
  const quoteId = o.quoteId || o.quote_id;
  if (!quoteId) return '';
  // Quote products were stored inline in orders JSONB — load from quote async separately
  return '';  // Products shown via separate async call if needed
  return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:14px">🪟 Productos del Pedido</div>
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>#</th><th>Tipo</th><th>Medidas</th><th>Aluminio</th><th>Vidrio</th><th>Color</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th>
          </tr></thead>
          <tbody>
            ${q.productos.map((p, i) => `
              <tr>
                <td class="td-muted">${i+1}</td>
                <td><strong>${escHtml(p.tipo||'—')}</strong></td>
                <td class="td-muted">${p.ancho && p.alto ? `${p.ancho}m × ${p.alto}m` : '—'}</td>
                <td class="td-muted">${escHtml(p.lineaAluminio||'—')}</td>
                <td class="td-muted">${escHtml(p.vidrio||'—')}</td>
                <td class="td-muted">${escHtml(p.colorAluminio||'—')}</td>
                <td>${p.cantidad||1}</td>
                <td>${fmt.currency(p.precioUnitario||0)}</td>
                <td><strong>${fmt.currency((p.precioUnitario||0)*(p.cantidad||1))}</strong></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

async function editOrderStatus(id) {
  const o = await DB.getOrder(id);
  if (!o) return;
  const html = `
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Estado del pedido</label>
      <select class="form-select" id="os-estado">
        ${['Pendiente','En Fabricación','Listo','Instalado','Cancelado'].map(s =>
          `<option value="${s}" ${o.estado===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Instalador</label>
      <input class="form-input" id="os-instalador" value="${escHtml(o.instalador||'')}" placeholder="Nombre del instalador" />
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Fecha de entrega</label>
      <input class="form-input" type="date" id="os-fecha" value="${o.fechaEntrega||''}" />
    </div>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Notas</label>
      <textarea class="form-textarea" id="os-notas">${escHtml(o.notas||'')}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveOrderStatus('${id}')">Guardar</button>
    </div>
  `;
  openModal('Actualizar Pedido', html);
}

async function saveOrderStatus(id) {
  const o = await DB.getOrder(id);
  if (!o) return;
  const newState = document.getElementById('os-estado')?.value || o.estado;
  closeModal();
  await DB.updateOrder({
    ...o,
    estado: newState,
    instalador: document.getElementById('os-instalador')?.value?.trim() || o.instalador,
    fechaEntrega: document.getElementById('os-fecha')?.value || o.fechaEntrega || o.fecha_entrega,
    notas: document.getElementById('os-notas')?.value?.trim() || o.notas,
  });
  await DB.logActivity(`Pedido <strong>#${o.num}</strong> → ${newState}`, 'gold');
  showToast('Pedido actualizado', 'success');
  await viewOrder(id);
}
