# Sesión 02 — Explicación de cambios: JWT Auth

Guía de aprendizaje de los cambios aplicados en la segunda sesión de desarrollo.
Esta sesión tiene un solo objetivo: **proteger la API para que solo usuarios autenticados puedan usarla**.

Cada sección explica **qué** cambió, **por qué** era necesario, y el concepto detrás.

---

## Contexto: ¿Qué problema resolvemos?

Después de la sesión 01, la API funcionaba — pero cualquier persona que supiera la URL podía hacer requests. Si alguien descubriera que tu API corre en `https://boxing-gym.railway.app`, podría listar todos los alumnos, crear falsos, borrar datos. No hay nada que lo impida.

La solución es **autenticación basada en tokens JWT**. El flujo completo queda así:

```
1. El usuario (admin del gimnasio) entra a Angular y hace login con su email/contraseña
2. Supabase verifica las credenciales y devuelve un token JWT firmado
3. Angular guarda ese token y lo adjunta en cada request a la API
4. La API verifica que el token es legítimo antes de responder
5. Si el token es inválido o no existe → la API rechaza el request con 401
```

---

## 1. `pyproject.toml` — Nueva dependencia: `pyjwt[crypto]`

**Qué cambió:**
```toml
+ "pyjwt[crypto]>=2.8.0",
```

**Por qué:**

`PyJWT` es la librería estándar de Python para trabajar con tokens JWT. Le dice a Python cómo decodificar un token y cómo verificar su firma.

El extra `[crypto]` es importante: añade soporte para el algoritmo **RS256** (RSA + SHA-256). Necesitamos entender por qué Supabase usa RS256 y no el más simple HS256:

| Algoritmo | Tipo de clave | ¿Quién puede verificar? |
|-----------|---------------|------------------------|
| **HS256** | Una sola clave secreta compartida | Solo quien tenga la clave secreta |
| **RS256** | Par de claves: privada (firmar) + pública (verificar) | Cualquiera con la clave pública |

Supabase usa RS256 porque:
- Solo Supabase tiene la **clave privada** → solo Supabase puede emitir tokens válidos
- La **clave pública** la puede tener cualquier backend → cualquier servidor puede verificar sin saber el secreto

Si usara HS256, todos los backends tendrían que conocer la clave secreta, lo cual es un riesgo de seguridad.

> **Nota sobre dependencias transitivas:** `pyjwt` ya venía instalado como dependencia de `supabase` (la librería lo usa internamente). Pero lo declaramos explícitamente en `pyproject.toml` porque lo estamos usando *directamente* en nuestro código con `import jwt`. Si `supabase` cambia sus dependencias internas mañana, nuestra app no se rompe. Regla: si lo importas, lo declaras.

---

## 2. `app/config.py` — Nueva variable: `supabase_jwks_url`

**Qué cambió:**
```python
# ANTES
supabase_url: str
supabase_service_role_key: str

# DESPUÉS
supabase_url: str
supabase_service_role_key: str
supabase_jwks_url: str          # ← nuevo
```

**El concepto — ¿Qué es JWKS?**

JWKS son las siglas de **JSON Web Key Set**. Es un formato estándar para publicar claves públicas.

Supabase publica sus claves públicas en una URL como esta:
```
https://tu-proyecto.supabase.co/auth/v1/.well-known/jwks.json
```

Si abres esa URL, ves algo así:
```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "abc123",
      "use": "sig",
      "n": "...clave pública en Base64...",
      "e": "AQAB"
    }
  ]
}
```

Nuestro backend descarga esa URL al arrancar y usa esas claves para verificar tokens. La clave `kid` (key ID) en el JWKS corresponde al `kid` en el header de cada JWT — así el backend sabe exactamente qué clave usar para verificar cada token.

**¿Por qué lo ponemos en config y no lo hardcodeamos?**

Porque en producción usarás un proyecto Supabase distinto al de desarrollo. Con la variable de entorno, cambias la URL en el `.env` de Railway sin tocar el código.

---

## 3. `app/auth.py` — Archivo nuevo: el verificador de tokens

Este es el cambio principal. Archivo nuevo completo, explicado línea por línea.

```python
from functools import lru_cache
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
```

Los imports relevantes:
- `lru_cache`: decorador de Python que cachea el resultado de una función (explicado abajo)
- `jwt` y `PyJWKClient`: de la librería `pyjwt[crypto]` que instalamos
- `HTTPBearer`: helper de FastAPI que sabe extraer tokens del header `Authorization`

---

```python
security = HTTPBearer()
```

`HTTPBearer()` es un objeto que sabe leer el header HTTP `Authorization: Bearer <token>`. Cuando lo usas como dependencia en FastAPI, automáticamente:
1. Busca el header `Authorization` en el request
2. Verifica que empiece con `Bearer `
3. Extrae el token que viene después
4. Si el header no existe o no tiene el formato correcto → devuelve **403** antes de que tu código corra

---

```python
@lru_cache
def _jwks_client() -> PyJWKClient:
    return PyJWKClient(settings.supabase_jwks_url)
```

`PyJWKClient(url)` descarga las claves públicas de Supabase cuando se instancia. El problema: si creamos un cliente nuevo en *cada request*, estaríamos haciendo una petición HTTP a Supabase *por cada request* a nuestra API. Con 100 requests por segundo, eso son 100 peticiones externas que:
- Añaden ~50-200ms de latencia a cada request
- Pueden fallar si hay problemas de red con Supabase
- Podrían ser interpretadas como abuso y bloqueadas

`@lru_cache` (Least Recently Used Cache) es un decorador estándar de Python que cachea el resultado de la función. La primera vez que alguien llama a `_jwks_client()`, descarga las claves y guarda el resultado. Las siguientes 10,000 llamadas devuelven el objeto guardado en memoria sin tocar la red.

La convención `_nombre` (con guión bajo al inicio) indica que es una función privada — solo para uso interno de este módulo.

---

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
```

Esta es la función que FastAPI llamará automáticamente en cada request a los endpoints protegidos. El parámetro `Depends(security)` le dice a FastAPI: "antes de llamar a esta función, ejecuta `security` y pásame el resultado".

El flujo es:
```
Request llega → security extrae el token → get_current_user recibe el token → verifica → devuelve el usuario
```

---

```python
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
```

Paso a paso:
1. `credentials.credentials` — el token JWT (el string después de "Bearer ")
2. `get_signing_key_from_jwt(token)` — lee el `kid` del header del JWT, lo busca en el JWKS descargado y devuelve la clave pública correspondiente
3. `jwt.decode(...)` — verifica tres cosas a la vez:
   - **La firma:** usa la clave pública RSA para confirmar que el token fue firmado por Supabase y no fue modificado
   - **La expiración:** los tokens tienen un campo `exp` (timestamp de expiración). Si ya pasó, falla
   - **El audience:** `"authenticated"` es el valor que Supabase pone en tokens de usuarios logueados. Verificarlo previene que alguien use un token de otro sistema
4. Si todo pasa, devuelve el payload — un dict con el ID del usuario, email, rol, etc.

---

```python
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
```

Dos tipos de fallo distintos con el mismo status code (401), pero mensajes diferentes:

- `ExpiredSignatureError`: el token era válido pero ya expiró. Los tokens de Supabase duran por defecto 1 hora. El frontend debe hacer refresh antes de que expire.
- `InvalidTokenError`: el token está malformado, fue firmado con otra clave, o el audience no coincide. Suele indicar un ataque o un bug en el frontend.

**¿Por qué 401 y no 403?**

| Status | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| `401 Unauthorized` | No sé quién eres | Token inválido, expirado, o ausente |
| `403 Forbidden` | Sé quién eres, pero no puedes hacer esto | Usuario autenticado sin permisos suficientes |

Un token inválido = no podemos identificar al usuario → 401. Si en el futuro tuviéramos roles (admin vs. instructor) y un instructor intentara acceder a algo de admin, ese sería un 403.

---

## 4. `app/students/router.py` — Protección de todos los endpoints

**Qué cambió:**
```python
# ANTES
from fastapi import APIRouter, HTTPException, status

router = APIRouter()

# DESPUÉS
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])
```

Un cambio de una línea que protege *toda* la API de students.

**¿Por qué en el router y no en cada endpoint?**

Alternativa ingenua:
```python
@router.get("/", dependencies=[Depends(get_current_user)])
def list_students(): ...

@router.post("/", dependencies=[Depends(get_current_user)])
def create_student(): ...

@router.get("/{id}", dependencies=[Depends(get_current_user)])
def get_student(): ...

# ... repetir en cada endpoint
```

El problema con esto no es solo que es verboso — es que es **inseguro por defecto**. Si mañana agregas un endpoint nuevo y olvidas el `Depends(get_current_user)`, ese endpoint queda expuesto sin autenticación. FastAPI no te avisa. Los tests podrían pasar. El error solo lo encontrarías cuando alguien lo explote.

Con `dependencies` en el `APIRouter`, es imposible olvidarlo — cualquier endpoint nuevo hereda la protección automáticamente. La seguridad está en el punto más alto posible (el router), no dispersa por cada función.

---

## 5. `.env.example` — Nueva variable documentada

**Qué cambió:**
```bash
# ANTES
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DESPUÉS
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json
```

El `.env.example` es el "mapa" de configuración del proyecto. Cada variable que `config.py` requiere sin valor por defecto debe aparecer aquí — de lo contrario, alguien que clone el repo no sabrá qué configurar hasta que la app explote al arrancar.

El comentario en el archivo explica de dónde viene la URL:
```bash
# Supabase publica las claves públicas aquí para verificar JWTs
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json
```

---

## Resumen: el flujo completo de autenticación

```
Angular
  │
  │  1. Login con email/contraseña → Supabase devuelve JWT
  │
  │  2. Angular guarda el JWT y lo adjunta en cada request:
  │     Authorization: Bearer eyJhbGci...
  │
  ▼
FastAPI
  │
  ├── HTTPBearer          → extrae el token del header Authorization
  │
  ├── get_current_user()
  │     ├── PyJWKClient   → busca la clave pública en Supabase JWKS (cacheado)
  │     └── jwt.decode()  → verifica firma RSA + expiración + audience
  │
  ├── Si falla → 401 Unauthorized (token inválido o expirado)
  │
  └── Si pasa → el endpoint recibe el request y responde normalmente
                (el payload del JWT está disponible si lo necesitas)
```

**El resultado:** La API ahora tiene dos capas de seguridad:
1. **Red:** solo acepta requests con un token JWT válido de Supabase
2. **Base de datos:** las queries usan la service role key, que solo vive en el servidor

Nadie puede leer ni modificar datos de tu gimnasio sin antes autenticarse como usuario de tu aplicación.
