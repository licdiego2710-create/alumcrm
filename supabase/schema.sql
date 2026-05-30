-- =====================================================
--  AlumCRM — Supabase Schema
--  Ejecutar en: Supabase Dashboard → SQL Editor
-- =====================================================

-- Habilitar UUID
create extension if not exists "pgcrypto";

-- ─── CLIENTES ──────────────────────────────────────
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  num         serial,
  nombre      text not null,
  empresa     text,
  telefono    text,
  email       text,
  direccion   text,
  rfc         text,
  origen      text,
  estado      text default 'Nuevo',
  notas       text,
  created_at  timestamptz default now()
);

-- ─── COTIZACIONES ──────────────────────────────────
create table if not exists quotes (
  id          uuid primary key default gen_random_uuid(),
  num         serial,
  client_id   uuid references clients(id) on delete cascade,
  fecha       date default current_date,
  validez     text default '30',
  estado      text default 'Borrador',
  productos   jsonb default '[]'::jsonb,
  subtotal    numeric(12,2) default 0,
  descuento   numeric(12,2) default 0,
  total       numeric(12,2) default 0,
  notas       text,
  created_at  timestamptz default now()
);

-- ─── PEDIDOS ───────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  num             serial,
  client_id       uuid references clients(id) on delete cascade,
  quote_id        uuid references quotes(id) on delete set null,
  fecha           date default current_date,
  fecha_entrega   date,
  estado          text default 'Pendiente',
  instalador      text,
  total           numeric(12,2) default 0,
  anticipo        numeric(12,2) default 0,
  saldo           numeric(12,2) default 0,
  notas           text,
  created_at      timestamptz default now()
);

-- ─── PAGOS ─────────────────────────────────────────
create table if not exists payments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  client_id   uuid references clients(id) on delete cascade,
  concepto    text,
  monto       numeric(12,2) default 0,
  metodo      text default 'Efectivo',
  fecha       date default current_date,
  created_at  timestamptz default now()
);

-- ─── INSTALACIONES ─────────────────────────────────
create table if not exists installations (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  order_id    uuid references orders(id) on delete set null,
  fecha       date not null,
  hora        time default '09:00',
  instalador  text,
  estado      text default 'Pendiente',
  direccion   text,
  checklist   jsonb default '[]'::jsonb,
  notas       text,
  created_at  timestamptz default now()
);

-- ─── SEGUIMIENTO ───────────────────────────────────
create table if not exists followups (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references clients(id) on delete cascade,
  tipo            text default 'Llamada',
  fecha_programa  date,
  estado          text default 'Pendiente',
  descripcion     text,
  resultado       text,
  created_at      timestamptz default now()
);

-- ─── ACTIVIDAD ─────────────────────────────────────
create table if not exists activity (
  id          uuid primary key default gen_random_uuid(),
  msg         text,
  type        text default 'gold',
  created_at  timestamptz default now()
);

-- ─── COUNTERS (para números autoincrementales legibles) ─
create table if not exists counters (
  key   text primary key,
  value integer default 0
);
insert into counters (key, value) values ('client', 0), ('quote', 0), ('order', 0)
  on conflict (key) do nothing;

-- ─── RLS (Row Level Security) — desactivado para acceso simple ─
-- Puedes activar auth después con Supabase Auth
alter table clients      enable row level security;
alter table quotes        enable row level security;
alter table orders        enable row level security;
alter table payments      enable row level security;
alter table installations enable row level security;
alter table followups     enable row level security;
alter table activity      enable row level security;
alter table counters      enable row level security;

-- Políticas de acceso público (anon key puede leer y escribir todo)
-- NOTA: Cambiar a políticas por usuario cuando se implemente auth
create policy "public_all" on clients      for all using (true) with check (true);
create policy "public_all" on quotes        for all using (true) with check (true);
create policy "public_all" on orders        for all using (true) with check (true);
create policy "public_all" on payments      for all using (true) with check (true);
create policy "public_all" on installations for all using (true) with check (true);
create policy "public_all" on followups     for all using (true) with check (true);
create policy "public_all" on activity      for all using (true) with check (true);
create policy "public_all" on counters      for all using (true) with check (true);

-- ─── FUNCIÓN para incrementar contadores ───────────
create or replace function increment_counter(counter_key text)
returns integer language plpgsql as $$
declare
  new_val integer;
begin
  update counters set value = value + 1 where key = counter_key returning value into new_val;
  return new_val;
end;
$$;
