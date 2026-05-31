// =====================================================
//  AlumCRM — Quotes Module
//  Cotizaciones con materiales de aluminio y ventanas
// =====================================================

// ─── Catálogos de Aluminio y Ventanas ───────────────
const CATALOGO = {
  tiposProducto: [
    'Ventana Corrediza', 'Ventana Abatible', 'Ventana Proyectante',
    'Ventana Fija', 'Ventana Guillotina',
    'Puerta Corrediza', 'Puerta Abatible/Batiente', 'Puerta Plegable',
    'Cancel de Baño', 'Cancel Recto', 'Cancel en L',
    'Fachada de Vidrio', 'Muro Cortina',
    'Domos / Tragaluces', 'Reja de Aluminio',
    'Vitral Decorativo', 'Otro (especificar)'
  ],
  lineasAluminio: [
    { value: 'Económica', label: 'Económica (STD)', desc: 'Perfil 2"' },
    { value: 'Residencial', label: 'Residencial', desc: 'Perfil 3"' },
    { value: 'Comercial', label: 'Comercial', desc: 'Perfil 4"' },
    { value: 'Arquitectónica', label: 'Arquitectónica', desc: 'Perfil pesado' },
    { value: 'Serie 25', label: 'Serie 25', desc: '25mm' },
    { value: 'Serie 35', label: 'Serie 35', desc: '35mm' },
    { value: 'Serie 45', label: 'Serie 45', desc: '45mm' },
    { value: 'Termopanel', label: 'Termopanel / TVS', desc: 'Doble vidrio' },
  ],
  coloresAluminio: [
    { value: 'Natural', color: '#e8e4dc', label: 'Natural' },
    { value: 'Bronce', color: '#8b6f47', label: 'Bronce' },
    { value: 'Negro Mate', color: '#2a2a2a', label: 'Negro Mate' },
    { value: 'Negro Brillante', color: '#111', label: 'Negro Brillante' },
    { value: 'Blanco', color: '#f5f5f5', label: 'Blanco' },
    { value: 'Champagne', color: '#c4a882', label: 'Champagne' },
    { value: 'Anodizado Natural', color: '#c8c8c8', label: 'Anodizado Natural' },
    { value: 'Anodizado Bronce', color: '#7a5c3c', label: 'Anodizado Bronce' },
    { value: 'Anodizado Negro', color: '#333', label: 'Anodizado Negro' },
    { value: 'Madera (Folio)', color: '#6b4226', label: 'Madera (Folio)' },
    { value: 'Personalizado', color: '#888', label: 'Personalizado' },
  ],
  tiposVidrio: [
    { value: 'Claro 3mm', label: 'Claro 3mm', cat: 'Claro' },
    { value: 'Claro 4mm', label: 'Claro 4mm', cat: 'Claro' },
    { value: 'Claro 6mm', label: 'Claro 6mm', cat: 'Claro' },
    { value: 'Ahumado 4mm', label: 'Ahumado 4mm', cat: 'Ahumado' },
    { value: 'Ahumado 6mm', label: 'Ahumado 6mm', cat: 'Ahumado' },
    { value: 'Bronce 4mm', label: 'Bronce 4mm', cat: 'Color' },
    { value: 'Bronce 6mm', label: 'Bronce 6mm', cat: 'Color' },
    { value: 'Azul 4mm', label: 'Azul 4mm', cat: 'Color' },
    { value: 'Azul 6mm', label: 'Azul 6mm', cat: 'Color' },
    { value: 'Verde 4mm', label: 'Verde 4mm', cat: 'Color' },
    { value: 'Templado 6mm', label: 'Templado 6mm', cat: 'Templado' },
    { value: 'Templado 8mm', label: 'Templado 8mm', cat: 'Templado' },
    { value: 'Templado 10mm', label: 'Templado 10mm', cat: 'Templado' },
    { value: 'Laminado 6mm', label: 'Laminado 6mm', cat: 'Laminado' },
    { value: 'Laminado 10mm', label: 'Laminado 10mm', cat: 'Laminado' },
    { value: 'Espejo 4mm', label: 'Espejo 4mm', cat: 'Espejo' },
    { value: 'Espejo 6mm', label: 'Espejo 6mm', cat: 'Espejo' },
    { value: 'Doble Vidrio (Termopanel)', label: 'Doble Vidrio (Termopanel)', cat: 'Especial' },
    { value: 'Policarbonato', label: 'Policarbonato', cat: 'Especial' },
    { value: 'Sin vidrio', label: 'Sin vidrio / Solo perfil', cat: 'Especial' },
  ],
  herrajes: [
    'Manija corrediza', 'Manija batiente', 'Jalador',
    'Cerradura con llave', 'Cerradura con botón', 'Candado',
    'Bisagras (par)', 'Bisagras ocultas',
    'Rodamientos inferiores', 'Rodamientos superiores',
    'Pivote / Eje', 'Cremona', 'Espagnoleta',
    'Tope de puerta', 'Cierra puertas hidráulico',
    'Pasador / Aldaba', 'Anticopia'
  ],
  accesorios: [
    'Mosquitero fijo', 'Mosquitero enrollable', 'Mosquitero corredizo',
    'Persiana integrada', 'Persiana exterior', 'Cortina de enrollar',
    'Sello/burlete', 'Tapajuntas', 'Cubre perfil decorativo',
    'Reja de seguridad', 'Film/Vinil decorativo', 'Film protección UV',
    'Protección antigranizo', 'Escuadras de refuerzo'
  ],
  selladoFijacion: [
    'Silicón transparente', 'Silicón blanco', 'Silicón negro',
    'Sellador poliuretano', 'Masilla selladora',
    'Pijas de aluminio', 'Pijas acero inox',
    'Anclas/taquetes', 'Marco de obra', 'Sin sellado (solo suministro)'
  ],
  acabados: [
    'Anodizado', 'Electrostático (polvo)', 'Pintura líquida',
    'Folio madera', 'Folio mármol', 'Natural (sin acabado)', 'Otro'
  ],
  instalacion: ['Incluida', 'No incluida', 'Parcial (solo ajuste)'],
  garantia: ['6 meses', '1 año', '2 años', '3 años', 'Sin garantía']
};

// ─── Render list ────────────────────────────────────
async function renderQuotes(filter = 'all', search = '') {
  let [quotes, clients] = await Promise.all([DB.getQuotes(), DB.getClients()]);
  if (filter !== 'all') quotes = quotes.filter(q => q.estado === filter);
  if (search) {
    const s = search.toLowerCase();
    quotes = quotes.filter(q => {
      const cl = clients.find(c => c.id === q.clientId);
      return (cl?.nombre||'').toLowerCase().includes(s) ||
             String(q.num).includes(s);
    });
  }

  const filters = ['all','Borrador','Enviada','Aprobada','Rechazada'];
  const filterLabels = { all:'Todas', Borrador:'Borrador', Enviada:'Enviadas', Aprobada:'Aprobadas', Rechazada:'Rechazadas' };

  document.getElementById('page-content').innerHTML = `
    <div class="section-header">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar cotización..." id="quote-search" value="${escHtml(search)}" oninput="renderQuotes('${filter}', this.value)" />
      </div>
      <span style="font-size:12px;color:var(--text-muted)">${quotes.length} cotizaciones</span>
    </div>
    <div class="filters-bar">
      ${filters.map(f => `<span class="filter-chip ${filter===f?'active':''}" onclick="renderQuotes('${f}','${escHtml(search)}')">${filterLabels[f]}</span>`).join('')}
    </div>

    ${quotes.length === 0 ? `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Sin cotizaciones</h3>
          <p>Crea tu primera cotización con el botón + arriba</p>
        </div>
      </div>
    ` : `
      <div class="card" style="padding:0;overflow:hidden">
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>#</th><th>Cliente</th><th>Fecha</th><th>Productos</th>
              <th>Total</th><th>Válida hasta</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              ${quotes.map(q => {
                const cl = clients.find(c => c.id === q.clientId);
                const validez = q.fecha && q.validez ? addDays(q.fecha, parseInt(q.validez)) : null;
                return `<tr>
                  <td class="td-muted">#${q.num}</td>
                  <td>
                    <strong style="cursor:pointer;color:var(--gold-300)" onclick="viewClient('${q.clientId}')">${escHtml(cl?.nombre||'—')}</strong>
                  </td>
                  <td class="td-muted">${fmt.date(q.fecha)}</td>
                  <td class="td-muted">${(q.productos||[]).length} item(s)</td>
                  <td><strong>${fmt.currency(q.total)}</strong></td>
                  <td class="td-muted">${validez ? fmt.date(validez) : '—'}</td>
                  <td>${statusBadge(q.estado)}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn-secondary btn-sm" onclick="editQuote('${q.id}')">Ver / Editar</button>
                      ${q.estado === 'Aprobada' ? `<button class="btn-primary btn-sm" onclick="convertToOrder('${q.id}')">→ Pedido</button>` : ''}
                      <button class="btn-icon danger" onclick="deleteQuoteConfirm('${q.id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}
  `;
  updateBadges();
}

async function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Quote Modal ─────────────────────────────────────
let quoteProducts = [];

async function openQuoteModal(clientId = null, quoteId = null) {
  openModal(quoteId ? 'Editar Cotización' : 'Nueva Cotización', `
    <div style="display:flex;align-items:center;justify-content:center;height:200px;flex-direction:column;gap:16px">
      <div style="width:36px;height:36px;border:3px solid var(--bg-400);border-top-color:var(--gold-400);border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <span style="color:var(--text-muted);font-size:13px">Cargando clientes y datos...</span>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `);

  try {
    const [clients, existing] = await Promise.all([
      DB.getClients(),
      quoteId ? DB.getQuote(quoteId) : Promise.resolve(null)
    ]);

    quoteProducts = existing ? JSON.parse(JSON.stringify(existing.productos || [])) : [];
    if (quoteProducts.length === 0) quoteProducts.push(newProduct());

    const title = existing ? `Cotización #${existing.num}` : 'Nueva Cotización';

    const html = `
      <div class="form-section">
        <div class="form-section-title">📋 Información General</div>
        <div class="form-grid cols-3">
          <div class="form-group form-full">
            <label class="form-label">Cliente<span>*</span></label>
            <select class="form-select" id="qf-client">
              <option value="">— Seleccionar cliente —</option>
              ${clients.map(c => `<option value="${c.id}" ${(clientId||existing?.clientId||existing?.client_id)===c.id?'selected':''}>${escHtml(c.nombre)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input class="form-input" type="date" id="qf-fecha" value="${existing?.fecha||fmt.today()}" />
          </div>
          <div class="form-group">
            <label class="form-label">Validez (días)</label>
            <input class="form-input" type="number" id="qf-validez" placeholder="30" value="${existing?.validez||'30'}" min="1" max="365" />
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-select" id="qf-estado">
              ${['Borrador','Enviada','Aprobada','Rechazada'].map(e => `<option value="${e}" ${(existing?.estado||'Borrador')===e?'selected':''}>${e}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">🪟 Productos / Partidas</div>
        <div id="products-list"></div>
        <button class="add-product-btn" onclick="addProduct()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar producto / partida
        </button>
      </div>

      <div class="form-section">
        <div class="form-section-title">💰 Totales</div>
        <div class="form-grid cols-3">
          <div class="form-group">
            <label class="form-label">Descuento ($)</label>
            <input class="form-input" type="number" id="qf-descuento" placeholder="0" value="${existing?.descuento||0}" min="0" oninput="recalcTotal()" />
          </div>
          <div class="form-group">
            <label class="form-label">Subtotal</label>
            <input class="form-input" id="qf-subtotal" readonly value="${fmt.currency(existing?.subtotal||0)}" style="opacity:0.7" />
          </div>
          <div class="form-group">
            <label class="form-label">Total</label>
            <input class="form-input" id="qf-total" readonly value="${fmt.currency(existing?.total||0)}" style="font-weight:700;color:var(--gold-300)" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">📝 Notas de Cotización</div>
        <div class="form-group">
          <label class="form-label">Condiciones / Notas</label>
          <textarea class="form-textarea" id="qf-notas" placeholder="Ej. Precios incluyen IVA, instalación incluida, 1 año de garantía...">${escHtml(existing?.notas||'')}</textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="saveQuote('${quoteId||''}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
          ${existing ? 'Guardar Cambios' : 'Guardar Cotización'}
        </button>
      </div>
    `;

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    renderProductsList();
    recalcTotal();
  } catch (error) {
    showToast('Error al cargar datos: ' + error.message, 'error');
    closeModal();
  }
}

function editQuote(id) {
  openQuoteModal(null, id);
}

function newProduct() {
  return { id: uuid(), tipo: '', cantidad: 1, ancho: '', alto: '', lineaAluminio: '', colorAluminio: '', vidrio: '', accesorios: [], herrajes: [], sellado: '', acabado: '', instalacion: 'Incluida', garantia: '1 año', precioUnitario: 0, notas: '' };
}

function addProduct() {
  quoteProducts.push(newProduct());
  renderProductsList();
}

function removeProduct(idx) {
  quoteProducts.splice(idx, 1);
  if (quoteProducts.length === 0) quoteProducts.push(newProduct());
  renderProductsList();
  recalcTotal();
}

function renderProductsList() {
  const container = document.getElementById('products-list');
  if (!container) return;
  container.innerHTML = quoteProducts.map((p, i) => buildProductCard(p, i)).join('');
  // init interactivity
  initProductCards();
}

function buildProductCard(p, i) {
  return `
  <div class="quote-product-item" id="product-card-${i}">
    <div class="quote-product-header">
      <div class="product-number">${i+1}</div>
      <div class="product-label">Producto / Partida ${i+1}</div>
      ${quoteProducts.length > 1 ? `<button class="btn-icon danger" onclick="removeProduct(${i})">✕</button>` : ''}
    </div>

    <!-- Tipo y cantidad -->
    <div class="form-grid" style="margin-bottom:12px">
      <div class="form-group">
        <label class="form-label">Tipo de producto<span>*</span></label>
        <select class="form-select" onchange="updateProduct(${i},'tipo',this.value)">
          <option value="">— Seleccionar —</option>
          ${CATALOGO.tiposProducto.map(t => `<option value="${t}" ${p.tipo===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Cantidad</label>
        <input class="form-input" type="number" min="1" value="${p.cantidad||1}" onchange="updateProduct(${i},'cantidad',+this.value)" />
      </div>
    </div>

    <!-- Medidas -->
    <div class="material-section">
      <div class="material-label">📐 Medidas</div>
      <div class="form-grid cols-3">
        <div class="form-group">
          <label class="form-label">Ancho (m)</label>
          <input class="form-input" type="number" step="0.01" min="0" placeholder="1.20" value="${p.ancho||''}" onchange="updateProduct(${i},'ancho',+this.value)" />
        </div>
        <div class="form-group">
          <label class="form-label">Alto (m)</label>
          <input class="form-input" type="number" step="0.01" min="0" placeholder="1.50" value="${p.alto||''}" onchange="updateProduct(${i},'alto',+this.value)" />
        </div>
        <div class="form-group">
          <label class="form-label">Área (m²)</label>
          <input class="form-input" readonly value="${p.ancho && p.alto ? (p.ancho * p.alto).toFixed(2) + ' m²' : '—'}" style="opacity:0.6" id="area-${i}" />
        </div>
      </div>
    </div>

    <!-- Línea de aluminio -->
    <div class="material-section">
      <div class="material-label">🪟 Línea de Aluminio</div>
      <div class="radio-group">
        ${CATALOGO.lineasAluminio.map(l => `
          <label class="radio-chip ${p.lineaAluminio===l.value?'selected':''}">
            <input type="radio" name="linea-${i}" value="${l.value}" ${p.lineaAluminio===l.value?'checked':''} onchange="updateProduct(${i},'lineaAluminio',this.value)" />
            <span>${l.label}</span>
          </label>`).join('')}
      </div>
    </div>

    <!-- Color de aluminio -->
    <div class="material-section">
      <div class="material-label">🎨 Color de Aluminio</div>
      <div class="color-options">
        ${CATALOGO.coloresAluminio.map(c => `
          <div class="color-chip ${p.colorAluminio===c.value?'selected':''}" onclick="selectColorAluminio(${i},'${c.value}',this)">
            <div class="color-dot" style="background:${c.color}"></div>
            ${c.label}
          </div>`).join('')}
      </div>
    </div>

    <!-- Tipo de vidrio -->
    <div class="material-section">
      <div class="material-label">🔲 Tipo de Vidrio</div>
      <div class="checkbox-group" style="flex-wrap:wrap">
        ${['Claro','Ahumado','Color','Templado','Laminado','Espejo','Especial'].map(cat => {
          const items = CATALOGO.tiposVidrio.filter(v => v.cat === cat);
          return items.map(v => `
            <label class="radio-chip ${p.vidrio===v.value?'selected':''}">
              <input type="radio" name="vidrio-${i}" value="${v.value}" ${p.vidrio===v.value?'checked':''} onchange="updateProduct(${i},'vidrio',this.value)" />
              ${v.label}
            </label>`).join('');
        }).join('')}
      </div>
    </div>

    <!-- Herrajes -->
    <div class="material-section">
      <div class="material-label">🔩 Herrajes</div>
      <div class="checkbox-group">
        ${CATALOGO.herrajes.map(h => `
          <label class="checkbox-chip ${(p.herrajes||[]).includes(h)?'selected':''}">
            <input type="checkbox" name="herrajes-${i}" value="${h}" ${(p.herrajes||[]).includes(h)?'checked':''} onchange="toggleArrayProp(${i},'herrajes','${h}',this.checked)" />
            ${h}
          </label>`).join('')}
      </div>
    </div>

    <!-- Accesorios -->
    <div class="material-section">
      <div class="material-label">🛠️ Accesorios</div>
      <div class="checkbox-group">
        ${CATALOGO.accesorios.map(a => `
          <label class="checkbox-chip ${(p.accesorios||[]).includes(a)?'selected':''}">
            <input type="checkbox" name="accesorios-${i}" value="${a}" ${(p.accesorios||[]).includes(a)?'checked':''} onchange="toggleArrayProp(${i},'accesorios','${a}',this.checked)" />
            ${a}
          </label>`).join('')}
      </div>
    </div>

    <!-- Sellado y acabado -->
    <div class="form-grid" style="margin-top:12px">
      <div class="form-group">
        <label class="form-label">🔒 Sellado / Fijación</label>
        <select class="form-select" onchange="updateProduct(${i},'sellado',this.value)">
          <option value="">— Seleccionar —</option>
          ${CATALOGO.selladoFijacion.map(s => `<option value="${s}" ${p.sellado===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">✨ Acabado del perfil</label>
        <select class="form-select" onchange="updateProduct(${i},'acabado',this.value)">
          <option value="">— Seleccionar —</option>
          ${CATALOGO.acabados.map(a => `<option value="${a}" ${p.acabado===a?'selected':''}>${a}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">🔧 Instalación</label>
        <select class="form-select" onchange="updateProduct(${i},'instalacion',this.value)">
          ${CATALOGO.instalacion.map(a => `<option value="${a}" ${p.instalacion===a?'selected':''}>${a}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">🛡️ Garantía</label>
        <select class="form-select" onchange="updateProduct(${i},'garantia',this.value)">
          ${CATALOGO.garantia.map(g => `<option value="${g}" ${p.garantia===g?'selected':''}>${g}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Precio -->
    <div class="form-grid" style="margin-top:12px">
      <div class="form-group">
        <label class="form-label">💵 Precio unitario ($)</label>
        <input class="form-input" type="number" min="0" step="0.01" value="${p.precioUnitario||0}" onchange="updateProduct(${i},'precioUnitario',+this.value);recalcTotal()" style="font-weight:600" />
      </div>
      <div class="form-group">
        <label class="form-label">Subtotal partida</label>
        <input class="form-input" readonly id="subtotal-${i}" value="${fmt.currency((p.precioUnitario||0) * (p.cantidad||1))}" style="opacity:0.7;font-weight:600;color:var(--gold-300)" />
      </div>
      <div class="form-group form-full">
        <label class="form-label">Notas de esta partida</label>
        <input class="form-input" placeholder="Especificaciones adicionales..." value="${escHtml(p.notas||'')}" onchange="updateProduct(${i},'notas',this.value)" />
      </div>
    </div>
  </div>`;
}

function initProductCards() {
  document.querySelectorAll('.radio-chip').forEach(chip => {
    const rb = chip.querySelector('input[type="radio"]');
    if (!rb) return;
    chip.onclick = () => {
      const name = rb.name;
      document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach(r => {
        r.closest('.radio-chip').classList.remove('selected');
      });
      rb.checked = true;
      chip.classList.add('selected');
    };
  });
  document.querySelectorAll('.checkbox-chip').forEach(chip => {
    const cb = chip.querySelector('input[type="checkbox"]');
    if (!cb) return;
    chip.onclick = () => {
      cb.checked = !cb.checked;
      chip.classList.toggle('selected', cb.checked);
      const i = cb.name.split('-').pop();
      const prop = cb.name.startsWith('herrajes') ? 'herrajes' : 'accesorios';
      toggleArrayProp(+i, prop, cb.value, cb.checked);
    };
  });
}

function updateProduct(i, key, value) {
  if (!quoteProducts[i]) return;
  quoteProducts[i][key] = value;
  // Update area display
  if (key === 'ancho' || key === 'alto') {
    const a = quoteProducts[i].ancho, h = quoteProducts[i].alto;
    const el = document.getElementById(`area-${i}`);
    if (el) el.value = (a && h) ? (a * h).toFixed(2) + ' m²' : '—';
  }
  if (key === 'precioUnitario' || key === 'cantidad') {
    const el = document.getElementById(`subtotal-${i}`);
    if (el) el.value = fmt.currency((quoteProducts[i].precioUnitario||0) * (quoteProducts[i].cantidad||1));
    recalcTotal();
  }
}

function toggleArrayProp(i, prop, val, checked) {
  if (!quoteProducts[i]) return;
  if (!Array.isArray(quoteProducts[i][prop])) quoteProducts[i][prop] = [];
  if (checked) {
    if (!quoteProducts[i][prop].includes(val)) quoteProducts[i][prop].push(val);
  } else {
    quoteProducts[i][prop] = quoteProducts[i][prop].filter(x => x !== val);
  }
}

function selectColorAluminio(i, value, el) {
  if (!quoteProducts[i]) return;
  quoteProducts[i].colorAluminio = value;
  const card = document.getElementById(`product-card-${i}`);
  if (card) card.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function recalcTotal() {
  const subtotal = quoteProducts.reduce((s, p) => s + ((p.precioUnitario||0) * (p.cantidad||1)), 0);
  const descuento = parseFloat(document.getElementById('qf-descuento')?.value || 0);
  const total = Math.max(0, subtotal - descuento);
  const subEl = document.getElementById('qf-subtotal');
  const totEl = document.getElementById('qf-total');
  if (subEl) subEl.value = fmt.currency(subtotal);
  if (totEl) totEl.value = fmt.currency(total);
}

async function saveQuote(id) {
  const clientId = document.getElementById('qf-client')?.value;
  if (!clientId) { showToast('Selecciona un cliente', 'error'); return; }
  const subtotal = quoteProducts.reduce((s, p) => s + ((p.precioUnitario||0) * (p.cantidad||1)), 0);
  const descuento = parseFloat(document.getElementById('qf-descuento')?.value || 0);
  const total = Math.max(0, subtotal - descuento);
  const data = {
    clientId,
    fecha: document.getElementById('qf-fecha')?.value || fmt.today(),
    validez: document.getElementById('qf-validez')?.value || '30',
    estado: document.getElementById('qf-estado')?.value || 'Borrador',
    productos: quoteProducts,
    subtotal, descuento, total,
    notas: document.getElementById('qf-notas')?.value?.trim() || '',
  };
  const cl = await DB.getClient(clientId);
  closeModal();
  try {
    if (id) {
      const existing = await DB.getQuote(id);
      await DB.updateQuote({ ...existing, ...data });
      showToast('Cotización actualizada', 'success');
      await DB.logActivity(`Cotización <strong>#${existing.num}</strong> actualizada — ${fmt.currency(total)}`, 'gold');
    } else {
      const q = await DB.addQuote({ ...data });
      showToast('Cotización guardada', 'success');
      await DB.logActivity(`Nueva cotización <strong>#${q.num}</strong> para ${cl?.nombre||'—'} — ${fmt.currency(total)}`, 'blue');
    }
  } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  await renderQuotes();
}

async function deleteQuoteConfirm(id) {
  const q = await DB.getQuote(id);
  confirmDelete(`¿Eliminar cotización #${q?.num}?`, async () => {
    await DB.deleteQuote(id);
    showToast('Cotización eliminada', 'warning');
    await renderQuotes();
  });
}

// ─── Convert to order ───────────────────────────────
async function convertToOrder(quoteId) {
  const [q, orders] = await Promise.all([DB.getQuote(quoteId), DB.getOrders()]);
  if (!q) return;
  const cl = await DB.getClient(q.clientId || q.client_id);
  const existingOrder = orders.find(o => (o.quoteId || o.quote_id) === quoteId);
  if (existingOrder) {
    showToast('Esta cotización ya tiene un pedido asignado (#' + existingOrder.num + ')', 'warning');
    return;
  }

  const html = `
    <div class="form-section">
      <div class="form-section-title">📦 Datos del Pedido</div>
      <div style="padding:12px;background:var(--bg-800);border-radius:8px;margin-bottom:16px">
        <div style="font-size:13px;color:var(--text-secondary)">Cliente: <strong style="color:var(--text-primary)">${escHtml(cl?.nombre||'—')}</strong></div>
        <div style="font-size:13px;color:var(--text-secondary)">Total cotización: <strong style="color:var(--gold-300)">${fmt.currency(q.total)}</strong></div>
        <div style="font-size:13px;color:var(--text-secondary)">${(q.productos||[]).length} producto(s)</div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Fecha de entrega estimada</label>
          <input class="form-input" type="date" id="of-fechaEntrega" value="" />
        </div>
        <div class="form-group">
          <label class="form-label">Instalador asignado</label>
          <input class="form-input" id="of-instalador" placeholder="Nombre del instalador" />
        </div>
        <div class="form-group">
          <label class="form-label">Anticipo ($)</label>
          <input class="form-input" type="number" id="of-anticipo" placeholder="0.00" value="${(q.total * 0.5).toFixed(2)}" min="0" oninput="calcSaldo(${q.total})" />
        </div>
        <div class="form-group">
          <label class="form-label">Saldo pendiente</label>
          <input class="form-input" id="of-saldo" readonly value="${fmt.currency(q.total * 0.5)}" style="opacity:0.7;color:var(--warning)" />
        </div>
        <div class="form-group">
          <label class="form-label">Método de anticipo</label>
          <select class="form-select" id="of-metodo">
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cheque">Cheque</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Estado inicial</label>
          <select class="form-select" id="of-estado">
            <option value="Pendiente">Pendiente</option>
            <option value="En Fabricación" selected>En Fabricación</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-top:12px">
        <label class="form-label">Notas del pedido</label>
        <textarea class="form-textarea" id="of-notas" placeholder="Instrucciones de instalación, dirección de entrega, notas especiales...">${escHtml(q.notas||'')}</textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn-primary" onclick="createOrderFromQuote('${quoteId}')">
        📦 Crear Pedido
      </button>
    </div>
  `;
  openModal('Convertir a Pedido', html);
}

function calcSaldo(total) {
  const ant = parseFloat(document.getElementById('of-anticipo')?.value || 0);
  const saldo = Math.max(0, total - ant);
  const el = document.getElementById('of-saldo');
  if (el) el.value = fmt.currency(saldo);
}

async function createOrderFromQuote(quoteId) {
  const q = await DB.getQuote(quoteId);
  if (!q) return;
  const ant = parseFloat(document.getElementById('of-anticipo')?.value || 0);
  const order = {
    id: uuid(), num: DB.nextNum('order'),
    clientId: q.clientId, quoteId,
    fecha: fmt.today(),
    fechaEntrega: document.getElementById('of-fechaEntrega')?.value || '',
    estado: document.getElementById('of-estado')?.value || 'En Fabricación',
    instalador: document.getElementById('of-instalador')?.value?.trim() || '',
    total: q.total,
    anticipo: ant,
    saldo: Math.max(0, q.total - ant),
    notas: document.getElementById('of-notas')?.value?.trim() || '',
    createdAt: fmt.today()
  };
  const clientId = q.clientId || q.client_id;
  closeModal();
  try {
    const o = await DB.addOrder({ clientId, quoteId, fecha: fmt.today(), fechaEntrega: document.getElementById('of-fechaEntrega')?.value||'', estado: document.getElementById('of-estado')?.value||'En Fabricación', instalador: document.getElementById('of-instalador')?.value?.trim()||'', total: q.total, anticipo: ant, saldo: Math.max(0, q.total - ant), notas: document.getElementById('of-notas')?.value?.trim()||'' });
    if (ant > 0) {
      await DB.addPayment({ orderId: o.id, clientId, concepto: 'Anticipo', monto: ant, metodo: document.getElementById('of-metodo')?.value||'Efectivo', fecha: fmt.today() });
    }
    await DB.updateQuote({ ...q, estado: 'Aprobada' });
    const cl = await DB.getClient(clientId);
    await DB.logActivity(`Pedido <strong>#${o.num}</strong> creado para ${cl?.nombre||'—'} — ${fmt.currency(q.total)}`, 'gold');
    showToast(`Pedido #${o.num} creado exitosamente`, 'success');
  } catch(e) { showToast('Error: ' + e.message, 'error'); return; }
  await navigate('orders');
}
