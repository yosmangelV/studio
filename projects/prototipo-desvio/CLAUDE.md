# Prototipo de desvío

Fuente de verdad: `docs/spec-prototipo-minimo.md` (qué y por qué) y `docs/spec-tecnico-prototipo.md` (cómo).

- Godot 4, GDScript, sin plugins. Prototipo desechable. No aplican las reglas de Angular ni del design system de la raíz del monorepo.
- Respeta la sección 8 de la especificación técnica sin excepciones: sin arte, sonido, menús, cámara, vida del monstruo, físicas en el proyectil, balance definitivo ni aleatoriedad.
- Si una decisión afecta al feel y no está resuelta en la especificación ni aquí, para y pregunta.
- Todos los números viven en `scripts/config.gd`.

## Decisiones tomadas por el autor (amplían la especificación)

- **Banda de profundidad**: el monstruo se mueve en x e y entre `BANDA_ALTA_Y` (base de los edificios) y `SUELO_Y`. Las balizas caen en `SUELO_Y`; por ahí pasa bajo los edificios sin tocarlos.
- **Objetivo por defecto**: en AVANZAR va al edificio intacto más cercano, también si ya ha cruzado la ciudad. A la contención solo se le lleva con balizas.
- **Sliders**: ángulo 0–180° y potencia 0–100, paso 1.
- **Reinicio**: R siempre; el toque solo con la partida terminada.

## Comandos

Desde la raíz del monorepo, con `godot` en el PATH o `GODOT_BIN` definido:

```bash
npm run desvio:editor   # Abre el proyecto en el editor
npm run desvio:jugar    # Lanza el juego
npm run desvio:test     # Comprueba los criterios de la sección 7 en headless
```
