-- Migration 003: Datos del gimnasio (contacto, horarios, clases) — specs/gym-profile.md
-- Correr en: Supabase Dashboard > SQL Editor

begin;

-- ---------------------------------------------------------------------------
-- 1. Prerrequisito de seguridad: RLS en las tablas existentes
--    Sin políticas: la clave anon (pública) no puede leer ni escribir.
--    La API usa service_role, que bypasea RLS, así que no le afecta.
-- ---------------------------------------------------------------------------
alter table students enable row level security;
alter table payments enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Tablas
-- ---------------------------------------------------------------------------
create table gym_profile (
  id                          boolean      primary key default true check (id),
  phone                       text         check (phone ~ '^\+[1-9][0-9]{6,14}$'),
  whatsapp                    text         check (whatsapp ~ '^[1-9][0-9]{6,14}$'),
  email                       text         check (char_length(email) <= 254),
  address                     text         check (char_length(address) <= 200),
  instagram                   text         check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  founded_on                  date,
  active_students_min_display smallint     not null default 20 check (active_students_min_display >= 1),
  updated_at                  timestamptz  not null default now(),
  updated_by                  uuid
);

-- Función propia: la base de datos real no tiene update_updated_at() de la migración 001.
create function gym_profile_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger gym_profile_updated_at
  before update on gym_profile
  for each row execute function gym_profile_touch_updated_at();

create table gym_schedule_slots (
  id          uuid      primary key default gen_random_uuid(),
  day_from    smallint  not null check (day_from between 1 and 7),
  day_to      smallint  not null check (day_to between 1 and 7),
  opens_at    time      not null,
  closes_at   time      not null,
  label       jsonb     check (label is null or (jsonb_typeof(label) = 'object' and label ? 'es')),
  sort_order  smallint  not null default 0,
  check (day_to >= day_from),
  check (closes_at > opens_at)
);

create table gym_classes (
  id           uuid      primary key default gen_random_uuid(),
  name         jsonb     not null check (jsonb_typeof(name) = 'object' and name ? 'es'),
  description  jsonb     not null check (jsonb_typeof(description) = 'object' and description ? 'es'),
  sort_order   smallint  not null default 0,
  is_active    boolean   not null default true
);

-- ---------------------------------------------------------------------------
-- 3. RLS: solo lectura pública. Sin políticas de escritura: solo service_role escribe.
-- ---------------------------------------------------------------------------
alter table gym_profile        enable row level security;
alter table gym_schedule_slots enable row level security;
alter table gym_classes        enable row level security;

create policy "public read" on gym_profile        for select to anon, authenticated using (true);
create policy "public read" on gym_schedule_slots for select to anon, authenticated using (true);
create policy "public read" on gym_classes        for select to anon, authenticated using (is_active);

-- Defensa en profundidad: aunque alguien añadiera por error una política de escritura,
-- anon y authenticated no tienen el privilegio.
revoke all on gym_profile, gym_schedule_slots, gym_classes from anon, authenticated;
grant select on gym_profile, gym_schedule_slots, gym_classes to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Cifra de alumnos activos: solo un número redondeado, nunca filas.
--    security definer: corre con los permisos del dueño para poder contar students,
--    pero solo devuelve el agregado. El recuento exacto no sale de la base de datos.
-- ---------------------------------------------------------------------------
create function public_active_students_rounded()
returns integer
language sql stable security definer
set search_path = public
as $$
  select case
    when count(*) >= (select active_students_min_display from gym_profile)
    then ((count(*) / 10) * 10)::integer
  end
  from students
  where is_active;
$$;

revoke all on function public_active_students_rounded() from public;
grant execute on function public_active_students_rounded() to anon, authenticated;

-- Vista pública: todo en una petición. security_invoker hace que respete el RLS de las tablas;
-- la única puerta a students es la función de arriba.
create view public_gym_profile
with (security_invoker = true) as
select
  (select to_jsonb(p) - 'id' - 'updated_by' - 'active_students_min_display' from gym_profile p) as profile,
  (select coalesce(jsonb_agg(to_jsonb(s) - 'id' order by s.sort_order), '[]'::jsonb) from gym_schedule_slots s) as schedule,
  (select coalesce(jsonb_agg(to_jsonb(k) - 'id' - 'is_active' order by k.sort_order), '[]'::jsonb) from gym_classes k where k.is_active) as classes,
  public_active_students_rounded() as active_students;

revoke all on public_gym_profile from anon, authenticated;
grant select on public_gym_profile to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Reemplazo atómico de listas (llamadas por la API con service_role vía rpc).
--    `where true`: Supabase bloquea DELETE sin WHERE (safeupdate).
-- ---------------------------------------------------------------------------
create function replace_gym_schedule(slots jsonb)
returns void
language plpgsql
set search_path = public
as $$
begin
  delete from gym_schedule_slots where true;
  insert into gym_schedule_slots (day_from, day_to, opens_at, closes_at, label, sort_order)
  select day_from, day_to, opens_at, closes_at, label, sort_order
  from jsonb_to_recordset(slots)
    as x(day_from smallint, day_to smallint, opens_at time, closes_at time, label jsonb, sort_order smallint);
end;
$$;

create function replace_gym_classes(classes jsonb)
returns void
language plpgsql
set search_path = public
as $$
begin
  delete from gym_classes where true;
  insert into gym_classes (name, description, sort_order, is_active)
  select name, description, sort_order, is_active
  from jsonb_to_recordset(classes)
    as x(name jsonb, description jsonb, sort_order smallint, is_active boolean);
end;
$$;

revoke all on function replace_gym_schedule(jsonb) from public, anon, authenticated;
revoke all on function replace_gym_classes(jsonb)  from public, anon, authenticated;
grant execute on function replace_gym_schedule(jsonb) to service_role;
grant execute on function replace_gym_classes(jsonb)  to service_role;

-- ---------------------------------------------------------------------------
-- 6. Datos iniciales (email, Instagram: vacíos hasta tenerlos)
-- ---------------------------------------------------------------------------
insert into gym_profile (phone, whatsapp, address, founded_on)
values ('+34658078039', '34658078039', 'C. de Lope de Vega, 10, 28350 Ciempozuelos, Madrid', '2024-01-01');

insert into gym_schedule_slots (day_from, day_to, opens_at, closes_at, label, sort_order) values
  (2, 4, '11:00', '12:00', '{"es": "Abierta a todos", "en": "Open to all"}', 0),
  (1, 5, '17:30', '18:30', '{"es": "Juniors", "en": "Juniors"}',              1),
  (1, 5, '18:30', '19:30', '{"es": "Adultos", "en": "Adults"}',               2),
  (1, 5, '19:30', '20:30', '{"es": "Adultos", "en": "Adults"}',               3),
  (1, 5, '20:30', '21:30', '{"es": "Adultos", "en": "Adults"}',               4);

insert into gym_classes (name, description, sort_order) values
  ('{"es": "Boxeo", "en": "Boxing"}',
   '{"es": "Técnica, potencia y resistencia. Aprende el arte del ring desde cero.", "en": "Technique, power and endurance. Learn the art of the ring from scratch."}', 0),
  ('{"es": "Fitness con Saco", "en": "Bag Fitness"}',
   '{"es": "Entrenamiento cardiovascular y de fuerza con la intensidad del boxeo.", "en": "Cardio and strength training with the intensity of boxing."}', 1),
  ('{"es": "Juniors", "en": "Juniors"}',
   '{"es": "Disciplina, valores y confianza para los más pequeños de la casa.", "en": "Discipline, values and confidence for the youngest members."}', 2),
  ('{"es": "Sparring", "en": "Sparring"}',
   '{"es": "Combate controlado y supervisado para alumnos de nivel intermedio-avanzado.", "en": "Controlled, supervised sparring for intermediate and advanced students."}', 3);

commit;
