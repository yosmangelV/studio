# Kids Anxiety App — Spec

## Descripción

Aplicación móvil gamificada para ayudar a niños a manejar la ansiedad. Desarrollada en colaboración con una psicóloga (cuñada del fundador) que definirá las técnicas clínicas y el marco terapéutico. La app traduce técnicas psicológicas probadas a un formato accesible y atractivo para niños.

## Colaboración requerida

**Psicóloga**: definición clínica completa antes de poder diseñar o desarrollar. Ver sección "Qué necesitamos de la psicóloga" abajo.

## Qué necesitamos de la psicóloga

Documento Word/Notion con estas secciones (no necesita saber nada de tech):

1. **Target exacto** — rango de edad (6-8, 9-12, adolescentes — son experiencias completamente distintas)
2. **Tipos de ansiedad** a abordar — escolar, social, separación, ansiedad generalizada, etc.
3. **Técnicas concretas** que usaría en consulta para cada situación:
   - Respiración diafragmática
   - Grounding 5-4-3-2-1
   - Reestructuración cognitiva
   - Visualización
   - Otras que considere relevantes
4. **Flujo de una sesión** — cuando un niño llega con ansiedad, ¿qué pasos sigue? Eso es el UX de la app.
5. **Criterios de escalado** — cuándo la app debe decir "habla con un adulto o un profesional"
6. **Qué NO hacer** — contraindicaciones, errores comunes en apps de salud mental para niños

## Formato del entregable

No es un documento técnico. Es la psicóloga describiendo su proceso clínico como si le explicara a un colega. Con eso podemos diseñar la arquitectura de la app.

## Concepto de producto

- Formato tipo juego, no app clínica — tiene que ser atractivo para niños
- Técnicas psicológicas reales detrás de cada mecánica
- No reemplaza terapia — es una herramienta complementaria de apoyo

## Stack (por definir — pendiente de spec clínica)

- **Frontend**: Angular + Ionic + Capacitor (móvil)
- **Plataformas**: iOS + Android
- **Backend**: Node.js
- **AI**: posiblemente Claude API para personalización de respuestas

## Estado

- [ ] Definición clínica de la psicóloga ← **bloqueado aquí**
- [ ] Spec del producto
- [ ] Arquitectura técnica
- [ ] Setup del proyecto
- [ ] MVP
