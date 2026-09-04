# Arquitectura del proyecto

## Stack

- **NestJS** — framework de Node.js que estructura la app en módulos, similar a Angular pero para backend
- **Mongoose** — librería que conecta Node.js con MongoDB y permite definir schemas con tipado
- **MongoDB** — base de datos NoSQL orientada a documentos (en vez de tablas, trabaja con colecciones de objetos JSON)

---

## Estructura de carpetas

```
src/
├── app.module.ts           ← raíz de la app, conecta todo
├── main.ts                 ← punto de entrada, arranca el servidor
└── messages/               ← módulo de mensajes (toda la lógica de esta entidad)
    ├── messages.module.ts
    ├── messages.controller.ts
    ├── messages.service.ts
    ├── schemas/
    │   └── message.schema.ts
    └── dto/
        └── message-response.dto.ts

scripts/
└── seed.ts                 ← script para poblar la BD con datos de demo
```

---

## Qué hace cada pieza

### `main.ts`
Arranca el servidor HTTP en el puerto definido en `.env`. No tiene lógica de negocio.

### `app.module.ts`
El módulo raíz. Aquí se configuran dos cosas globales:
- La conexión a MongoDB (URI + nombre de la BD `announcement`)
- Qué módulos de la app están activos (`MessagesModule`)

### `message.schema.ts`
Define la estructura de los documentos en la colección `messages` de MongoDB.

```
Message {
  code          → clave única que identifica cada mensaje (ej: "DEMO-SPECIAL")
  audienceType  → clasifica a quién va dirigido (special / friends / family)
  recipientName → nombre de la persona o grupo (puede ser null)
  isActive      → permite desactivar un mensaje sin borrarlo
  slides        → array de pantallas que componen el mensaje
}

Slide {
  title   → texto principal arriba
  body    → mensaje más largo, va al lado de la imagen si la hay
  image?  → URL de imagen (opcional; si no hay, el frontend adapta el layout)
  footer  → mensaje final / firma
}
```

Mongoose usa este schema para saber qué guardar y cómo validarlo antes de escribir en la BD.

### `messages.service.ts`
Contiene la lógica de negocio. Es el único sitio que habla con la BD.
Actualmente tiene un método: `findByCode(code)`, que:
1. Busca el documento por código (en mayúsculas)
2. Lanza 404 si no existe
3. Lanza 410 Gone si `isActive` es false
4. Devuelve el mensaje formateado como `MessageResponseDto`

### `messages.controller.ts`
Expone los endpoints HTTP. Recibe la petición, llama al service y devuelve la respuesta.
Actualmente tiene un endpoint:
```
GET /messages/:code
```
El controller no tiene lógica — solo delega al service.

### `message-response.dto.ts`
DTO (Data Transfer Object): define exactamente qué campos se devuelven en la respuesta de la API.
Actúa como contrato entre el backend y quien consume la API. Si no está en el DTO, no sale en la respuesta aunque esté en la BD.

---

## Flujo de una petición

```
Cliente → GET /messages/DEMO-SPECIAL
           ↓
        MessagesController
        (recibe el param :code)
           ↓
        MessagesService.findByCode('DEMO-SPECIAL')
        (busca en MongoDB, valida isActive)
           ↓
        MessageResponseDto
        (filtra los campos que se devuelven)
           ↓
        { id, code, audienceType, recipientName, slides }
```

---

## Seeds vs Migraciones

Son conceptos distintos:

| | Seeds | Migraciones |
|---|---|---|
| **Para qué sirven** | Poblar la BD con datos iniciales o de demo | Cambiar la estructura del schema (añadir/quitar campos) |
| **Cuándo se ejecutan** | Una vez al inicio o cuando quieres resetear datos de prueba | Cada vez que cambia el modelo de datos |
| **Son destructivos** | Sí, borran y reinsertan los datos de demo | No, alteran documentos existentes |
| **En este proyecto** | `scripts/seed.ts` | No hay (Mongoose no los gestiona automáticamente) |

Para ejecutar el seed:
```bash
npx ts-node scripts/seed.ts
```

Esto conecta a MongoDB, borra los tres mensajes de demo (DEMO-SPECIAL, DEMO-FRIENDS, DEMO-FAMILY) y los vuelve a insertar con la estructura actual.
