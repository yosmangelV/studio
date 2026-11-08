# Boxing Gym API

Backend de gestión para una escuela de boxeo. Construido con FastAPI + Supabase, desplegado en Render.

---

## Stack

| Capa             | Tecnología                          |
|------------------|-------------------------------------|
| Framework        | [FastAPI](https://fastapi.tiangolo.com) |
| Validación       | Pydantic v2                         |
| Base de datos    | Supabase (PostgreSQL + Auth + RLS)  |
| Gestor de paquetes | [uv](https://docs.astral.sh/uv)   |
| Deploy           | [Render](https://render.com) (`render.yaml`) |
| Cliente frontend | `@hey-api/openapi-ts` (generado)    |

---

## Estructura del proyecto

```
boxing-gym-api/
├── app/
│   ├── main.py          # Entry point: crea la app FastAPI y monta los routers
│   ├── config.py        # Variables de entorno con Pydantic Settings
│   ├── database.py      # Cliente Supabase (singleton)
│   └── students/        # Módulo de alumnos
│       ├── router.py    # Endpoints HTTP
│       ├── schemas.py   # Modelos Pydantic (request/response)
│       └── service.py   # Lógica de negocio y queries
├── specs/               # Especificaciones SDD por módulo
│   └── students.md
├── .env.example         # Template de variables de entorno
├── pyproject.toml       # Config del proyecto y dependencias
└── uv.lock              # Lock file (versiones exactas de dependencias)
```

---

## Setup local

### 1. Instalar uv (si no lo tienes)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Instalar dependencias

```bash
uv sync
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### 4. Correr el servidor

```bash
uv run uvicorn app.main:app --reload
```

La API estará en `http://localhost:8000`.  
Documentación interactiva: `http://localhost:8000/docs`

---

## Flujo de desarrollo (SDD)

Antes de escribir código para cualquier feature nueva:

1. **Crear o actualizar la spec** en `specs/<modulo>.md`
   - Define la historia de usuario
   - Describe el modelo de datos
   - Lista los endpoints con request/response y errores
   - Declara las reglas de negocio
   - Marca qué queda fuera de alcance

2. **Revisar la spec** antes de implementar

3. **Implementar** siguiendo la spec como fuente de verdad

4. **Actualizar la spec** si algo cambia durante la implementación

---

## API

La documentación OpenAPI se genera automáticamente. Con el servidor corriendo:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **JSON spec:** `http://localhost:8000/openapi.json`

---

## Módulos

| Módulo     | Estado      | Spec                          |
|------------|-------------|-------------------------------|
| Students   | En desarrollo | [specs/students.md](specs/students.md) |

---

## Deploy

Render despliega la API desde `render.yaml`, en la raíz del monorepo: imagen Docker construida desde `apps/boxing-gym-api`, health check en `/health` y plan gratuito, así que la primera petición tras un rato inactivo tarda de 30 a 60 s. Las variables `sync: false` se configuran en el panel de Render. El blueprint describe también `announcement-api`: si se sincroniza entero, Render crea los dos servicios, que comparten las horas del plan gratuito; qué pasa cuando se agotan está en la sección *Deploy* del README de la raíz. Si esta API queda suspendida, el login sigue funcionando (va directo a Supabase) y la landing sigue mostrando los datos públicos, pero falla lo que pasa por la API: alumnos, pagos y guardar los ajustes.

`render.yaml` fija `APP_NAME`; las demás variables son `sync: false` y se introducen en el panel de Render. Son las mismas que lista para `.env` la sección *Environment Variables* del README de la raíz.
