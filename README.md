# AlumCRM 🪟

**CRM especializado para empresas de aluminio y ventanas.**

Gestiona el ciclo de vida completo del cliente: cotizaciones, pedidos, instalaciones, pagos y seguimiento post-venta.

## 🚀 Demo en vivo
**[Ver en Netlify →](https://alumcrm.netlify.app)**

## ✨ Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| 🏠 Dashboard | KPIs, gráfica de ingresos, pipeline de ventas |
| 👥 Clientes | Ficha completa, historial, notas |
| 📋 Cotizaciones | Catálogo completo de materiales: 8 líneas de aluminio, 19 tipos de vidrio, 17 herrajes |
| 📦 Pedidos | Estados de producción, asignación de instaladores |
| 💰 Pagos | Anticipos, saldos, métodos de pago |
| 🔧 Instalaciones | Agenda, checklist de 12 puntos |
| 📞 Seguimiento | Garantías, servicios, recordatorios |

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5 + Vanilla CSS + Vanilla JS (SPA)
- **Base de datos:** [Supabase](https://supabase.com) (PostgreSQL)
- **Hosting:** [Netlify](https://netlify.com)
- **CI/CD:** GitHub → Netlify automático

## ⚙️ Configuración local

1. Clona el repo:
```bash
git clone https://github.com/licdiego2710-create/alumcrm.git
cd alumcrm
```

2. Crea el archivo `js/config.js` con tus credenciales de Supabase:
```js
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...tu_anon_key...';
```

3. Ejecuta las migraciones SQL en tu proyecto Supabase (archivo `supabase/schema.sql`)

4. Abre `index.html` en el navegador

## 🗄️ Estructura del proyecto

```
alumcrm/
├── index.html
├── styles/
│   ├── main.css
│   └── components.css
├── js/
│   ├── app.js          ← Router principal
│   ├── db.js           ← Capa de datos (Supabase)
│   ├── supabase-client.js
│   ├── config.js       ← Credenciales (NO subir al repo)
│   ├── utils/
│   │   └── helpers.js
│   └── modules/
│       ├── dashboard.js
│       ├── clients.js
│       ├── quotes.js
│       ├── orders.js
│       ├── payments.js
│       ├── installations.js
│       └── followup.js
└── supabase/
    └── schema.sql      ← Script de tablas
```
