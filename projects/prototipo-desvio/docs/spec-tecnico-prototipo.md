# Especificación técnica: prototipo de desvío

Documento de implementación. Acompaña a `spec-prototipo-minimo.md`, que define el qué y el por qué. Este define el cómo.

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
prototipo-desvio/
  project.godot
  CLAUDE.md
  escenas/
    principal.tscn
    monstruo.tscn
    baliza.tscn
    proyectil.tscn
    edificio.tscn
  scripts/
    principal.gd
    monstruo.gd
    baliza.gd
    proyectil.gd
    edificio.gd
    lanzador.gd
    panel_depuracion.gd
    registro.gd
    config.gd
  registros/
    .gitkeep
```

## 3. Escena principal

Árbol de nodos de `principal.tscn`:

```
Principal (Node2D)              principal.gd
  Suelo (StaticBody2D)
  ZonaContencion (Area2D)
  Edificios (Node2D)
    Edificio x3 (instancias)
  Monstruo (instancia)
  Lanzador (Node2D)             lanzador.gd
    GuiaTrayectoria (Line2D)
  Proyectiles (Node2D)
  Balizas (Node2D)
  Interfaz (CanvasLayer)
    BarraIntegridad (ProgressBar)
    SliderAngulo (HSlider)
    SliderPotencia (HSlider)
    SelectorArma (dos Button)
    BotonLanzar (Button)
    PanelDepuracion (Panel)     panel_depuracion.gd
```

`Proyectiles` y `Balizas` son contenedores vacíos donde se instancian los nodos en tiempo de ejecución.

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

Expone cada variable como propiedad con setter que emite `valor_cambiado(nombre, valor)` para que el panel de depuración y los sistemas afectados reaccionen en caliente.

### 5.2 `monstruo.gd`

Nodo raíz `Area2D` (no `CharacterBody2D`: el movimiento es manual y no se quiere resolución de colisiones del motor).

Estado interno:

```
enum Estado { AVANZAR, ATRAIDO }
var estado: Estado
var rumbo: Vector2          # normalizado
var baliza_objetivo: Node   # null en AVANZAR
var frenado_restante: float # segundos, 0 si no está frenado
```

`Frenado` no es un estado del enum: es un modificador que convive con los otros dos y solo afecta a la velocidad.

Lógica por frame:

1. Calcular `velocidad_actual = config.velocidad_monstruo * (config.fuerza_frenado if frenado_restante > 0 else 1.0)`.
2. Decrementar `frenado_restante`.
3. Determinar rumbo deseado: hacia `baliza_objetivo` si está en ATRAIDO, hacia la ciudad (izquierda a derecha según de dónde venga) si está en AVANZAR.
4. Rotar `rumbo` hacia el rumbo deseado a un máximo de `config.giro_monstruo` grados por segundo. El giro es gradual, nunca instantáneo.
5. Mover la posición según `rumbo * velocidad_actual * delta`.

Transiciones:

- AVANZAR a ATRAIDO: hay al menos una baliza activa cuya distancia al monstruo es menor que `config.radio_baliza`. Se elige la más cercana.
- ATRAIDO a ATRAIDO (cambio de objetivo): si aparece otra baliza más cercana, se reasigna el objetivo.
- ATRAIDO a AVANZAR: el monstruo alcanza la baliza. La baliza se destruye. Si en ese instante hay otra baliza dentro del radio, se pasa directamente a ATRAIDO con ese nuevo objetivo; si no, a AVANZAR.

Una baliza que cae fuera del radio no produce ninguna transición. El fallo tiene consecuencia.

El monstruo no tiene vida ni recibe daño. No implementar barra de vida ni lógica de impacto destructivo sobre él.

Señales: `baliza_alcanzada(baliza)`, `edificio_golpeado(edificio)`, `contencion_alcanzada()`.

### 5.3 `proyectil.gd`

Integración manual, determinista. No usar `RigidBody2D` ni el motor de físicas.

```
var posicion: Vector2
var velocidad: Vector2
```

Por frame: `velocidad.y += config.gravedad_proyectil * delta`, luego `posicion += velocidad * delta`.

Determinismo: el mismo par (ángulo, potencia) produce siempre la misma trayectoria. Usar `_physics_process` con paso fijo, no `_process`. No introducir aleatoriedad en ningún punto.

Velocidad inicial: `Vector2(cos(-angulo), sin(-angulo)) * potencia * config.escala_potencia`, con el ángulo en radianes medido desde la horizontal.

Dos tipos, diferenciados por un enum `Tipo { BALIZA, ESPUMA }`:

- BALIZA: detecta colisión con el suelo. Al impactar, instancia una baliza en ese punto y se destruye.
- ESPUMA: detecta colisión con el monstruo. Al impactar, aplica `frenado_restante = config.duracion_frenado` al monstruo y se destruye. Si toca el suelo sin impactar, simplemente se destruye sin efecto.

Ambos se destruyen al salir de los límites del mundo.

### 5.4 `baliza.gd`

> Sustituida tras la segunda prueba: la baliza tiene duración y su atracción depende de la distancia. Ver `CLAUDE.md`.

`Area2D` en la posición de impacto. Permanece activa hasta que el monstruo la alcanza y la destruye, o hasta agotar `config.duracion_baliza`, lo que ocurra primero. Es un recurso consumible: una baliza, un desvío como máximo.

Atrae al 100 % de la velocidad del monstruo en el centro y a `config.atraccion_minima` en el borde del radio, de forma lineal.

Dibuja un círculo de radio `config.radio_baliza` con relleno translúcido, para que el jugador vea su alcance. Los anillos concéntricos indican que atrae más cerca del centro, y su opacidad baja a medida que se agota. Esto es deliberado: el riesgo debe ser calculable, no opaco.

### 5.5 `lanzador.gd`

Lee los dos sliders y el arma seleccionada. Al pulsar lanzar, instancia el proyectil correspondiente si ha pasado `config.recarga` desde el último disparo.

**Guía corta de trayectoria**: un `Line2D` que dibuja los primeros `config.longitud_guia` píxeles del arco, calculados con la misma integración que el proyectil real. Se actualiza en cuanto cambia cualquiera de los sliders. No dibuja la parábola completa ni marca el punto de impacto.

### 5.6 `edificio.gd`

`Area2D` estático. Al recibir `edificio_golpeado`, se marca como destruido (cambia de color, deja de colisionar) y notifica a `principal.gd` para restar `config.dano_edificio` a la integridad.

Un edificio destruido no vuelve a restar integridad.

### 5.7 `principal.gd`

Orquesta la partida. Mantiene `integridad` (0 a 100). Conecta señales. Resuelve victoria y derrota:

- Victoria: `contencion_alcanzada()`.
- Derrota: `integridad <= 0` o ningún edificio intacto.

El borde izquierdo es la zona de contención: tocarla da la victoria. Ver `CLAUDE.md`.

Reinicio inmediato con tecla R o toque en pantalla. Sin pantalla intermedia: recarga la escena y escribe el registro del intento.

### 5.8 `panel_depuracion.gd`

Panel plegable con un control por cada variable de `config.gd`. Cada cambio se aplica en caliente, sin reiniciar la escena ni recompilar. Visible con una tecla (F1).

Es la pieza más importante del prototipo después de la mecánica. Si ajustar un número cuesta más de tres segundos, el prototipo ha fallado en su propósito.

### 5.9 `registro.gd`

Singleton (autoload). Escribe en `user://registros/sesion_<timestamp>.csv`, texto plano, una fila por intento:

```
id_sesion,n_intento,duracion_s,resultado,integridad_final,disparos_baliza,disparos_espuma,reinicio_tras
```

- `resultado`: `victoria` o `derrota`.
- `reinicio_tras`: `victoria`, `derrota` o `vacio` para el primer intento.

Sin red, sin analítica, sin cuentas. El dato clave es el encadenamiento de intentos tras derrota.

## 6. Variables de ajuste

Todas en `config.gd`. Los valores de arranque son **provisionales y deliberadamente aproximados**: existen para que el juego arranque, no como propuesta de balance.

| Variable | Tipo | Arranque provisional |
|---|---|---|
| `velocidad_monstruo` | float | 40.0 |
| `radio_baliza` | float | 250.0 |
| `giro_monstruo` | float (grados/s) | 90.0 |
| `fuerza_frenado` | float (multiplicador) | 0.4 |
| `duracion_frenado` | float (s) | 3.0 |
| `gravedad_proyectil` | float | 900.0 |
| `escala_potencia` | float | 10.0 |
| `recarga` | float (s) | 1.0 |
| `longitud_guia` | float (px) | 120.0 |
| `dano_edificio` | float | 34.0 |

Método para `radio_baliza`: empezar alto e ir bajando hasta que la mecánica falle. El punto de ruptura aparece antes que subiendo desde cero.

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
