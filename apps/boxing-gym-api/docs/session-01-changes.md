# Sesión 01 — Explicación de cambios

Guía de aprendizaje de los cambios aplicados en la primera sesión de desarrollo.
Cada sección explica **qué** cambió, **por qué** era necesario, y el concepto detrás.

---

## 1. `.python-version` — De 3.8 a 3.12

**Qué cambió:**
```
- 3.8
+ 3.12
```

**Por qué:**
Python 3.8 llegó a su fin de vida (EOL) en octubre de 2024. Eso significa que ya no recibe parches de seguridad. Más importante para nosotros: la sintaxis moderna de tipos que usamos en el código requiere 3.10+.

**El concepto — type hints modernos:**

En Python 3.8, si querías anotar que una función aceptaba un string o `None`, tenías que escribir:
```python
from typing import Optional, List
def foo(x: Optional[str]) -> List[str]: ...
```

Desde Python 3.10 puedes usar sintaxis nativa, más limpia:
```python
def foo(x: str | None) -> list[str]: ...
```

Y en Python 3.12, `list[str]` funciona incluso en tiempo de ejecución sin imports. En `config.py` usamos `list[str]` y `str | list`, así que necesitamos 3.10 mínimo. Elegimos 3.12 porque es la versión LTS estable actual.

---

## 2. `pyproject.toml` — Nuevas dependencias

**Qué cambió:**
```toml
+ "pydantic[email]>=2.0.0",
+ "pyjwt[crypto]>=2.8.0",
```

**Por qué `pydantic[email]`:**

El schema de students usa `EmailStr`:
```python
from pydantic import EmailStr
email: EmailStr
```

`EmailStr` no es solo un string — Pydantic la valida como email real (`"texto"` falla, `"texto@ejemplo.com"` pasa). Pero para hacer esa validación, Pydantic necesita una librería externa llamada `email-validator`. El extra `[email]` le dice a pip/uv que la instale junto con Pydantic. Sin él, arrancar la app lanza un `ImportError`.

**Por qué `pyjwt[crypto]`:**

`PyJWT` es la librería para decodificar y verificar tokens JWT. El extra `[crypto]` añade soporte para el algoritmo **RS256** (RSA + SHA-256), que es el que usa Supabase para firmar sus tokens. Sin ese extra, PyJWT solo puede verificar tokens firmados con HMAC (HS256), que es menos seguro porque usa la misma clave para firmar y verificar.

> **Nota:** `pyjwt` ya venía instalado como dependencia transitiva de `supabase`. Lo declaramos explícitamente en `pyproject.toml` porque si algún día `supabase` cambia sus dependencias internas y lo elimina, nuestra app seguiría funcionando. Las dependencias que usas directamente en tu código deben estar declaradas directamente — no depender de que otra librería las traiga.

---

## 3. `app/config.py` — Limpieza y nuevas variables

**Qué cambió:**
```python
# ANTES
supabase_url: str
supabase_anon_key: str          # ← eliminado
supabase_service_role_key: str

# DESPUÉS
supabase_url: str
supabase_service_role_key: str
supabase_jwks_url: str          # ← nuevo
cors_origins: list[str] = ["http://localhost:4301"]  # ← nuevo
```

**Por qué se eliminó `supabase_anon_key`:**

Supabase tiene dos tipos de clave:
- **Anon key:** clave pública, pensada para el frontend (el cliente JS de Angular la usa). Respeta las políticas RLS (Row Level Security) de Supabase.
- **Service role key:** clave privada de admin, bypasea RLS completamente. Solo debe vivir en el backend.

El backend solo necesita la service role key para ejecutar queries como administrador. Tener la anon key configurada pero sin usar es ruido — y si alguien lee el código sin contexto, se preguntará para qué sirve. Lo que no se usa, no se declara.

**Por qué se agregó `supabase_jwks_url`:**

JWKS son las siglas de **JSON Web Key Set**. Supabase publica en una URL pública las claves públicas RSA que usa para firmar los tokens JWT. El backend las descarga de ahí y las usa para verificar que un token es legítimo sin tener que llamar a Supabase en cada request.

La URL tiene este formato: `https://tu-proyecto.supabase.co/auth/v1/.well-known/jwks.json`

**Por qué `cors_origins` tiene un `@field_validator`:**

Las variables de entorno son siempre strings. Pero necesitamos una lista de orígenes. Si pones en el `.env`:
```
CORS_ORIGINS=http://localhost:4301,http://localhost:3000
```

Pydantic recibiría el string `"http://localhost:4301,http://localhost:3000"`. El validador lo parte por comas y convierte a lista:
```python
@field_validator("cors_origins", mode="before")
@classmethod
def parse_cors_origins(cls, v: str | list) -> list[str]:
    if isinstance(v, str):
        return [origin.strip() for origin in v.split(",")]
    return v
```

El `mode="before"` significa que el validador corre *antes* de que Pydantic intente convertir el valor al tipo declarado (`list[str]`). Si corriera después, Pydantic ya habría fallado al intentar meter un string donde esperaba una lista.

---

## 4. `app/main.py` — Middleware CORS

**Qué cambió:**
```python
+ from fastapi.middleware.cors import CORSMiddleware
+
+ app.add_middleware(
+     CORSMiddleware,
+     allow_origins=settings.cors_origins,
+     allow_credentials=True,
+     allow_methods=["*"],
+     allow_headers=["*"],
+ )
```

**El concepto — CORS:**

CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador. Por defecto, un navegador **bloquea** las peticiones JavaScript que van a un dominio distinto al de la página que las lanza.

El frontend corre en `http://localhost:4301` (Angular). La API corre en `http://localhost:8000` (FastAPI). Para el navegador, estos son dos **orígenes distintos** (distinto puerto = distinto origen). Sin CORS configurado, el navegador bloquea cada request de Angular a FastAPI antes de que llegue.

El middleware CORS le dice a FastAPI que añada cabeceras HTTP en cada respuesta, informando al navegador que sí acepta requests desde esos orígenes:
```
Access-Control-Allow-Origin: http://localhost:4301
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, ...
```

**Por qué `allow_credentials=True`:**

Nuestro `authInterceptor` en Angular inyecta `Authorization: Bearer <token>` en cada request. Cuando una petición cross-origin lleva cabeceras de autorización, el navegador la considera una "petición con credenciales" y requiere que el servidor lo permita explícitamente con esta opción.

**Importante:** En producción, `allow_origins` nunca debería ser `["*"]` si usas credenciales. Al leerlo de `settings.cors_origins`, podemos controlarlo por entorno — dev tiene el localhost, producción tendrá el dominio real.

---

## 5. `app/students/service.py` — Tres correcciones

### 5a. `model_dump(mode="json")`

**Qué cambió:**
```python
# ANTES
response = supabase.table(TABLE).insert(payload.model_dump()).execute()

# DESPUÉS
response = supabase.table(TABLE).insert(payload.model_dump(mode="json")).execute()
```

**Por qué:**

`model_dump()` devuelve un diccionario con objetos Python nativos:
```python
{
    "full_name": "Juan",
    "enrollment_date": datetime.date(2024, 1, 15),  # objeto date de Python
    "level": <StudentLevel.beginner: 'beginner'>,   # objeto Enum de Python
}
```

`model_dump(mode="json")` devuelve el equivalente serializable como JSON:
```python
{
    "full_name": "Juan",
    "enrollment_date": "2024-01-15",   # string ISO
    "level": "beginner",               # string
}
```

Supabase usa PostgREST por debajo, que recibe JSON. Si le mandas un objeto `date` de Python o un Enum, puede que lo acepte (Python hace una conversión implícita a veces), pero también puede que falle silenciosamente o lo interprete mal. La forma correcta es enviarle siempre valores serializables como JSON.

### 5b. `maybe_single()` vs `single()`

**Qué cambió:**
```python
# ANTES
response = supabase.table(TABLE).select("*").eq("id", student_id).single().execute()

# DESPUÉS
response = supabase.table(TABLE).select("*").eq("id", student_id).maybe_single().execute()
```

**Por qué:**

- `single()`: espera **exactamente un resultado**. Si no encuentra nada, lanza una excepción de PostgREST.
- `maybe_single()`: devuelve un resultado o `None`. No lanza excepción si no encuentra nada.

Para el endpoint `GET /students/{id}`, el comportamiento correcto cuando el ID no existe es devolver `None` y que el router responda 404. Con `single()`, en vez de llegar al `if not student:` del router, obtenías una excepción de PostgREST que FastAPI convertiría en un 500, lo cual es incorrecto — 500 significa "algo se rompió en el servidor", no "el recurso no existe".

### 5c. `EmailAlreadyExistsError` — Excepción de dominio

**Qué cambió:**
```python
+ class EmailAlreadyExistsError(Exception):
+     pass

def create_student(payload: StudentCreate) -> dict:
+   try:
        response = supabase.table(TABLE).insert(payload.model_dump(mode="json")).execute()
        return response.data[0]
+   except APIError as e:
+       if "23505" in str(e):
+           raise EmailAlreadyExistsError()
+       raise
```

**El concepto — capas de la aplicación:**

Una buena API tiene capas con responsabilidades claras:
- **Service:** lógica de negocio y acceso a datos. Habla el lenguaje del dominio (alumnos, emails).
- **Router:** recibe peticiones HTTP y devuelve respuestas HTTP. Habla el lenguaje de HTTP (status codes, JSON).

Cuando Supabase viola una constraint de unicidad en PostgreSQL, lanza un error con código `23505` (es el código oficial de PostgreSQL para "unique violation"). Ese es un concepto de base de datos — no de HTTP.

El service captura ese error de base de datos y lo convierte en `EmailAlreadyExistsError`, que es un concepto del dominio. Luego el router convierte ese error de dominio en HTTP 409. Así cada capa solo entiende su propio nivel de abstracción:

```
PostgreSQL error 23505
    → service: EmailAlreadyExistsError
        → router: HTTP 409 Conflict
```

Si el error de PostgreSQL llegara directo al router, el router estaría hablando el lenguaje de la base de datos. Y si algún día cambias de Supabase a otra base de datos, tendrías que buscar y cambiar ese código `23505` en el router en vez del service.

---

## 6. `app/students/router.py` — Manejo del 409

**Qué cambió:**
```python
# ANTES
@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate):
    return service.create_student(payload)

# DESPUÉS
@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate):
    try:
        return service.create_student(payload)
    except EmailAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
```

**Por qué 409 y no 400:**

Ambos son errores del cliente, pero significan cosas distintas:
- `400 Bad Request`: la petición está malformada. El cliente envió datos inválidos.
- `409 Conflict`: la petición es válida, pero entra en conflicto con el estado actual del servidor. El email en sí es válido — el problema es que ya existe en la base de datos.

Un 409 le dice al cliente: "tu petición está bien formada, pero no puedo cumplirla porque ya existe un recurso que lo impide". Es más informativo y permite que el frontend muestre un mensaje preciso al usuario.

---

## 7. `app/auth.py` — Middleware JWT (archivo nuevo)

Este es el archivo más conceptualmente denso. Lo explico por partes.

### 7a. ¿Qué es un JWT?

JWT (JSON Web Token) es un token firmado digitalmente. Cuando el usuario inicia sesión en Angular via Supabase, Supabase le devuelve un JWT. Ese token contiene información del usuario (su ID, email, rol) codificada en Base64 y firmada con una clave privada RSA.

El token tiene esta forma:
```
eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.FIRMA_RSA
│────────────────────│ │──────────────────────│ │────────│
  Header (algoritmo)      Payload (datos)        Firma
```

La clave privada solo la tiene Supabase. Pero Supabase publica la **clave pública** correspondiente en la JWKS URL. Con esa clave pública, el backend puede verificar que la firma es auténtica — es decir, que el token lo emitió Supabase y no fue modificado.

### 7b. El código

```python
from functools import lru_cache
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer()
```

`HTTPBearer()` es un helper de FastAPI que extrae automáticamente el token del header `Authorization: Bearer <token>`. Si el header no existe, devuelve 403 antes de que tu código corra.

```python
@lru_cache
def _jwks_client() -> PyJWKClient:
    return PyJWKClient(settings.supabase_jwks_url)
```

`PyJWKClient` descarga las claves públicas de la JWKS URL. `@lru_cache` garantiza que esa descarga solo ocurre **una vez** durante toda la vida del proceso — en el primer request. Los siguientes requests reutilizan el cliente ya creado en memoria. Sin el cache, estarías haciendo una petición HTTP a Supabase en cada request a tu API, añadiendo latencia y dependencia de red innecesaria.

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
```

Lo que hace paso a paso:
1. Extrae el token del header via `Depends(security)`
2. `get_signing_key_from_jwt(token)`: lee el header del JWT para saber qué key ID (kid) usó Supabase para firmarlo, y busca esa clave específica en el JWKS
3. `jwt.decode(...)`: verifica la firma criptográfica, verifica que no haya expirado, y verifica el `audience` (Supabase usa `"authenticated"` para tokens de usuarios logueados)
4. Si todo pasa, devuelve el payload del token (un dict con el ID del usuario, email, etc.)
5. Si algo falla, lanza 401

**Por qué 401 y no 403:**
- `401 Unauthorized`: no sé quién eres (token inválido o ausente)
- `403 Forbidden`: sé quién eres, pero no tienes permiso

Un token inválido o expirado significa que no podemos identificar al usuario → 401.

---

## 8. `app/students/router.py` — Protección de endpoints

**Qué cambió:**
```python
# ANTES
router = APIRouter()

# DESPUÉS
router = APIRouter(dependencies=[Depends(get_current_user)])
```

**Por qué en el `APIRouter` y no en cada endpoint:**

FastAPI permite añadir dependencias a nivel del router. Todas las rutas registradas en ese router heredan la dependencia automáticamente.

Alternativa (peor):
```python
@router.get("/", dependencies=[Depends(get_current_user)])
def list_students(): ...

@router.post("/", dependencies=[Depends(get_current_user)])
def create_student(): ...

# ... repetir en cada endpoint
```

El problema: si mañana agregas un endpoint nuevo y olvidas el `Depends(get_current_user)`, ese endpoint queda sin protección y no hay ningún error en tiempo de arranque que te avise. Con la dependencia en el router, es imposible olvidarlo — cualquier endpoint nuevo queda protegido automáticamente.

---

## 9. `.env.example` — Variables actualizadas

**Qué cambió:**
```bash
# ANTES
SUPABASE_URL=...
SUPABASE_ANON_KEY=...          # ← eliminado
SUPABASE_SERVICE_ROLE_KEY=...

# DESPUÉS
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWKS_URL=...          # ← nuevo
CORS_ORIGINS=...               # ← nuevo
```

`.env.example` es el "template" del `.env` real que nunca se commitea al repo (por el `.gitignore`). Sirve de documentación para cualquier desarrollador que clone el proyecto: sabe exactamente qué variables necesita configurar sin tener que leer el código.

Siempre debe estar sincronizado con lo que `config.py` espera. Si `config.py` tiene `supabase_jwks_url: str` sin valor por defecto, esa variable es obligatoria y debe aparecer en `.env.example`.

---

## Resumen visual del flujo completo

```
Angular (localhost:4301)
    │
    │  Authorization: Bearer <jwt_de_supabase>
    ▼
FastAPI (localhost:8000)
    │
    ├── CORSMiddleware         → permite el request cross-origin
    │
    ├── HTTPBearer             → extrae el token del header
    │
    ├── get_current_user()     → verifica la firma JWT contra JWKS de Supabase
    │
    └── router /students
            │
            ├── service.py     → queries a Supabase (con service role key)
            │
            └── Supabase DB    → retorna los datos
```
