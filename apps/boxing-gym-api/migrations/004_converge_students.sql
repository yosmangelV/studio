-- Migration 004: alinea migrations/ con producción (ver schema/public.sql)
-- Correr en: Supabase Dashboard > SQL Editor
-- Requiere: migrations 001-003
--
-- Idempotente: sirve tanto para producción (que ya tiene auth_user_id pero no el
-- trigger de updated_at) como para una base creada desde cero con 001-003.

-- 1. students.auth_user_id: el vínculo con Supabase Auth que usa app/students/service.py.
--    Existe en producción pero ninguna migración lo creaba.
alter table students add column if not exists auth_user_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'students_auth_user_id_fkey') then
    alter table students
      add constraint students_auth_user_id_fkey foreign key (auth_user_id) references auth.users(id);
  end if;
end $$;

-- 2. updated_at de students: el trigger de 001 no existe en producción, así que
--    updated_at se quedaba con la fecha de alta. Función propia, como en 003.
create or replace function students_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists students_updated_at on students;
create trigger students_updated_at
  before update on students
  for each row execute function students_touch_updated_at();

-- Solo existe en bases creadas desde 001; ya no la usa nada.
drop function if exists update_updated_at();

-- 3. Defensa en profundidad: Supabase concede todos los privilegios a anon y
--    authenticated en tablas nuevas. Hoy solo RLS (sin policies) los frena; si
--    alguien desactivara RLS, los datos personales quedarían expuestos con la
--    anon key del bundle. Nadie los lee directamente: la API usa service_role y el
--    recuento público pasa por public_active_students_rounded() (security definer).
revoke all on students, payments from anon, authenticated;
