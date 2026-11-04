# Especificación técnica: prototipo de desvío

Documento de implementación. Acompaña a `prototype-spec.md`, que define el qué y el por qué. Este define el cómo.

Destinatario: agente de implementación.

## 0. Reparto de trabajo

**Lo que construye el agente**: estructura del proyecto, escena, máquina de estados, integración del proyectil, sistema de balizas, panel de depuración, registro de sesiones, condiciones de victoria y derrota.

**Lo que NO hace el agente**: fijar los valores de ajuste. Todos los parámetros de la sección 6 se exponen con valores de arranque marcados como provisionales. El ajuste se hace jugando, a mano, y es el objetivo del prototipo.

Si durante la implementación surge una decisión que afecta al feel y no está resuelta aquí, el agente para y pregunta en lugar de elegir.

## 1. Entorno

- Godot 4.x, GDScript.
- Renderizado 2D.
- Resolución base 1280x720, modo de estiramiento `canvas_items`, aspecto `expand`.
- Orientación horizontal.
- Sin dependencias externas. Sin plugins.

## 2. Estructura de archivos

```
diversion-prototype/
  project.godot
  CLAUDE.md
  scenes/
    main.tscn
    monster.tscn
    beacon.tscn
    projectile.tscn
    building.tscn
  scripts/
    main.gd
    monster.gd
    beacon.gd
    projectile.gd
    building.gd
    launcher.gd
    debug_panel.gd
    session_log.gd
    config.gd
  tests/
    acceptance.tscn
    acceptance.gd
  tools/
    godot.mjs
  logs/
    .gitkeep
```

## 3. Escena principal

Árbol de nodos de `main.tscn`:

```
Main (Node2D)                   main.gd
  Ground (StaticBody2D)
  ContainmentZone (Area2D)
  Buildings (Node2D)
    Building x3 (instancias)
  Beacons (Node2D)
  Monster (instancia)
  Launcher (Node2D)             launcher.gd
    TrajectoryGuide (Line2D)
  Projectiles (Node2D)
  UI (CanvasLayer)
    IntegrityBar (ProgressBar)
    ResultLabel (Label)
    AngleLabel, AngleSlider (Label, HSlider)
    PowerLabel, PowerSlider (Label, HSlider)
    WeaponSelector (dos Button)
    FireButton (Button)
    PanelButton (Button)
    DebugPanel (Panel)          debug_panel.gd
```

`Projectiles` y `Beacons` son contenedores vacíos donde se instancian los nodos en tiempo de ejecución.

## 4. Disposición del escenario

> Actualizada tras las primeras pruebas: contención a la izquierda, ciudad y lanzador a la derecha. La fuente de los números es `scripts/config.gd`; ver también `CLAUDE.md`.

Coordenadas en un mundo de 1280 de ancho, suelo a y=600, de izquierda a derecha.

| Elemento | Posición x | Notas |
|---|---|---|
| Zona contención | de 0 a 110 | Area2D que dispara la victoria |
| Entrada del monstruo | 320 | Punto de aparición, fuera de la contención |
| Zona urbana | de 875 a 1225 | Edificios centrados en 920, 1050 y 1180 |
| Lanzador | 1180 | Fijo, sobre el tejado del último edificio |

El monstruo mide aproximadamente lo mismo que un edificio: 90 de ancho por 110 de alto como punto de partida.

Todo visible sin cámara. El nodo de cámara no se añade.

## 5. Módulos

### 5.1 `config.gd`

Singleton (autoload) que centraliza todas las variables de ajuste. Es el único sitio donde viven los números. Ningún otro script define constantes de balance.

Expone cada variable como propiedad con setter que emite `value_changed(name, value)` para que el panel de depuración y los sistemas afectados reaccionen en caliente.

### 5.2 `monster.gd`

Nodo raíz `Area2D` (no `CharacterBody2D`: el movimiento es manual y no se quiere resolución de colisiones del motor).

Estado interno:

```
enum State { ADVANCE, ATTRACTED }
var state: State
var heading: Vector2        # normalizado
var target_beacon: Beacon   # null en ADVANCE
var slow_remaining: float   # segundos, 0 si no está frenado
```

`Slowed` no es un estado del enum: es un modificador que convive con los otros dos y solo afecta a la velocidad.

Lógica por frame:

1. Calcular `speed = Config.monster_speed * (Config.slow_factor if slow_remaining > 0 else 1.0) * attraction_factor`.
2. Decrementar `slow_remaining`.
3. Determinar rumbo deseado: hacia `target_beacon` si está en ATTRACTED, hacia la ciudad (izquierda a derecha según de dónde venga) si está en ADVANCE.
4. Rotar `heading` hacia el rumbo deseado a un máximo de `Config.monster_turn_rate` grados por segundo. El giro es gradual, nunca instantáneo.
5. Mover la posición según `heading * speed * delta`.

Transiciones:

- ADVANCE a ATTRACTED: hay al menos una baliza activa cuya distancia al monstruo es menor que `Config.beacon_radius`. Se elige la más cercana.
- ATTRACTED a ATTRACTED (cambio de objetivo): si aparece otra baliza más cercana, se reasigna el objetivo.
- ATTRACTED a ADVANCE: el monstruo alcanza la baliza. La baliza se destruye. Si en ese instante hay otra baliza dentro del radio, se pasa directamente a ATTRACTED con ese nuevo objetivo; si no, a ADVANCE.

Una baliza que cae fuera del radio no produce ninguna transición. El fallo tiene consecuencia.

El monstruo no tiene vida ni recibe daño. No implementar barra de vida ni lógica de impacto destructivo sobre él.

Señales: `beacon_reached(beacon)`, `building_hit(building)`, `containment_reached()`.

### 5.3 `projectile.gd`

Integración manual, determinista. No usar `RigidBody2D` ni el motor de físicas.

```
var pos: Vector2
var velocity: Vector2
```

Por frame: `velocity.y += Config.projectile_gravity * delta`, luego `pos += velocity * delta`.

Determinismo: el mismo par (ángulo, potencia) produce siempre la misma trayectoria. Usar `_physics_process` con paso fijo, no `_process`. No introducir aleatoriedad en ningún punto.

Velocidad inicial: `Vector2(cos(-angle), sin(-angle)) * power * Config.power_scale`, con el ángulo en radianes medido desde la horizontal.

Dos tipos, diferenciados por un enum `Kind { BEACON, FOAM }`:

- BEACON: detecta colisión con el suelo. Al impactar, instancia una baliza en ese punto y se destruye.
- FOAM: detecta colisión con el monstruo. Al impactar, aplica `slow_remaining = Config.slow_duration` al monstruo y se destruye. Si toca el suelo sin impactar, simplemente se destruye sin efecto.

Ambos se destruyen al salir de los límites del mundo.

### 5.4 `beacon.gd`

> Sustituida tras la segunda prueba: la baliza tiene duración y su atracción depende de la distancia. Ver `CLAUDE.md`.

`Area2D` en la posición de impacto. Permanece activa hasta que el monstruo la alcanza y la destruye, o hasta agotar `Config.beacon_lifetime`, lo que ocurra primero. Es un recurso consumible: una baliza, un desvío como máximo.

Atrae al 100 % de la velocidad del monstruo en el centro y a `Config.min_attraction` en el borde del radio, de forma lineal.

Dibuja un círculo de radio `Config.beacon_radius` con relleno translúcido, para que el jugador vea su alcance. Los anillos concéntricos indican que atrae más cerca del centro, y su opacidad baja a medida que se agota. Esto es deliberado: el riesgo debe ser calculable, no opaco.

### 5.5 `launcher.gd`

Lee los dos sliders y el arma seleccionada. Al pulsar lanzar, instancia el proyectil correspondiente si ha pasado `Config.reload_time` desde el último disparo.

**Guía corta de trayectoria**: un `Line2D` que dibuja los primeros `Config.guide_length` píxeles del arco, calculados con la misma integración que el proyectil real. Se actualiza en cuanto cambia cualquiera de los sliders. No dibuja la parábola completa ni marca el punto de impacto.

### 5.6 `building.gd`

`Area2D` estático. Al recibir `building_hit`, se marca como destruido (cambia de color, deja de colisionar) y notifica a `main.gd` para restar `Config.building_damage` a la integridad.

Un edificio destruido no vuelve a restar integridad.

### 5.7 `main.gd`

Orquesta la partida. Mantiene `integrity` (0 a 100). Conecta señales. Resuelve victoria y derrota:

- Victoria: `containment_reached()`.
- Derrota: `integrity <= 0` o ningún edificio intacto.

El borde izquierdo es la zona de contención: tocarla da la victoria. Ver `CLAUDE.md`.

Reinicio inmediato, sin pantalla intermedia: la tecla R reinicia siempre, y un toque en pantalla solo cuando la partida ha terminado. La fila del registro se escribe al terminar el intento, no al reiniciar.

### 5.8 `debug_panel.gd`

Panel plegable con un control por cada variable de `config.gd`. Cada cambio se aplica en caliente, sin reiniciar la escena ni recompilar. Visible con una tecla (F1).

Es la pieza más importante del prototipo después de la mecánica. Si ajustar un número cuesta más de tres segundos, el prototipo ha fallado en su propósito.

### 5.9 `session_log.gd`

Singleton (autoload). Escribe en `user://logs/session_<timestamp>_<pid>.csv`, texto plano, una fila por intento:

```
session_id,attempt,duration_s,result,final_integrity,beacon_shots,foam_shots,restarted_after
```

- `result`: `win` o `loss`.
- `restarted_after`: `win`, `loss` o `none` para el primer intento.

Sin red, sin analítica, sin cuentas. El dato clave es el encadenamiento de intentos tras derrota.

## 6. Variables de ajuste

Todas en `config.gd`. Los valores de arranque son **provisionales y deliberadamente aproximados**: existen para que el juego arranque, no como propuesta de balance.

Valores actuales tras las primeras sesiones de ajuste, todavía provisionales. Entre paréntesis, el arranque original cuando cambió.

| Variable | Tipo | Valor provisional |
|---|---|---|
| `monster_speed` | float | 20.0 (40.0) |
| `beacon_radius` | float | 249.0 (250.0) |
| `beacon_lifetime` | float (s) | 8.0 (nueva) |
| `min_attraction` | float (fracción) | 0.25 (nueva) |
| `monster_turn_rate` | float (grados/s) | 90.0 |
| `slow_factor` | float (multiplicador) | 0.4 |
| `slow_duration` | float (s) | 3.0 |
| `projectile_gravity` | float | 900.0 |
| `power_scale` | float | 10.0 |
| `reload_time` | float (s) | 1.0 |
| `guide_length` | float (px) | 120.0 |
| `building_damage` | float | 34.0 |

Método para `beacon_radius`: empezar alto e ir bajando hasta que la mecánica falle. El punto de ruptura aparece antes que subiendo desde cero.

## 7. Criterios de aceptación de la implementación

El agente ha terminado cuando:

1. El monstruo avanza hacia la ciudad y destruye edificios al contacto, bajando la integridad.
2. Una baliza lanzada dentro del radio desvía al monstruo, que la alcanza, la destruye y retoma rumbo.
3. Una baliza lanzada fuera del radio no produce ningún efecto.
4. El giro al desviarse es visiblemente gradual.
5. La espuma reduce la velocidad sin cambiar el rumbo.
6. El mismo par (ángulo, potencia) produce siempre la misma trayectoria.
7. La guía muestra solo el tramo inicial del arco, no el punto de impacto.
8. Llegar a la zona de contención da victoria; integridad a cero da derrota.
9. El panel de depuración cambia cualquier variable en caliente.
10. Se escribe una fila de registro por intento.
11. Funciona con el dedo en una pantalla de móvil, no solo con ratón.

El criterio 11 no es opcional. Los sliders con ratón se sienten bien siempre, y eso daría una falsa confirmación justo sobre la decisión de control.

## 8. Lo que el agente no debe hacer

- No añadir sprites, texturas ni pixel art. Formas planas con `draw_rect` y `draw_circle`, paleta de pocos colores.
- No añadir sonido.
- No añadir menús ni pantallas de título.
- No añadir cámara ni scroll.
- No dar vida al monstruo ni implementar daño sobre él.
- No usar el motor de físicas para el proyectil.
- No proponer valores de balance como definitivos.
- No introducir aleatoriedad en ningún sistema.
