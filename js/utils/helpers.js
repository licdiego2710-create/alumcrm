// =====================================================
//  AlumCRM — Helpers & Utilities
// =====================================================

const fmt = {
  currency: (n) => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  date: (d) => {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  dateTime: (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  initials: (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },
  phone: (p) => p || '—',
  today: () => new Date().toISOString().split('T')[0],
  relativeTime: (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'ayer';
    return fmt.date(isoStr.split('T')[0]);
  }
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:16px;font-weight:700">${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function openModal(title, bodyHtml, onSave) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-backdrop').classList.add('active');
  document.getElementById('modal').classList.add('active');
  if (onSave) window._modalSave = onSave;
  initModalChips();
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('active');
  document.getElementById('modal').classList.remove('active');
  window._modalSave = null;
}

function initModalChips() {
  // Checkbox chips
  document.querySelectorAll('.checkbox-chip').forEach(chip => {
    const cb = chip.querySelector('input[type="checkbox"]');
    if (cb && cb.checked) chip.classList.add('selected');
    chip.addEventListener('click', () => {
      if (cb) {
        cb.checked = !cb.checked;
        chip.classList.toggle('selected', cb.checked);
      }
    });
  });
  // Radio chips
  document.querySelectorAll('.radio-chip').forEach(chip => {
    const rb = chip.querySelector('input[type="radio"]');
    if (rb && rb.checked) chip.classList.add('selected');
    chip.addEventListener('click', () => {
      if (rb) {
        const name = rb.name;
        document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach(r => {
          r.closest('.radio-chip').classList.remove('selected');
        });
        rb.checked = true;
        chip.classList.add('selected');
      }
    });
  });
  // Color chips
  document.querySelectorAll('.color-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      document.querySelectorAll(`.color-chip[data-group="${group}"]`).forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(el => el.value);
}

function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function getSelectedColorChip(group) {
  const chip = document.querySelector(`.color-chip[data-group="${group}"].selected`);
  return chip ? chip.dataset.value : '';
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function statusBadge(status) {
  const map = {
    'Nuevo': 'badge-blue',
    'En Proceso': 'badge-gold',
    'Activo': 'badge-green',
    'Completado': 'badge-teal',
    'Inactivo': 'badge-gray',
    'Borrador': 'badge-gray',
    'Enviada': 'badge-blue',
    'Aprobada': 'badge-green',
    'Rechazada': 'badge-red',
    'Pendiente': 'badge-gold',
    'En Fabricación': 'badge-purple',
    'Listo': 'badge-teal',
    'Instalado': 'badge-green',
    'Cancelado': 'badge-red',
    'Garantía': 'badge-purple',
    'Servicio': 'badge-blue',
    'Pagado': 'badge-green',
    'Parcial': 'badge-gold',
  };
  const cls = map[status] || 'badge-gray';
  return `<span class="badge ${cls}">${escHtml(status)}</span>`;
}

function confirmDelete(msg, onConfirm) {
  if (confirm(msg || '¿Estás seguro de eliminar este registro?')) {
    onConfirm();
  }
}

// Toggle sidebar mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}
