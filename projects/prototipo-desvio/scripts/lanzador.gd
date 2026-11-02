extends Node2D
## Lee los sliders y el arma, dispara si ha pasado la recarga y dibuja la guia corta.

signal disparo_realizado(tipo: Proyectil.Tipo)

const ESCENA_PROYECTIL := preload("res://escenas/proyectil.tscn")
const MAX_PASOS_GUIA := 600

var arma: Proyectil.Tipo = Proyectil.Tipo.BALIZA
var recarga_restante: float = 0.0

@onready var _guia: Line2D = $GuiaTrayectoria
@onready var _slider_angulo: HSlider = $"../Interfaz/SliderAngulo"
@onready var _slider_potencia: HSlider = $"../Interfaz/SliderPotencia"
@onready var _etiqueta_angulo: Label = $"../Interfaz/EtiquetaAngulo"
@onready var _etiqueta_potencia: Label = $"../Interfaz/EtiquetaPotencia"
@onready var _boton_baliza: Button = $"../Interfaz/SelectorArma/BotonBaliza"
@onready var _boton_espuma: Button = $"../Interfaz/SelectorArma/BotonEspuma"
@onready var _boton_lanzar: Button = $"../Interfaz/BotonLanzar"


func _ready() -> void:
	position = Vector2(Config.LANZADOR_X, Config.SUELO_Y)
	_slider_angulo.value = Config.ANGULO_INICIAL
	_slider_potencia.value = Config.POTENCIA_INICIAL
	_slider_angulo.value_changed.connect(_al_cambiar_slider)
	_slider_potencia.value_changed.connect(_al_cambiar_slider)
	_boton_baliza.pressed.connect(func() -> void: arma = Proyectil.Tipo.BALIZA)
	_boton_espuma.pressed.connect(func() -> void: arma = Proyectil.Tipo.ESPUMA)
	_boton_lanzar.pressed.connect(lanzar)
	Config.valor_cambiado.connect(_al_cambiar_config)
	_al_cambiar_slider(0.0)


func _draw() -> void:
	draw_rect(Rect2(-14.0, Config.BOCA_LANZADOR.y, 28.0, Config.ALTO_LANZADOR), Config.COLOR_LANZADOR)


func _physics_process(delta: float) -> void:
	recarga_restante = maxf(recarga_restante - delta, 0.0)
	_boton_lanzar.disabled = recarga_restante > 0.0


func lanzar() -> void:
	if recarga_restante > 0.0 or get_tree().paused:
		return
	recarga_restante = Config.recarga
	var proyectil: Proyectil = ESCENA_PROYECTIL.instantiate()
	proyectil.tipo = arma
	proyectil.posicion = position + Config.BOCA_LANZADOR
	proyectil.velocidad = Proyectil.velocidad_inicial(_slider_angulo.value, _slider_potencia.value)
	proyectil.contenedor_balizas = $"../Balizas"
	$"../Proyectiles".add_child(proyectil)
	disparo_realizado.emit(arma)


func _al_cambiar_config(_nombre: String, _valor: float) -> void:
	_actualizar_guia()


func _al_cambiar_slider(_valor: float) -> void:
	_etiqueta_angulo.text = "Ángulo %d°" % _slider_angulo.value
	_etiqueta_potencia.text = "Potencia %d" % _slider_potencia.value
	_actualizar_guia()


## Primeros `longitud_guia` pixeles del arco; se corta antes de tocar el suelo.
func _actualizar_guia() -> void:
	var punto := Config.BOCA_LANZADOR
	var velocidad := Proyectil.velocidad_inicial(_slider_angulo.value, _slider_potencia.value)
	var puntos := PackedVector2Array([punto])
	var restante := Config.longitud_guia
	for _i in MAX_PASOS_GUIA:
		velocidad = Proyectil.velocidad_tras_paso(velocidad, Config.PASO_FIJO)
		var siguiente := punto + velocidad * Config.PASO_FIJO
		var tramo := punto.distance_to(siguiente)
		if siguiente.y >= 0.0 or restante <= 0.0:
			break
		if tramo > restante:
			puntos.append(punto.move_toward(siguiente, restante))
			break
		puntos.append(siguiente)
		restante -= tramo
		punto = siguiente
	_guia.points = puntos
