// =====================================================
//  AlumCRM — Installations Module (Supabase async)
// =====================================================

async function renderInstallations() {
  const [installations, orders, clients] = await Promise.all([
    DB.getInstallations(), DB.getOrders(), DB.getClients()
  ]);
  const readyOrders = orders.filter(o => o.estado === 'Listo');

  document.getElementById('page-content').innerHTML = `
    ${readyOrders.length > 0 ? `
    <div class="card" style="margin-bottom:20px;border-color:rgba(245,158,11,0.2)">
      <div class="card-header">
        <div><div class="card-title" style="color:var(--gold-300)">⚠️ Pedidos Listos para Instalar</div></div>
      </div>
      ${readyOrders.map(o => {
        const cl = clients.find(c => c.id === (o.clientId||o.client_id));
        return `<div class="alert-item warning-alert">
          <span class="alert-icon" style="font-size:20px">📦</span>
          <div class="alert-text"><strong>Pedido #${o.num} — ${escHtml(cl?.nombre||'—')}</strong>${o.fechaEntrega ? ' · Entrega: '+fmt.date(o.fechaEntrega) : ''}</div>
          <button class="btn-primary btn-sm" onclick="scheduleInstallation('${o.id}')">Agendar</button>
        </div>`;
      }).join('')}
    </div>` : ''}

    <div class="card">
      <div class="card-header">
        <div class="card-title">Agenda de Instalaciones</div>
        <button class="btn-primary" onclick="openInstallModal()">+ Nueva Instalación</button>
      </div>
      ${installations.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon" style="font-size:28px">🔧</div>
          <h3>Sin instalaciones programadas</h3>
          <p>Agenda instalaciones desde pedidos listos o manualmente</p>
        </div>
      ` : `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Pedido</th><th>Dirección</th><th>Instalador</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${installations.map(inst => {
                const cl = clients.find(c => c.id === (inst.clientId||inst.client_id));
                const o = (inst.orderId||inst.order_id) ? orders.find(x => x.id === (inst.orderId||inst.order_id)) : null;
                return `<tr>
                  <td><strong>${fmt.date(inst.fecha)}</strong></td>
                  <td>
                    <div class="client-name-cell">
                      <div class="client-row-avatar" style="width:28px;height:28px;font-size:11px">${fmt.initials(cl?.nombre||'?')}</div>
                      <span>${escHtml(cl?.nombre||'—')}</span>
                    </div>
                  </td>
                  <td class="td-muted">${o ? '#'+o.num : '—'}</td>
                  <td class="td-muted" style="max-width:150px;overflow:hidden;text-overflow:ellipsis">${escHtml(inst.direccion||'—')}</td>
                  <td class="td-muted">${escHtml(inst.instalador||'—')}</td>
                  <td>${statusBadge(inst.estado||'Pendiente')}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn-secondary btn-sm" onclick="editInstallation('${inst.id}')">Editar</button>
                      <button class="btn-icon danger" onclick="deleteInstallConfirm('${inst.id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function scheduleInstallation(orderId) { openInstallModal(null, orderId); }

async function openInstallModal(id = null, preOrderId = null) {
  const existing = id ? (await DB.getInstallations()).find(x => x.id === id) : null;
  const [clients, orders] = await Promise.all([
    DB.getClients(),
    DB.getOrders().then(all => all.filter(o => ['Listo','En Fabricación','Instalado'].includes(o.estado)))
  ]);

  const checklist = ['Medidas confirmadas','Materiales completos','Herramientas listas','Permiso de acceso confirmado','Área de trabajo libre','Silicón y selladores','Nivel y escuadra','Taladro y brocas','Instalación completada','Limpieza del área','Prueba de funcionamiento','Foto de evidencia'];

  const html = `
    <div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Cliente<span>*</span></label>
        <select class="form-select" id="if-client">
          <option value="">— Seleccionar cliente —</option>
          ${clients.map(c => `<option value="${c.id}" ${(existing?.clientId||existing?.client_id||'')===c.id?'selected':''}>${escHtml(c.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Pedido relacionado</label>
        <select class="form-select" id="if-order">
          <option value="">— Seleccionar pedido —</option>
          ${orders.map(o => {
            const cl = clients.find(c => c.id === (o.clientId||o.client_id));
            const selId = existing?.orderId || existing?.order_id || preOrderId || '';
            return `<option value="${o.id}" ${selId===o.id?'selected':''}>#${o.num} — ${escHtml(cl?.nombre||'—')} — ${fmt.currency(o.total)}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de instalación<span>*</span></label>
        <input class="form-input" type="date" id="if-fecha" value="${existing?.fecha||new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Hora estimada</label>
        <input class="form-input" type="time" id="if-hora" value="${existing?.hora||'09:00'}" />
      </div>
      <div class="form-group">
        <label class="form-label">Instalador(es)</label>
        <input class="form-input" id="if-instalador" placeholder="Nombre del instalador" value="${escHtml(existing?.instalador||'')}" />
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-select" id="if-estado">
          ${['Pendiente','En camino','En proceso','Completada','Reagendada'].map(s => `<option value="${s}" ${(existing?.estado||'Pendiente')===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Dirección de instalación</label>
        <input class="form-input" id="if-direccion" placeholder="Dirección completa" value="${escHtml(existing?.direccion||'')}" />
      </div>
    </div>
    <div class="form-section" style="margin-top:16px">
      <div class="form-section-title">✅ Checklist de Instalación</div>
      <div class="checkbox-group">
        ${checklist.map(item => `
          <label class="checkbox-chip ${(existing?.checklist||[]).includes(item)?'selected':''}">
            <input type="checkbox" name="checklist" value="${item}" ${(existing?.checklist||[]).includes(item)?'checked':''} />
            ${item}
          </label>`).join('')}
      </div>
    </div>
    <div class="form-group" style="margin-top:12px">
      <label class="form-label">Observaciones</label>
      <textarea class="form-textarea" id="if-notas">${escHtml(existing?.notas||'')}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveInstallation('${id||''}')">🔧 ${existing ? 'Guardar Cambios' : 'Agendar'}</button>
    </div>
  `;
  openModal(existing ? 'Editar Instalación' : 'Agendar Instalación', html);
  initModalChips();
  if (preOrderId) {
    const o = await DB.getOrder(preOrderId);
    if (o) { const s = document.getElementById('if-client'); if (s) s.value = o.clientId||o.client_id; }
  }
}

function editInstallation(id) { openInstallModal(id); }

async function saveInstallation(id) {
  const clientId = document.getElementById('if-client')?.value;
  const fecha = document.getElementById('if-fecha')?.value;
  if (!clientId || !fecha) { showToast('Cliente y fecha son obligatorios', 'error'); return; }
  const checklist = [...document.querySelectorAll('input[name="checklist"]:checked')].map(el => el.value);
  const orderId = document.getElementById('if-order')?.value || null;
  const estado = document.getElementById('if-estado')?.value || 'Pendiente';
  const data = {
    clientId, orderId, fecha,
    hora: document.getElementById('if-hora')?.value || '09:00',
    instalador: document.getElementById('if-instalador')?.value?.trim() || '',
    estado, direccion: document.getElementById('if-direccion')?.value?.trim() || '',
    checklist, notas: document.getElementById('if-notas')?.value?.trim() || '',
  };
  closeModal();
  try {
    if (id) {
      const existing = (await DB.getInstallations()).find(x => x.id === id);
      await DB.updateInstallation({ ...existing, ...data });
      showToast('Instalación actualizada', 'success');
    } else {
      await DB.addInstallation(data);
      showToast('Instalación agendada', 'success');
      if (estado === 'Completada' && orderId) {
        const o = await DB.getOrder(orderId);
        if (o) await DB.updateOrder({ ...o, estado: 'Instalado' });
      }
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  await renderInstallations();
}

async function deleteInstallConfirm(id) {
  confirmDelete('¿Eliminar esta instalación?', async () => {
    await DB.deleteInstallation(id);
    showToast('Instalación eliminada', 'warning');
    await renderInstallations();
  });
}
