# Boxing Gym API

Backend de gestión para una escuela de boxeo. Construido con FastAPI + Supabase, desplegado en Railway.

---

## Stack

| Capa             | Tecnología                          |
|------------------|-------------------------------------|
| Framework        | [FastAPI](https://fastapi.tiangolo.com) |
| Validación       | Pydantic v2                         |
| Base de datos    | Supabase (PostgreSQL + Auth + RLS)  |
| Gestor de paquetes | [uv](https://docs.astral.sh/uv)   |
| Deploy           | [Railway](https://railway.app)      |
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

> Sección pendiente — se completa al configurar Railway.
