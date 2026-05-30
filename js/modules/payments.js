// =====================================================
//  AlumCRM — Payments Module (Supabase async)
// =====================================================

async function renderPayments() {
  const [payments, orders, clients] = await Promise.all([
    DB.getPayments(), DB.getOrders(), DB.getClients()
  ]);
  const totalCobrado = payments.reduce((s,p) => s + Number(p.monto||0), 0);
  const saldoPendiente = orders.reduce((s,o) => s + Number(o.saldo||0), 0);

  document.getElementById('page-content').innerHTML = `
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card green">
        <div class="stat-icon" style="background:var(--success-bg);color:var(--success)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <div class="stat-info"><div class="stat-value">${fmt.currency(totalCobrado)}</div><div class="stat-label">Total cobrado</div></div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon" style="background:var(--danger-bg);color:var(--danger)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-info"><div class="stat-value">${fmt.currency(saldoPendiente)}</div><div class="stat-label">Saldo por cobrar</div></div>
      </div>
      <div class="stat-card gold">
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:var(--gold-400)">📋</div>
        <div class="stat-info"><div class="stat-value">${payments.length}</div><div class="stat-label">Pagos registrados</div></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><div class="card-title">Saldos Pendientes por Pedido</div></div>
      ${orders.filter(o => Number(o.saldo) > 0 && o.estado !== 'Cancelado').length === 0
        ? `<div class="empty-state" style="padding:20px"><p>¡Sin saldos pendientes! 🎉</p></div>`
        : `<div class="table-wrapper"><table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Cobrado</th><th>Saldo</th><th></th></tr></thead>
            <tbody>
              ${orders.filter(o => Number(o.saldo) > 0 && o.estado !== 'Cancelado').map(o => {
                const cl = clients.find(c => c.id === (o.clientId||o.client_id));
                const cobrado = payments.filter(p => (p.orderId||p.order_id) === o.id).reduce((s,p) => s + Number(p.monto||0), 0);
                return `<tr>
                  <td class="td-muted">#${o.num}</td>
                  <td><strong style="cursor:pointer;color:var(--gold-300)" onclick="viewClient('${o.clientId||o.client_id}')">${escHtml(cl?.nombre||'—')}</strong></td>
                  <td>${statusBadge(o.estado)}</td>
                  <td>${fmt.currency(o.total)}</td>
                  <td style="color:var(--success)">${fmt.currency(cobrado)}</td>
                  <td style="color:var(--warning);font-weight:700">${fmt.currency(o.saldo)}</td>
                  <td><button class="btn-primary btn-sm" onclick="openPaymentModal('${o.id}')">+ Pago</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>`}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Todos los Pagos</div></div>
      ${payments.length === 0
        ? `<div class="empty-state" style="padding:24px"><p>Sin pagos registrados</p></div>`
        : `<div class="table-wrapper"><table>
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Pedido</th><th>Concepto</th><th>Método</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              ${payments.map(p => {
                const cl = clients.find(c => c.id === (p.clientId||p.client_id));
                const o = orders.find(x => x.id === (p.orderId||p.order_id));
                return `<tr>
                  <td class="td-muted">${fmt.date(p.fecha)}</td>
                  <td><strong>${escHtml(cl?.nombre||'—')}</strong></td>
                  <td class="td-muted">${o ? '#'+o.num : '—'}</td>
                  <td>${escHtml(p.concepto||'Pago')}</td>
                  <td><span class="badge badge-gray">${escHtml(p.metodo||'—')}</span></td>
                  <td style="color:var(--success);font-weight:700">${fmt.currency(p.monto)}</td>
                  <td>
                    <button class="btn-icon danger" onclick="deletePaymentConfirm('${p.id}','${p.orderId||p.order_id}')">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>`}
    </div>
  `;
}

async function openPaymentModal(orderId) {
  const o = await DB.getOrder(orderId);
  if (!o) return;
  const cl = await DB.getClient(o.clientId || o.client_id);
  const paid = (await DB.getPaymentsByOrder(orderId)).reduce((s,p) => s + Number(p.monto||0), 0);
  const saldo = Math.max(0, Number(o.total) - paid);

  const html = `
    <div style="padding:12px;background:var(--bg-800);border-radius:8px;margin-bottom:16px">
      <div style="font-size:13px;color:var(--text-secondary)">Cliente: <strong style="color:var(--text-primary)">${escHtml(cl?.nombre||'—')}</strong></div>
      <div style="font-size:13px;color:var(--text-secondary)">Pedido: <strong>#${o.num}</strong></div>
      <div style="font-size:13px;color:var(--warning)">Saldo pendiente: <strong>${fmt.currency(saldo)}</strong></div>
    </div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Concepto<span>*</span></label>
        <select class="form-select" id="pf-concepto">
          <option value="Anticipo">Anticipo</option><option value="Pago parcial">Pago parcial</option>
          <option value="Liquidación">Liquidación total</option><option value="Otro">Otro</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Monto ($)<span>*</span></label>
        <input class="form-input" type="number" id="pf-monto" min="0" step="0.01" value="${saldo.toFixed(2)}" />
      </div>
      <div class="form-group"><label class="form-label">Método de pago</label>
        <select class="form-select" id="pf-metodo">
          <option>Efectivo</option><option>Transferencia</option><option>Cheque</option>
          <option>Tarjeta débito</option><option>Tarjeta crédito</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Fecha</label>
        <input class="form-input" type="date" id="pf-fecha" value="${new Date().toISOString().split('T')[0]}" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="savePayment('${orderId}')">💵 Registrar Pago</button>
    </div>
  `;
  openModal('Registrar Pago', html);
}

async function savePayment(orderId) {
  const monto = parseFloat(document.getElementById('pf-monto')?.value || 0);
  if (!monto || monto <= 0) { showToast('Ingresa un monto válido', 'error'); return; }
  const o = await DB.getOrder(orderId);
  if (!o) return;
  closeModal();
  try {
    await DB.addPayment({
      orderId, clientId: o.clientId || o.client_id,
      concepto: document.getElementById('pf-concepto')?.value || 'Pago',
      monto,
      metodo: document.getElementById('pf-metodo')?.value || 'Efectivo',
      fecha: document.getElementById('pf-fecha')?.value || new Date().toISOString().split('T')[0],
    });
    const allPayments = await DB.getPaymentsByOrder(orderId);
    const allPaid = allPayments.reduce((s,p) => s + Number(p.monto||0), 0);
    await DB.updateOrder({ ...o, saldo: Math.max(0, Number(o.total) - allPaid) });
    const cl = await DB.getClient(o.clientId || o.client_id);
    await DB.logActivity(`Pago <strong>${fmt.currency(monto)}</strong> registrado — ${cl?.nombre||'—'}`, 'green');
    showToast(`Pago de ${fmt.currency(monto)} registrado`, 'success');
  } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  await renderPayments();
}

async function deletePaymentConfirm(paymentId, orderId) {
  const allP = await DB.getPayments();
  const p = allP.find(x => x.id === paymentId);
  if (!p) return;
  confirmDelete(`¿Eliminar pago de ${fmt.currency(p.monto)}?`, async () => {
    await DB.deletePayment(paymentId);
    const o = await DB.getOrder(orderId);
    if (o) {
      const paid = (await DB.getPaymentsByOrder(orderId)).reduce((s,p) => s + Number(p.monto||0), 0);
      await DB.updateOrder({ ...o, saldo: Math.max(0, Number(o.total) - paid) });
    }
    showToast('Pago eliminado', 'warning');
    await renderPayments();
  });
}
