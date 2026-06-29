# Boxing Gym Management App — Spec

## Descripción

Aplicación de gestión para una escuela de boxeo. El dueño puede administrar todo su negocio desde la app: alumnos, pagos, pedidos de materiales y clases. No incluye pasarela de pago (todo en efectivo), pero sí lleva registro completo de todas las transacciones.

## Cliente

Dueño de una escuela de boxeo. Proyecto en fases — arranca como herramienta del admin, evoluciona hacia acceso de alumnos.

## Roles de usuario

- **Admin** — dueño del local. Acceso total. Puede también ser profesor.
- **Profesor** — gestiona clases. Un alumno puede hacer de profesor sin cambiar de rol.
- **Alumno** — acceso en fases posteriores (inscripción a clases, historial propio).

## Módulos

### Fase 1 — MVP
- **Registro de alumnos**: nombre, contacto, fecha de ingreso, nivel, estado (activo/inactivo)
- Ficha individual por alumno

### Fase 2
- **Control de mensualidades**: marcar pagos, historial, vista de deudores
- **Gestión de pedidos de material**: guantes, vendas, etc. Estado + pago en efectivo

### Fase 3
- **Módulo de clases**: calendario, inscripción de alumnos, capacidad máxima
- Acceso de alumnos a la app

### Futuro (no en roadmap aún)
- Videos de ejercicios asociados a clases
- Suscripciones para entrenamientos en casa

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular (standalone, signals, OnPush) + design-system |
| Estilos | Tailwind + tokens del design-system |
| Backend | Python + FastAPI |
| Validación | Pydantic |
| API Docs | OpenAPI/Swagger (auto, built-in FastAPI) |
| Cliente API | `@hey-api/openapi-ts` (genera cliente TS desde el spec) |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth |
| Hosting web | Vercel |
| Backend hosting | Railway |
| Móvil (Fase 2+) | Ionic + Capacitor |

## Plataforma

Web responsive mobile-first en Fase 1. App móvil (Ionic + Capacitor) cuando entren los alumnos.

## Decisiones técnicas cerradas

- [x] Stack definido
- [x] Plataforma: web first, mobile-first design
- [x] Base de datos: Supabase
- [x] Auth: Supabase Auth con roles
- [x] API client: generado desde OpenAPI spec

## Estado

- [x] Spec del producto
- [x] Stack cerrado
- [ ] Arquitectura técnica
- [ ] Setup del proyecto
- [ ] Fase 1: Registro de alumnos
