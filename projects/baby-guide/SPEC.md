# Baby Guide App — Spec

## Descripción

Aplicación móvil y web que funciona como el "manual que viene con el bebé". Diseñada para padres primerizos que necesitan respuestas rápidas en situaciones de estrés (3am, bebé llorando, una mano libre). Combina contenido curado con IA para dar respuestas verificadas y contextuales.

## Caso de Uso Principal

> "Bebé llorando, 3am, cerebro frito — necesito una respuesta en 30 segundos."

No es para prepararse con tiempo, es para el momento exacto en que no sabes qué hacer.

## UX / Navegación

### Home contextual
- Sabe la edad/semana del bebé → muestra info relevante para ese momento del desarrollo
- Ejemplo: "Semana 3 — es normal que llore más por la tarde, aquí te explicamos por qué"

### Botones de pánico (contextuales por hora del día)
- **3am**: "No duerme", "Llora sin parar", "Tiene gases"
- **10am**: "No quiere comer", "Tummy time", "Muy irritable"
- **7pm**: "Rutina de baño", "Cómo lo duermo", "Sobreestimulado"
- Acceso inmediato, sin navegar

### Búsqueda
- Siempre disponible como fallback
- Para cuando sabes lo que buscas ("cómo hacer que eructe")

## Contenido

### Estrategia híbrida
1. **Contenido curado** — artículos, videos, técnicas paso a paso seleccionados manualmente. Confiable porque lo elegiste tú.
2. **AI-asistido** — Claude API con fuentes pediátricas verificadas para preguntas no cubiertas. Información contrastada, nunca inventada.

La calidad de la información es crítica — es sobre un bebé.

## Tracking (opcional)

El usuario puede registrar: tomas, sueño, pañales.

- La app funciona sin tracking
- Con tracking → sugerencias más precisas ("Han pasado 3h desde la última toma, probablemente tiene hambre")
- Completamente opt-in, sin fricción obligatoria

## Stack

- **Frontend**: Angular + Ionic + Capacitor
- **Plataformas**: iOS (App Store) + Android (Play Store) + Web — mismo codebase
- **Backend**: Node.js
- **AI**: Claude API (fuentes pediátricas verificadas)
- **Base de datos**: por definir

## Decisiones Técnicas Pendientes

- [ ] Base de datos (Supabase, Firebase, PostgreSQL?)
- [ ] Auth (cuenta propia o Google/Apple login?)
- [ ] ¿Compartir cuenta con pareja?
- [ ] Estrategia de contenido curado (CMS o archivos estáticos?)
- [ ] Cómo verificar fuentes en las respuestas AI

## Secciones de contenido (borrador)

- Desarrollo por semana/mes
- Sueño (técnicas, rutinas, señales de cansancio)
- Alimentación (lactancia, fórmula, introducción de sólidos)
- Llanto (diagnóstico, causas, técnicas de calma)
- Salud (señales de alarma, cuándo llamar al médico)
- Hitos del desarrollo

## Estado

- [x] Spec del producto (5 rondas de feedback)
- [ ] Arquitectura técnica
- [ ] Setup del proyecto
- [ ] MVP
