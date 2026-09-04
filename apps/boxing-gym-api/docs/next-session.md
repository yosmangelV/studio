# Próxima sesión

## Estado actual de `main`

Backend completo y probado end-to-end:
- CRUD completo de students (`GET`, `POST`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`)
- JWT auth middleware funcionando (algoritmo dinámico desde JWKS, no hardcodeado)
- Modelo de students actualizado: se agregaron `birth_date` (requerido) y `weight` (opcional, para peleadores)
- Tabla en Supabase migrada y probada
- Docs: `session-01-changes.md`, `session-02-changes.md`

## Próximo paso

Pasar al **frontend** — continuar en el repo del frontend (otra ventana de Claude Code).

## Notas técnicas para tener en cuenta

- El JWT de Supabase usa un algoritmo dinámico (no siempre RS256) — el middleware ya lo maneja con `signing_key.algorithm_name`
- `CORS_ORIGINS` en el `.env` debe estar en formato JSON: `["http://localhost:4301"]`
- El email del alumno puede usarse en el futuro para crear usuarios en Supabase Auth (login para alumnos)
