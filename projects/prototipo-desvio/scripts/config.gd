extends Node
## Autoload. Unico sitio donde viven los numeros (seccion 5.1).
## Todos los valores de ajuste son PROVISIONALES: existen para que el juego
## arranque, no son una propuesta de balance. El ajuste se hace jugando.

signal valor_cambiado(nombre: String, valor: float)

# --- Geometria fija (no se ajusta en el panel) ---
const SUELO_Y := 600.0
const MUNDO := Rect2(0.0, 0.0, 1280.0, 720.0)
const ENTRADA_X := 320.0
const LANZADOR_X := 1180.0
const BOCA_LANZADOR := Vector2(0.0, -40.0)
const CONTENCION_X_MAX := 110.0
const EDIFICIOS_X: Array[float] = [800.0, 930.0, 1060.0]
const TAMANO_MONSTRUO := Vector2(90.0, 110.0)
const TAMANO_EDIFICIO := Vector2(90.0, 110.0)
const RADIO_NUCLEO_BALIZA := 10.0
const RADIO_PROYECTIL := 6.0
const INTEGRIDAD_MAX := 100.0
const ANGULO_INICIAL := 135.0
const POTENCIA_INICIAL := 70.0
const PASO_FIJO := 1.0 / 60.0

# --- Paleta reducida ---
const COLOR_FONDO := Color("#20242c")
const COLOR_SUELO := Color("#14161b")
const COLOR_CONTENCION := Color("#2f7d5b")
const COLOR_EDIFICIO := Color("#c9ced8")
const COLOR_DESTRUIDO := Color("#4d535f")
const COLOR_MONSTRUO := Color("#d9503f")
const COLOR_BALIZA := Color("#f0a13a")
const COLOR_ESPUMA := Color("#6fc4e8")
const COLOR_LANZADOR := Color("#c9ced8")

## Metadatos del panel de depuracion: rangos de edicion, no recomendaciones.
const AJUSTES: Array[Dictionary] = [
	{"nombre": "velocidad_monstruo", "min": 0.0, "max": 300.0, "paso": 1.0},
	{"nombre": "radio_baliza", "min": 0.0, "max": 1000.0, "paso": 5.0},
	{"nombre": "giro_monstruo", "min": 1.0, "max": 720.0, "paso": 1.0},
	{"nombre": "fuerza_frenado", "min": 0.0, "max": 1.0, "paso": 0.01},
	{"nombre": "duracion_frenado", "min": 0.0, "max": 20.0, "paso": 0.1},
	{"nombre": "gravedad_proyectil", "min": 0.0, "max": 3000.0, "paso": 10.0},
	{"nombre": "escala_potencia", "min": 0.0, "max": 40.0, "paso": 0.5},
	{"nombre": "recarga", "min": 0.0, "max": 10.0, "paso": 0.1},
	{"nombre": "longitud_guia", "min": 0.0, "max": 1000.0, "paso": 5.0},
	{"nombre": "dano_edificio", "min": 0.0, "max": 100.0, "paso": 1.0},
]

var velocidad_monstruo: float = 20.0:
	set(v):
		velocidad_monstruo = v
		valor_cambiado.emit("velocidad_monstruo", v)
var radio_baliza: float = 250.0:
	set(v):
		radio_baliza = v
		valor_cambiado.emit("radio_baliza", v)
var giro_monstruo: float = 90.0:
	set(v):
		giro_monstruo = v
		valor_cambiado.emit("giro_monstruo", v)
var fuerza_frenado: float = 0.4:
	set(v):
		fuerza_frenado = v
		valor_cambiado.emit("fuerza_frenado", v)
var duracion_frenado: float = 3.0:
	set(v):
		duracion_frenado = v
		valor_cambiado.emit("duracion_frenado", v)
var gravedad_proyectil: float = 900.0:
	set(v):
		gravedad_proyectil = v
		valor_cambiado.emit("gravedad_proyectil", v)
var escala_potencia: float = 10.0:
	set(v):
		escala_potencia = v
		valor_cambiado.emit("escala_potencia", v)
var recarga: float = 1.0:
	set(v):
		recarga = v
		valor_cambiado.emit("recarga", v)
var longitud_guia: float = 120.0:
	set(v):
		longitud_guia = v
		valor_cambiado.emit("longitud_guia", v)
var dano_edificio: float = 34.0:
	set(v):
		dano_edificio = v
		valor_cambiado.emit("dano_edificio", v)
