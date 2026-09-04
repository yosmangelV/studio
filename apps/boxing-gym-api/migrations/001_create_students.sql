-- Migration 001: Tabla de alumnos
-- Correr en: Supabase Dashboard > SQL Editor

create table students (
  id              uuid          primary key default gen_random_uuid(),
  full_name       text          not null check (char_length(full_name) >= 2 and char_length(full_name) <= 100),
  email           text          not null unique,
  phone           text          check (char_length(phone) <= 20),
  birth_date      date          not null,
  enrollment_date date          not null,
  level           text          not null check (level in ('beginner', 'intermediate', 'advanced')),
  is_active       boolean       not null default true,
  weight          numeric(5, 2),
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- Trigger para actualizar updated_at automáticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger students_updated_at
  before update on students
  for each row execute function update_updated_at();
