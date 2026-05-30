// =====================================================
//  AlumCRM — Follow-up Module (Supabase async)
// =====================================================

async function renderFollowup(filter = 'all') {
  let [followups, clients] = await Promise.all([DB.getFollowups(), DB.getClients()]);
  if (filter !== 'all') followups = followups.filter(f => f.tipo === filter);

  const tipos = ['all','Garantía','Servicio','Llamada','Visita','Otro'];
  const tipoLabels = { all:'Todos', Garantía:'Garantías', Servicio:'Servicio', Llamada:'Llamadas', Visita:'Visitas', Otro:'Otros' };
  const tipoIcon = { Garantía:'🛡️', Servicio:'🔧', Llamada:'📞', Visita:'🏠', Otro:'📋' };
  const tipoBg = { Garantía:'var(--purple-bg)', Servicio:'var(--info-bg)', Llamada:'var(--success-bg)', Visita:'rgba(245,158,11,0.12)', Otro:'var(--bg-500)' };
  const tipoColor = { Garantía:'var(--purple)', Servicio:'var(--info)', Llamada:'var(--success)', Visita:'var(--gold-400)', Otro:'var(--text-muted)' };

  const pendientes = followups.filter(f => f.estado !== 'Completado');
  const completados = followups.filter(f => f.estado === 'Completado');

  document.getElementById('page-content').innerHTML = `
    <div class="filters-bar" style="margin-bottom:20px">
      ${tipos.map(t => `<span class="filter-chip ${filter===t?'active':''}" onclick="renderFollowup('${t}')">${tipoLabels[t]}</span>`).join('')}
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <div><div class="card-title">Seguimientos Pendientes</div><div class="card-subtitle">${pendientes.length} activos</div></div>
        <button class="btn-primary" onclick="openFollowupModal()">+ Nuevo Seguimiento</button>
      </div>
      ${pendientes.length === 0 ? `
        <div class="empty-state" style="padding:30px">
          <div style="font-size:32px;margin-bottom:12px">🎉</div>
          <h3>¡Sin seguimientos pendientes!</h3>
          <p>Todos los seguimientos están al día</p>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
          ${pendientes.map(f => {
            const cl = clients.find(c => c.id === (f.clientId||f.client_id));
            const fp = f.fechaPrograma || f.fecha_programa;
            const isOverdue = fp && new Date(fp) < new Date();
            return `<div class="followup-card" style="${isOverdue ? 'border-color:rgba(239,68,68,0.3)' : ''}">
              <div class="followup-card-header">
                <div class="followup-icon" style="background:${tipoBg[f.tipo]||'var(--bg-500)'};color:${tipoColor[f.tipo]||'var(--text-muted)'}">
                  ${tipoIcon[f.tipo]||'📋'}
                </div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${escHtml(f.tipo||'Seguimiento')}</div>
                  <div style="font-size:11px;color:${isOverdue?'var(--danger)':'var(--text-muted)'}">
                    ${isOverdue ? '⚠️ Vencido: ' : '📅 '}${fmt.date(fp)}
                  </div>
                </div>
                ${statusBadge(f.estado||'Pendiente')}
              </div>
              <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px">${escHtml(cl?.nombre||'—')}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">${escHtml(f.descripcion||'')}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn-secondary btn-sm" onclick="editFollowup('${f.id}')">Editar</button>
                <button class="btn-primary btn-sm" onclick="completeFollowup('${f.id}')">✓ Completar</button>
                <button class="btn-icon danger btn-sm" onclick="deleteFollowupConfirm('${f.id}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>`;
          }).join('')}
        </div>
      `}
    </div>

    ${completados.length > 0 ? `
    <div class="card">
      <div class="card-header"><div class="card-title" style="color:var(--text-muted)">Completados (${completados.length})</div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Tipo</th><th>Cliente</th><th>Fecha prog.</th><th>Descripción</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${completados.map(f => {
            const cl = clients.find(c => c.id === (f.clientId||f.client_id));
            return `<tr>
              <td>${tipoIcon[f.tipo]||'📋'} ${escHtml(f.tipo||'—')}</td>
              <td>${escHtml(cl?.nombre||'—')}</td>
              <td class="td-muted">${fmt.date(f.fechaPrograma||f.fecha_programa)}</td>
              <td class="td-muted">${escHtml(f.descripcion||'—')}</td>
              <td>${statusBadge(f.estado||'Completado')}</td>
              <td><button class="btn-icon danger" onclick="deleteFollowupConfirm('${f.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>` : ''}
  `;
}

async function openFollowupModal(clientId = null, id = null) {
  const existing = id ? (await DB.getFollowups()).find(f => f.id === id) : null;
  const clients = await DB.getClients();

  const html = `
    <div class="form-grid">
      <div class="form-group form-full">
        <label class="form-label">Cliente<span>*</span></label>
        <select class="form-select" id="ff-client">
          <option value="">— Seleccionar cliente —</option>
          ${clients.map(c => `<option value="${c.id}" ${(clientId||existing?.clientId||existing?.client_id||'')===c.id?'selected':''}>${escHtml(c.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de seguimiento</label>
        <div class="radio-group">
          ${['Garantía','Servicio','Llamada','Visita','Otro'].map(t => `
            <label class="radio-chip ${(existing?.tipo||'Llamada')===t?'selected':''}">
              <input type="radio" name="ff-tipo" value="${t}" ${(existing?.tipo||'Llamada')===t?'checked':''} />
              ${{Garantía:'🛡️',Servicio:'🔧',Llamada:'📞',Visita:'🏠',Otro:'📋'}[t]} ${t}
            </label>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha programada</label>
        <input class="form-input" type="date" id="ff-fecha" value="${existing?.fechaPrograma||existing?.fecha_programa||new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-select" id="ff-estado">
          ${['Pendiente','En seguimiento','Completado','Cancelado'].map(s => `<option value="${s}" ${(existing?.estado||'Pendiente')===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Descripción / Motivo</label>
        <textarea class="form-textarea" id="ff-desc" placeholder="Ej. Revisión de garantía por fuga en sellado...">${escHtml(existing?.descripcion||'')}</textarea>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Resultado / Acción tomada</label>
        <textarea class="form-textarea" id="ff-resultado" placeholder="Ej. Se aplicó silicón, se ajustó rodamiento...">${escHtml(existing?.resultado||'')}</textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveFollowup('${id||''}')">
        ${existing ? 'Guardar Cambios' : '+ Agregar Seguimiento'}
      </button>
    </div>
  `;
  openModal(existing ? 'Editar Seguimiento' : 'Nuevo Seguimiento', html);
  initModalChips();
}

function editFollowup(id) { openFollowupModal(null, id); }

async function saveFollowup(id) {
  const clientId = document.getElementById('ff-client')?.value;
  if (!clientId) { showToast('Selecciona un cliente', 'error'); return; }
  const tipo = document.querySelector('input[name="ff-tipo"]:checked')?.value || 'Llamada';
  const data = {
    clientId,
    tipo,
    fechaPrograma: document.getElementById('ff-fecha')?.value || new Date().toISOString().split('T')[0],
    estado: document.getElementById('ff-estado')?.value || 'Pendiente',
    descripcion: document.getElementById('ff-desc')?.value?.trim() || '',
    resultado: document.getElementById('ff-resultado')?.value?.trim() || '',
  };
  const cl = await DB.getClient(clientId);
  closeModal();
  try {
    if (id) {
      const existing = (await DB.getFollowups()).find(f => f.id === id);
      await DB.updateFollowup({ ...existing, ...data });
      showToast('Seguimiento actualizado', 'success');
    } else {
      await DB.addFollowup(data);
      showToast('Seguimiento registrado', 'success');
      await DB.logActivity(`Seguimiento <strong>${tipo}</strong> para ${cl?.nombre||'—'}`, 'blue');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  await renderFollowup();
}

async function completeFollowup(id) {
  const all = await DB.getFollowups();
  const f = all.find(x => x.id === id);
  if (!f) return;
  await DB.updateFollowup({ ...f, estado: 'Completado' });
  showToast('Seguimiento completado', 'success');
  await renderFollowup();
}

async function deleteFollowupConfirm(id) {
  confirmDelete('¿Eliminar este seguimiento?', async () => {
    await DB.deleteFollowup(id);
    showToast('Seguimiento eliminado', 'warning');
    await renderFollowup();
  });
}
