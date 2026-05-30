// =====================================================
//  AlumCRM — Database Layer (Supabase)
//  Reemplaza localStorage con PostgreSQL en la nube
// =====================================================

const DB = {

  _sb() { return getSupabase(); },

  // ─── Helper: maneja errores y devuelve datos ─────
  async _q(promise) {
    const { data, error } = await promise;
    if (error) { console.error('DB Error:', error.message); return []; }
    return data || [];
  },

  async _qOne(promise) {
    const { data, error } = await promise;
    if (error) { console.error('DB Error:', error.message); return null; }
    return data && data.length ? data[0] : null;
  },

  // ─── Counter helper ──────────────────────────────
  async nextNum(key) {
    const sb = this._sb();
    const { data } = await sb.rpc('increment_counter', { counter_key: key });
    return data || 1;
  },

  // ─── TODAY ───────────────────────────────────────
  today() { return new Date().toISOString().split('T')[0]; },

  // ==================================================
  //  CLIENTES
  // ==================================================
  async getClients() {
    return this._q(this._sb().from('clients').select('*').order('created_at', { ascending: false }));
  },
  async getClient(id) {
    return this._qOne(this._sb().from('clients').select('*').eq('id', id));
  },
  async addClient(c) {
    const num = await this.nextNum('client');
    const { data, error } = await this._sb().from('clients').insert([{ ...c, num }]).select();
    if (error) throw error;
    return data[0];
  },
  async updateClient(c) {
    const { id, ...rest } = c;
    await this._sb().from('clients').update(rest).eq('id', id);
  },
  async deleteClient(id) {
    await this._sb().from('clients').delete().eq('id', id);
  },

  // ==================================================
  //  COTIZACIONES
  // ==================================================
  async getQuotes() {
    return this._q(this._sb().from('quotes').select('*').order('created_at', { ascending: false }));
  },
  async getQuote(id) {
    return this._qOne(this._sb().from('quotes').select('*').eq('id', id));
  },
  async getQuotesByClient(clientId) {
    return this._q(this._sb().from('quotes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }));
  },
  async addQuote(q) {
    const num = await this.nextNum('quote');
    const payload = this._quoteToDb(q, num);
    const { data, error } = await this._sb().from('quotes').insert([payload]).select();
    if (error) throw error;
    return this._quoteFromDb(data[0]);
  },
  async updateQuote(q) {
    const { id, ...rest } = this._quoteToDb(q);
    await this._sb().from('quotes').update(rest).eq('id', q.id);
  },
  async deleteQuote(id) {
    await this._sb().from('quotes').delete().eq('id', id);
  },
  _quoteToDb(q, num) {
    return {
      id: q.id,
      ...(num !== undefined ? { num } : {}),
      client_id: q.clientId || q.client_id,
      fecha: q.fecha,
      validez: q.validez,
      estado: q.estado,
      productos: q.productos || [],
      subtotal: q.subtotal || 0,
      descuento: q.descuento || 0,
      total: q.total || 0,
      notas: q.notas || '',
    };
  },
  _quoteFromDb(q) {
    if (!q) return null;
    return { ...q, clientId: q.client_id, quoteId: q.id };
  },

  // ==================================================
  //  PEDIDOS
  // ==================================================
  async getOrders() {
    const rows = await this._q(this._sb().from('orders').select('*').order('created_at', { ascending: false }));
    return rows.map(this._orderFromDb);
  },
  async getOrder(id) {
    const row = await this._qOne(this._sb().from('orders').select('*').eq('id', id));
    return this._orderFromDb(row);
  },
  async getOrdersByClient(clientId) {
    const rows = await this._q(this._sb().from('orders').select('*').eq('client_id', clientId).order('created_at', { ascending: false }));
    return rows.map(this._orderFromDb);
  },
  async addOrder(o) {
    const num = await this.nextNum('order');
    const payload = this._orderToDb(o, num);
    const { data, error } = await this._sb().from('orders').insert([payload]).select();
    if (error) throw error;
    return this._orderFromDb(data[0]);
  },
  async updateOrder(o) {
    const payload = this._orderToDb(o);
    const { id, ...rest } = payload;
    await this._sb().from('orders').update(rest).eq('id', o.id);
  },
  async deleteOrder(id) {
    await this._sb().from('orders').delete().eq('id', id);
  },
  _orderToDb(o, num) {
    return {
      id: o.id,
      ...(num !== undefined ? { num } : {}),
      client_id: o.clientId || o.client_id,
      quote_id: o.quoteId || o.quote_id || null,
      fecha: o.fecha,
      fecha_entrega: o.fechaEntrega || o.fecha_entrega || null,
      estado: o.estado || 'Pendiente',
      instalador: o.instalador || '',
      total: o.total || 0,
      anticipo: o.anticipo || 0,
      saldo: o.saldo || 0,
      notas: o.notas || '',
    };
  },
  _orderFromDb(o) {
    if (!o) return null;
    return { ...o, clientId: o.client_id, quoteId: o.quote_id, fechaEntrega: o.fecha_entrega, createdAt: o.created_at };
  },

  // ==================================================
  //  PAGOS
  // ==================================================
  async getPayments() {
    const rows = await this._q(this._sb().from('payments').select('*').order('created_at', { ascending: false }));
    return rows.map(this._paymentFromDb);
  },
  async getPaymentsByOrder(orderId) {
    const rows = await this._q(this._sb().from('payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }));
    return rows.map(this._paymentFromDb);
  },
  async addPayment(p) {
    const payload = {
      order_id: p.orderId || p.order_id,
      client_id: p.clientId || p.client_id,
      concepto: p.concepto || 'Pago',
      monto: p.monto || 0,
      metodo: p.metodo || 'Efectivo',
      fecha: p.fecha || this.today(),
    };
    const { data, error } = await this._sb().from('payments').insert([payload]).select();
    if (error) throw error;
    return this._paymentFromDb(data[0]);
  },
  async deletePayment(id) {
    await this._sb().from('payments').delete().eq('id', id);
  },
  _paymentFromDb(p) {
    if (!p) return null;
    return { ...p, orderId: p.order_id, clientId: p.client_id, createdAt: p.created_at };
  },

  // ==================================================
  //  INSTALACIONES
  // ==================================================
  async getInstallations() {
    const rows = await this._q(this._sb().from('installations').select('*').order('fecha', { ascending: true }));
    return rows.map(this._installFromDb);
  },
  async addInstallation(i) {
    const payload = this._installToDb(i);
    const { data, error } = await this._sb().from('installations').insert([payload]).select();
    if (error) throw error;
    return this._installFromDb(data[0]);
  },
  async updateInstallation(i) {
    const { id, ...rest } = this._installToDb(i);
    await this._sb().from('installations').update(rest).eq('id', i.id);
  },
  async deleteInstallation(id) {
    await this._sb().from('installations').delete().eq('id', id);
  },
  _installToDb(i) {
    return {
      id: i.id,
      client_id: i.clientId || i.client_id,
      order_id: i.orderId || i.order_id || null,
      fecha: i.fecha,
      hora: i.hora || '09:00',
      instalador: i.instalador || '',
      estado: i.estado || 'Pendiente',
      direccion: i.direccion || '',
      checklist: i.checklist || [],
      notas: i.notas || '',
    };
  },
  _installFromDb(i) {
    if (!i) return null;
    return { ...i, clientId: i.client_id, orderId: i.order_id, createdAt: i.created_at };
  },

  // ==================================================
  //  SEGUIMIENTO
  // ==================================================
  async getFollowups() {
    const rows = await this._q(this._sb().from('followups').select('*').order('created_at', { ascending: false }));
    return rows.map(this._followupFromDb);
  },
  async addFollowup(f) {
    const payload = {
      client_id: f.clientId || f.client_id,
      tipo: f.tipo || 'Llamada',
      fecha_programa: f.fechaPrograma || f.fecha_programa || null,
      estado: f.estado || 'Pendiente',
      descripcion: f.descripcion || '',
      resultado: f.resultado || '',
    };
    const { data, error } = await this._sb().from('followups').insert([payload]).select();
    if (error) throw error;
    return this._followupFromDb(data[0]);
  },
  async updateFollowup(f) {
    const payload = {
      client_id: f.clientId || f.client_id,
      tipo: f.tipo,
      fecha_programa: f.fechaPrograma || f.fecha_programa,
      estado: f.estado,
      descripcion: f.descripcion,
      resultado: f.resultado,
    };
    await this._sb().from('followups').update(payload).eq('id', f.id);
  },
  async deleteFollowup(id) {
    await this._sb().from('followups').delete().eq('id', id);
  },
  _followupFromDb(f) {
    if (!f) return null;
    return { ...f, clientId: f.client_id, fechaPrograma: f.fecha_programa, createdAt: f.created_at };
  },

  // ==================================================
  //  ACTIVIDAD
  // ==================================================
  async getActivity() {
    return this._q(this._sb().from('activity').select('*').order('created_at', { ascending: false }).limit(50));
  },
  async logActivity(msg, type = 'gold') {
    await this._sb().from('activity').insert([{ msg, type }]);
  },

  // ==================================================
  //  SEED DEMO DATA
  // ==================================================
  async seedDemo() {
    const existing = await this.getClients();
    if (existing.length > 0) return;
    const today = this.today();
    try {
      const c1 = await this.addClient({ nombre: 'María López García', empresa: 'Casa Habitación', telefono: '614-100-2233', email: 'maria@email.com', direccion: 'Av. Tecnológico 1234, Chihuahua', rfc: 'LOGM880115', origen: 'Referido', estado: 'Activo', notas: 'Cliente frecuente, siempre puntual en pagos.' });
      const c2 = await this.addClient({ nombre: 'Constructora Norteña SA', empresa: 'Constructora Norteña SA', telefono: '614-200-4455', email: 'ventas@constructoranortena.mx', direccion: 'Blvd. Ortiz Mena 800', rfc: 'CON930420', origen: 'Facebook', estado: 'En Proceso', notas: 'Proyecto de 40 ventanas para fraccionamiento.' });
      await this.addClient({ nombre: 'Roberto Sánchez Cruz', empresa: '', telefono: '614-300-6677', email: 'rsanchez@gmail.com', direccion: 'Calle Libertad 456', rfc: '', origen: 'Google', estado: 'Nuevo', notas: '' });
      const q1 = await this.addQuote({ clientId: c2.id, fecha: today, validez: '30', estado: 'Aprobada', productos: [{ id: uuid(), tipo: 'Ventana Corrediza', cantidad: 10, ancho: 1.5, alto: 1.2, lineaAluminio: 'Residencial', colorAluminio: 'Bronce', vidrio: 'Claro 6mm', accesorios: ['Mosquitero fijo'], herrajes: ['Rodamientos inferiores', 'Manija corrediza'], sellado: 'Silicón transparente', acabado: 'Anodizado', instalacion: 'Incluida', garantia: '1 año', precioUnitario: 4500, notas: '' }], subtotal: 45000, descuento: 0, total: 45000, notas: 'Incluye instalación y 1 año de garantía.' });
      const o1 = await this.addOrder({ clientId: c2.id, quoteId: q1.id, fecha: today, fechaEntrega: '', estado: 'En Fabricación', instalador: 'Pedro Ramírez', total: 45000, anticipo: 22500, saldo: 22500, notas: 'Entregar en obra antes del viernes.' });
      await this.addPayment({ orderId: o1.id, clientId: c2.id, concepto: 'Anticipo 50%', monto: 22500, metodo: 'Transferencia', fecha: today });
      await this.logActivity('Datos de demostración cargados', 'green');
    } catch(e) { console.warn('Seed parcial:', e.message); }
  }
};
