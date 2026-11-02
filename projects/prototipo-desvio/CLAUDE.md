# Prototipo de desvío

Fuente de verdad: `docs/spec-prototipo-minimo.md` (qué y por qué) y `docs/spec-tecnico-prototipo.md` (cómo).

- Godot 4, GDScript, sin plugins. Prototipo desechable. No aplican las reglas de Angular ni del design system de la raíz del monorepo.
- Respeta la sección 8 de la especificación técnica sin excepciones: sin arte, sonido, menús, cámara, vida del monstruo, físicas en el proyectil, balance definitivo ni aleatoriedad.
- Si una decisión afecta al feel y no está resuelta en la especificación ni aquí, para y pregunta.
- Todos los números viven en `scripts/config.gd`.

## Decisiones tomadas por el autor (amplían la especificación)

- **Disposición (sustituye a la sección 4)**: de izquierda a derecha, contención, entrada del monstruo, ciudad y lanzador. Todos los números están en `config.gd`.
- **Objetivo**: el monstruo camina sobre el suelo hacia el edificio intacto más cercano, hacia el jugador. Ganar es arrastrarlo con balizas hacia atrás hasta la contención.
- **Entrada**: el monstruo aparece a la derecha de la contención, no a través de ella, para no dar la victoria al entrar.
- **Sliders**: ángulo 0–180° y potencia 0–100, paso 1.
- **Reinicio**: R siempre; el toque solo con la partida terminada.
- **Duración de la baliza (sustituye a la sección 5.4)**: se apaga sola al agotar `duracion_baliza`, si antes no la alcanza el monstruo.
- **Atracción por distancia**: al 100 % de la velocidad en el centro, y a `atraccion_minima` en el borde del radio. Lineal entre ambos.
- **Lanzador**: va sobre el tejado del último edificio. Perder ese edificio es perder el arma, así que no quedar edificios siempre da derrota.
- **Espuma**: el monstruo se pinta del color de la espuma mientras dura el frenado.

## Comandos

Desde la raíz del monorepo, con `godot` en el PATH o `GODOT_BIN` definido:

```bash
npm run desvio:editor   # Abre el proyecto en el editor
npm run desvio:jugar    # Lanza el juego
npm run desvio:test     # Comprueba los criterios de la sección 7 en headless
```
