# Prototipo mínimo: desvío de monstruo

Estado: listo para desarrollo. Nada de lo que hay aquí es definitivo para el juego final.

## 1. Objetivo

Este prototipo existe para responder a una sola pregunta:

> ¿Es más satisfactorio mover al monstruo que dañarlo?

Si la respuesta es no, el concepto del juego no funciona y hay que replantearlo antes de invertir en arte, contenido o arquitectura. Todo lo que no ayude a responder esa pregunta queda fuera del alcance.

El prototipo es desechable por diseño. No es la base del juego final.

## 2. Encuadre narrativo

Este prototipo corresponde al nivel 3 (Desvío) de la estructura de 5 fases. El objetivo nunca es que el monstruo desaparezca, sino sacarlo de la zona urbana hacia terreno abierto donde el equipo pueda contenerlo.

Esto importa para la condición de victoria: el borde derecho del escenario es la **zona de contención**, el punto de entrega, no una huida. Por eso no hace falta vida del monstruo ni mecánica de captura en el prototipo.

## 3. Alcance

### Dentro

- Un único nivel, todo visible en una sola pantalla, sin cámara ni scroll.
- Escenario plano con tres edificios y una zona de contención en el extremo opuesto.
- Un monstruo con máquina de estados de tres estados.
- Dos proyectiles: baliza térmica y espuma fría.
- Control por dos sliders: ángulo y potencia.
- Guía corta de trayectoria.
- Barra de integridad de la ciudad.
- Condición de victoria y de derrota.
- Panel de depuración con todas las variables de ajuste editables en tiempo real.
- Registro local de sesiones.

### Fuera

Queda explícitamente fuera, aunque sea tentador:

- Arte, sprites, pixel art de cualquier tipo. Formas geométricas de color plano, paleta reducida.
- Sonido y música.
- Menús, pantallas de título, guardado de partida.
- Scroll o cámara móvil. Anotado como idea para el nivel 1 (Aviso) del juego real, donde el monstruo aparece lejos y la tensión del descubrimiento sí aporta. En el prototipo rompe la lectura espacial que hay que medir.
- Vida del monstruo y daño al monstruo. Reintroducirlo convierte el prototipo en artillería clásica y anula su pregunta.
- Mecánica de captura.
- Los ejes de comportamiento destrucción, reacción y especial.
- El bucle de contención y el laboratorio.
- La progresión de armas y el desbloqueo de mejoras.
- La estructura completa de 5 fases.
- Cualquier monstruo que no sea el Sujeto 01.

## 4. Mecánica

### Escenario

Vista lateral 2D, todo el escenario visible de una vez. De izquierda a derecha:

1. Zona de entrada del monstruo (borde izquierdo).
2. Zona urbana con tres edificios.
3. Zona de contención (borde derecho).

El lanzador está en posición fija.

Dimensiones a fijar en la primera sesión, pero con dos restricciones firmes: todo cabe en una pantalla de móvil en horizontal sin scroll, y el monstruo mide aproximadamente lo mismo que un edificio para que la amenaza se lea de inmediato.

### Monstruo

Un rectángulo. Avanza a velocidad constante hacia la zona urbana. No tiene vida y no recibe daño. Máquina de estados:

| Estado | Entrada | Comportamiento | Salida |
|---|---|---|---|
| Avanzar | Por defecto | Se mueve hacia la ciudad a velocidad base | Una baliza activa entra en su radio |
| Atraído | Hay una baliza activa dentro de su radio | Cambia el rumbo hacia la baliza más cercana | Llega a la baliza y la destruye |
| Frenado | Impacto de espuma fría | Velocidad reducida durante un tiempo, mantiene el rumbo | Se agota la duración |

El estado Frenado se combina con los otros dos: afecta a la velocidad, no al rumbo.

Al destruir una baliza, el monstruo retoma rumbo hacia la ciudad, salvo que otra baliza activa esté dentro de su radio en ese momento.

Si una baliza cae fuera del radio del monstruo, no ocurre nada. El fallo tiene consecuencia.

El giro al entrar en estado Atraído es gradual, no instantáneo, con una velocidad de giro ajustable. Un giro instantáneo hace que el monstruo parezca teledirigido y mata la sensación de estar guiando a una criatura.

### Proyectiles

Trayectoria parabólica con integración manual, no con el motor de físicas. Determinista: el mismo ángulo y la misma potencia producen siempre la misma trayectoria.

**Baliza térmica.** Al impactar con el suelo crea un foco de calor en ese punto, con un radio de atracción. Si el monstruo está dentro del radio, va hacia ella. Al llegar, la destruye y retoma su camino. Es un recurso consumible: una baliza, un desvío. Varias balizas pueden coexistir; el monstruo atiende a la más cercana.

**Espuma fría.** Al impactar con el monstruo reduce su velocidad durante un tiempo fijo. No afecta al rumbo. Si falla, no hace nada.

Munición ilimitada en el prototipo. Hay un tiempo de recarga entre disparos.

### Control

Dos sliders, ángulo y potencia, más un botón de lanzar. Decisión deliberada frente al arrastre tipo tirachinas: los ejes numéricos dan sensación de instrumento de precisión y refuerzan la fantasía de equipo de contingencia.

Contrapartida asumida: el gesto es menos directo que un arrastre, así que la lectura del resultado debe ser inmediata.

**Guía corta de trayectoria.** Al ajustar los sliders se dibujan solo los primeros metros del arco saliendo del lanzador, un tramo corto de puntos, no la parábola completa hasta el impacto. Confirma hacia dónde apuntas sin revelar dónde caerá. Mantiene la puntería como habilidad.

### Edificios

Tres rectángulos estáticos. Si el monstruo entra en contacto con uno, el edificio se destruye y la integridad de la ciudad baja una cantidad fija.

### Condiciones

- **Victoria**: el monstruo alcanza la zona de contención en el borde derecho.
- **Derrota**: la integridad de la ciudad llega a cero.
- **Borde izquierdo**: no es salida. Si el monstruo llega ahí, retoma rumbo hacia la ciudad.

Reinicio inmediato con una tecla o un toque. Sin pantallas intermedias.

## 5. Variables de ajuste

Todas expuestas en el panel de depuración y modificables sin recompilar. El valor del prototipo está en lo rápido que se puedan iterar estos números.

| Variable | Descripción |
|---|---|
| `velocidad_monstruo` | Velocidad base de avance |
| `radio_baliza` | Distancia a la que la baliza atrae al monstruo |
| `giro_monstruo` | Velocidad de cambio de rumbo al ser atraído |
| `fuerza_frenado` | Multiplicador de velocidad al recibir espuma |
| `duracion_frenado` | Segundos que dura el frenado |
| `gravedad_proyectil` | Caída del proyectil |
| `recarga` | Segundos entre disparos |
| `longitud_guia` | Metros de arco visibles en la guía corta |
| `dano_edificio` | Integridad que se pierde por edificio destruido |

Los valores iniciales se fijan en la primera sesión de ajuste, no antes. Ponerlos ahora sería inventar.

Nota de método para `radio_baliza`: empezar con un valor exagerado e irlo bajando hasta que falle, en lugar de subirlo desde cero. El punto de ruptura se encuentra antes.

## 6. Instrumentación

Registro local en archivo de texto plano. Sin analítica, sin servidores, sin cuentas.

Por cada intento se guarda:

- Identificador de sesión.
- Número de intento dentro de la sesión.
- Duración del intento.
- Resultado: victoria o derrota.
- Integridad final de la ciudad.
- Disparos de baliza y disparos de espuma.
- Si el reinicio vino tras victoria o tras derrota.

El dato que más importa es el encadenamiento de intentos tras derrota, porque es lo que convierte el criterio 2 de validación en una medida y no en una impresión.

## 7. Criterios de validación

La validación no es una opinión propia. Se entrega el prototipo a tres personas sin contexto previo, con una única instrucción: "saca al bicho de la ciudad".

Funciona si:

1. Entienden la mecánica de la baliza sin tutorial ni explicación adicional.
2. Repiten el nivel por voluntad propia después de fallar, sin que se les pida. El registro lo confirma.
3. En algún momento verbalizan intención espacial, del tipo "si lo pongo ahí, lo llevo hacia allá".

No funciona si:

- Tienen que preguntar cómo se juega. El problema entonces no es la ejecución, es el concepto.
- Intentan disparar al monstruo para dañarlo y se frustran al ver que no pasa nada. Indica que la lectura por defecto sigue siendo artillería clásica.
- Lo resuelven a la primera sin pensar. Indica que falta tensión.

## 8. Notas técnicas

- Motor: Godot 4, nodos 2D.
- La física del proyectil se implementa manualmente. El motor de físicas introduce variabilidad que impide que el jugador aprenda a predecir trayectorias, y la predictibilidad es parte de la tesis del juego.
- El monstruo se implementa como máquina de estados explícita, no con condicionales dispersos, porque los ejes de comportamiento futuros se construirán sobre esa estructura.
- Paleta reducida y formas planas, autoimpuesto. Protege del riesgo del punto 10.
- Probar desde el principio en pantalla de móvil, no solo en el editor de escritorio. El control por sliders se valida con el dedo, no con el ratón.
- Estimación: un fin de semana de trabajo si no se desvía atención al arte.

## 9. Desarrollo

El prototipo se escribe a mano, sin orquestación de agentes ni monorepo. Son unas quinientas líneas de GDScript sobre un escenario, y el bucle de trabajo real es probar, cambiar un número y volver a probar decenas de veces por sesión. Ese bucle es más rápido en el editor que describiéndolo.

La integración de documento, repositorio y agentes tiene sentido después de validar, y se plantearía así:

- La especificación vive en el propio repositorio como markdown, no en una herramienta externa, para que no se desincronice del código.
- Un `CLAUDE.md` en la raíz apunta a ella y fija las convenciones del proyecto.
- Los agentes se usan para lo estructural y repetitivo: editor de monstruos, definiciones de comportamiento en JSON, balanceo, pipeline de build, tests.
- El código de gameplay sensible al feel sigue siendo manual.

## 10. Riesgo principal

Ponerle arte al prototipo. En cuanto el monstruo tiene cara, cuesta tirarlo a la basura, y este prototipo existe precisamente para poder tirarlo sin coste.

## 11. Siguiente paso tras la validación

Si pasa los criterios: documento de diseño completo, especificación técnica y estructura de proyecto.

Si no los pasa: revisar si el problema está en los valores de ajuste (reiterar sobre el mismo prototipo) o en el concepto (replantear la mecánica central antes de seguir).
