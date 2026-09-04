-- Migration 002: Tabla de pagos
-- Correr en: Supabase Dashboard > SQL Editor
-- Requiere: migration 001 (tabla students debe existir)

create table payments (
  id             uuid          primary key default gen_random_uuid(),
  student_id     uuid          not null references students(id),
  type           text          not null check (type in ('monthly_fee', 'material')),
  period_year    int           check (period_year >= 2020),
  period_month   int           check (period_month between 1 and 12),
  amount         numeric(10,2) not null check (amount > 0),
  payment_method text          not null check (payment_method in ('cash', 'transfer', 'bizum')),
  paid_at        timestamptz   not null default now(),
  created_by     uuid          not null,
  notes          text,
  created_at     timestamptz   not null default now()
);

-- Evita registrar dos mensualidades para el mismo alumno en el mismo mes
create unique index payments_monthly_unique
  on payments (student_id, period_year, period_month)
  where type = 'monthly_fee';
