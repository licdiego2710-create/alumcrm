// =====================================================
//  AlumCRM — Clients Module (Supabase async)
// =====================================================

async function renderClients(filter = 'all', search = '') {
  let clients = await DB.getClients();
  if (filter !== 'all') clients = clients.filter(c => c.estado === filter);
  if (search) {
    const s = search.toLowerCase();
    clients = clients.filter(c =>
      (c.nombre||'').toLowerCase().includes(s) ||
      (c.empresa||'').toLowerCase().includes(s) ||
      (c.telefono||'').toLowerCase().includes(s) ||
      (c.email||'').toLowerCase().includes(s)
    );
  }

  const filters = ['all','Nuevo','Activo','En Proceso','Completado','Inactivo'];
  const filterLabels = { all:'Todos', Nuevo:'Nuevos', Activo:'Activos', 'En Proceso':'En Proceso', Completado:'Completados', Inactivo:'Inactivos' };

  document.getElementById('page-content').innerHTML = `
    <div class="section-header">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar cliente..." id="client-search" value="${escHtml(search)}" oninput="renderClients('${filter}', this.value)" />
      </div>
      <span style="font-size:12px;color:var(--text-muted)">${clients.length} clientes</span>
    </div>
    <div class="filters-bar">
      ${filters.map(f => `<span class="filter-chip ${filter===f?'active':''}" onclick="renderClients('${f}','${escHtml(search)}')">${filterLabels[f]}</span>`).join('')}
    </div>

    ${clients.length === 0 ? `
      <div class="card"><div class="empty-state">
        <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
        <h3>Sin clientes ${search ? 'encontrados' : 'registrados'}</h3>
        <p>${search ? 'Prueba con otro término' : 'Registra tu primer cliente con el botón + arriba'}</p>
      </div></div>
    ` : `
      <div class="card" style="padding:0;overflow:hidden">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>Teléfono</th><th>Origen</th><th>Estado</th><th>Reg.</th><th></th></tr></thead>
            <tbody>
              ${clients.map(c => `
                <tr>
                  <td class="td-muted">${c.num||'—'}</td>
                  <td>
                    <div class="client-name-cell">
                      <div class="client-row-avatar">${fmt.initials(c.nombre)}</div>
                      <div>
                        <div class="client-name" style="cursor:pointer" onclick="viewClient('${c.id}')">${escHtml(c.nombre)}</div>
                        <div class="client-company">${escHtml(c.empresa||'')}</div>
                      </div>
                    </div>
                  </td>
                  <td><a href="tel:${escHtml(c.telefono)}" style="color:var(--gold-300);text-decoration:none">${escHtml(c.telefono||'—')}</a></td>
                  <td class="td-muted">${escHtml(c.origen||'—')}</td>
                  <td>${statusBadge(c.estado||'Nuevo')}</td>
                  <td class="td-muted">${fmt.date((c.created_at||'').split('T')[0])}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn-icon" onclick="viewClient('${c.id}')" title="Ver detalle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button class="btn-icon" onclick="editClient('${c.id}')" title="Editar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="btn-icon danger" onclick="deleteClientConfirm('${c.id}')" title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}
  `;
  updateBadges();
}

async function viewClient(id) {
  const [c, quotes, orders, followups, payments] = await Promise.all([
    DB.getClient(id),
    DB.getQuotesByClient(id),
    DB.getOrdersByClient(id),
    DB.getFollowups().then(all => all.filter(f => f.clientId === id || f.client_id === id)),
    DB.getPayments().then(all => all.filter(p => p.clientId === id || p.client_id === id))
  ]);
  if (!c) return;
  const totalFacturado = quotes.filter(q => q.estado === 'Aprobada').reduce((s,q) => s + Number(q.total||0), 0);
  const totalCobrado = payments.reduce((s,p) => s + Number(p.monto||0), 0);

  document.getElementById('page-content').innerHTML = `
    <button class="back-btn" onclick="renderClients()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Volver a Clientes
    </button>
    <div class="detail-header">
      <div class="detail-avatar">${fmt.initials(c.nombre)}</div>
      <div class="detail-info">
        <div class="detail-name">${escHtml(c.nombre)}</div>
        <div class="detail-meta">${escHtml(c.empresa||'')} ${c.empresa?'·':''} ${escHtml(c.origen||'')}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          ${statusBadge(c.estado||'Nuevo')}
          <button class="btn-secondary btn-sm" onclick="editClient('${c.id}')">✏️ Editar</button>
          <button class="btn-primary btn-sm" onclick="openQuoteModal('${c.id}')">+ Nueva Cotización</button>
        </div>
      </div>
    </div>
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card blue"><div class="stat-icon" style="background:var(--info-bg);color:var(--info)">📋</div><div class="stat-info"><div class="stat-value">${quotes.length}</div><div class="stat-label">Cotizaciones</div></div></div>
      <div class="stat-card purple"><div class="stat-icon" style="background:var(--purple-bg);color:var(--purple)">📦</div><div class="stat-info"><div class="stat-value">${orders.length}</div><div class="stat-label">Pedidos</div></div></div>
      <div class="stat-card green"><div class="stat-icon" style="background:var(--success-bg);color:var(--success)">💰</div><div class="stat-info"><div class="stat-value">${fmt.currency(totalCobrado)}</div><div class="stat-label">Cobrado</div></div></div>
      <div class="stat-card gold"><div class="stat-icon" style="background:rgba(245,158,11,0.15);color:var(--gold-400)">📈</div><div class="stat-info"><div class="stat-value">${fmt.currency(totalFacturado)}</div><div class="stat-label">Facturado</div></div></div>
    </div>
    <div class="detail-grid" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">📋 Datos del Cliente</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${infoRow('Nombre completo', c.nombre)}
          ${infoRow('Empresa', c.empresa||'—')}
          ${infoRow('Teléfono', c.telefono||'—')}
          ${infoRow('Email', c.email||'—')}
          ${infoRow('Dirección', c.direccion||'—')}
          ${infoRow('RFC', c.rfc||'—')}
          ${infoRow('Origen', c.origen||'—')}
          ${infoRow('Registrado', fmt.date((c.created_at||'').split('T')[0]))}
        </div>
        ${c.notas ? `<div style="margin-top:12px;padding:10px;background:var(--bg-800);border-radius:8px;font-size:12.5px;color:var(--text-secondary)">${escHtml(c.notas)}</div>` : ''}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">🕐 Historial</div>
        ${buildTimeline(quotes, orders, c)}
      </div>
    </div>
    ${quotes.length ? `
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><div class="card-title">Cotizaciones</div><button class="btn-primary btn-sm" onclick="openQuoteModal('${c.id}')">+ Cotización</button></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
        <tbody>${quotes.map(q => `
          <tr>
            <td class="td-muted">#${q.num}</td>
            <td class="td-muted">${fmt.date(q.fecha)}</td>
            <td>${(q.productos||[]).length} producto(s)</td>
            <td><strong>${fmt.currency(q.total)}</strong></td>
            <td>${statusBadge(q.estado)}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn-secondary btn-sm" onclick="editQuote('${q.id}')">Ver</button>
                ${q.estado === 'Aprobada' ? `<button class="btn-primary btn-sm" onclick="convertToOrder('${q.id}')">→ Pedido</button>` : ''}
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>` : ''}
    <div class="card">
      <div class="card-header"><div class="card-title">Seguimiento</div><button class="btn-primary btn-sm" onclick="openFollowupModal('${c.id}')">+ Seguimiento</button></div>
      ${followups.length ? followups.map(f => `
        <div class="task-item">
          <div style="font-size:18px">${{Garantía:'🛡️',Servicio:'🔧',Llamada:'📞',Visita:'🏠',Otro:'📋'}[f.tipo]||'📋'}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${escHtml(f.tipo)} — ${fmt.date(f.fechaPrograma||f.fecha_programa)}</div>
            <div style="font-size:12px;color:var(--text-muted)">${escHtml(f.descripcion||'')}</div>
          </div>
          ${statusBadge(f.estado||'Pendiente')}
        </div>`).join('') :
        `<div class="empty-state" style="padding:20px"><p>Sin seguimientos</p></div>`}
    </div>
  `;
}

function infoRow(label, value) {
  return `<div class="info-row"><div class="info-label">${label}</div><div class="info-value">${escHtml(String(value||'—'))}</div></div>`;
}

function buildTimeline(quotes, orders, client) {
  const items = [];
  quotes.forEach(q => items.push({ date: q.created_at||q.fecha, type:'quote', label:`Cotización #${q.num}`, desc:fmt.currency(q.total), status:q.estado }));
  orders.forEach(o => items.push({ date: o.created_at||o.fecha, type:'order', label:`Pedido #${o.num}`, desc:o.estado, status:o.estado }));
  items.push({ date: client.created_at, type:'new', label:'Cliente registrado', desc:`Origen: ${client.origen||'Directo'}`, status:'' });
  items.sort((a,b) => new Date(b.date) - new Date(a.date));
  if (!items.length) return `<div class="empty-state" style="padding:20px"><p>Sin historial aún</p></div>`;
  const dotColor = { quote:'blue', order:'gold', new:'green' };
  const icon = { quote:'📋', order:'📦', new:'⭐' };
  return `<div class="timeline">${items.slice(0,8).map(item => `
    <div class="timeline-item">
      <div class="timeline-dot ${dotColor[item.type]}">${icon[item.type]}</div>
      <div class="timeline-content">
        <div class="timeline-label">${item.label}</div>
        <div class="timeline-date">${fmt.date((item.date||'').split('T')[0])}</div>
        <div class="timeline-desc">${escHtml(item.desc)}</div>
      </div>
    </div>`).join('')}</div>`;
}

function openClientModal(id = null) {
  const origenes = ['Referido','Facebook','Instagram','Google','Cartel/Letrero','Visita directa','WhatsApp','Otro'];
  const estados = ['Nuevo','Activo','En Proceso','Completado','Inactivo'];
  // We load data async if editing
  if (id) {
    DB.getClient(id).then(c => _renderClientModal(c, origenes, estados));
  } else {
    _renderClientModal(null, origenes, estados);
  }
}

function _renderClientModal(c, origenes, estados) {
  const html = `
    <div class="form-section">
      <div class="form-section-title">👤 Datos Personales</div>
      <div class="form-grid">
        <div class="form-group form-full"><label class="form-label">Nombre completo<span>*</span></label><input class="form-input" id="cf-nombre" placeholder="Ej. María López García" value="${escHtml(c?.nombre||'')}" /></div>
        <div class="form-group"><label class="form-label">Empresa / Razón Social</label><input class="form-input" id="cf-empresa" placeholder="Ej. Constructora XYZ SA" value="${escHtml(c?.empresa||'')}" /></div>
        <div class="form-group"><label class="form-label">RFC</label><input class="form-input" id="cf-rfc" placeholder="XAXX010101000" value="${escHtml(c?.rfc||'')}" /></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">📞 Contacto</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Teléfono<span>*</span></label><input class="form-input" id="cf-telefono" type="tel" placeholder="614-100-2233" value="${escHtml(c?.telefono||'')}" /></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="cf-email" type="email" placeholder="correo@ejemplo.com" value="${escHtml(c?.email||'')}" /></div>
        <div class="form-group form-full"><label class="form-label">Dirección</label><input class="form-input" id="cf-direccion" placeholder="Calle, número, colonia, ciudad" value="${escHtml(c?.direccion||'')}" /></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">📊 Clasificación</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="cf-estado">${estados.map(e=>`<option value="${e}" ${(c?.estado||'Nuevo')===e?'selected':''}>${e}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">¿Cómo nos conoció?</label><select class="form-select" id="cf-origen"><option value="">— Seleccionar —</option>${origenes.map(o=>`<option value="${o}" ${(c?.origen||'')===o?'selected':''}>${o}</option>`).join('')}</select></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">📝 Notas</div>
      <div class="form-group"><textarea class="form-textarea" id="cf-notas" placeholder="Observaciones, preferencias...">${escHtml(c?.notas||'')}</textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveClient('${c?.id||''}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
        ${c ? 'Guardar Cambios' : 'Registrar Cliente'}
      </button>
    </div>
  `;
  openModal(c ? 'Editar Cliente' : 'Nuevo Cliente', html);
}

async function saveClient(id) {
  const nombre = document.getElementById('cf-nombre')?.value.trim();
  if (!nombre) { showToast('El nombre es obligatorio', 'error'); return; }
  const data = {
    nombre,
    empresa: document.getElementById('cf-empresa')?.value.trim()||'',
    rfc: document.getElementById('cf-rfc')?.value.trim()||'',
    telefono: document.getElementById('cf-telefono')?.value.trim()||'',
    email: document.getElementById('cf-email')?.value.trim()||'',
    direccion: document.getElementById('cf-direccion')?.value.trim()||'',
    estado: document.getElementById('cf-estado')?.value||'Nuevo',
    origen: document.getElementById('cf-origen')?.value||'',
    notas: document.getElementById('cf-notas')?.value.trim()||'',
  };
  closeModal();
  try {
    if (id) {
      await DB.updateClient({ id, ...data });
      showToast('Cliente actualizado', 'success');
      await DB.logActivity(`Cliente <strong>${data.nombre}</strong> actualizado`, 'gold');
    } else {
      await DB.addClient(data);
      showToast('Cliente registrado', 'success');
      await DB.logActivity(`Nuevo cliente <strong>${data.nombre}</strong>`, 'blue');
    }
  } catch(e) { showToast('Error al guardar: ' + e.message, 'error'); return; }
  await renderClients();
}

function editClient(id) { openClientModal(id); }

async function deleteClientConfirm(id) {
  const c = await DB.getClient(id);
  if (!c) return;
  confirmDelete(`¿Eliminar al cliente "${c.nombre}"?`, async () => {
    await DB.deleteClient(id);
    showToast('Cliente eliminado', 'warning');
    await renderClients();
  });
}
