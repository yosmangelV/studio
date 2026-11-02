class_name Monstruo
extends Area2D
## Maquina de estados explicita. Frenado no es un estado: es un modificador que
## solo afecta a la velocidad. Origen en los pies: `position` se mueve dentro de
## la banda de profundidad, entre Config.BANDA_ALTA_Y y Config.SUELO_Y.

signal baliza_alcanzada(baliza: Baliza)
signal edificio_golpeado(edificio: Edificio)
signal contencion_alcanzada()

enum Estado { AVANZAR, ATRAIDO }

const GRUPO := &"monstruo"

var estado: Estado = Estado.AVANZAR
var rumbo: Vector2 = Vector2.RIGHT
var baliza_objetivo: Baliza = null
var frenado_restante: float = 0.0


func _ready() -> void:
	add_to_group(GRUPO)
	var forma := RectangleShape2D.new()
	forma.size = Config.TAMANO_MONSTRUO
	$Colision.shape = forma
	$Colision.position = Vector2(0.0, -Config.TAMANO_MONSTRUO.y / 2.0)
	area_entered.connect(_al_entrar_area)


func _draw() -> void:
	var tam := Config.TAMANO_MONSTRUO
	draw_rect(Rect2(-tam.x / 2.0, -tam.y, tam.x, tam.y), Config.COLOR_MONSTRUO)


func _physics_process(delta: float) -> void:
	_actualizar_estado()
	var frenado := frenado_restante > 0.0
	var velocidad_actual := Config.velocidad_monstruo * (Config.fuerza_frenado if frenado else 1.0)
	frenado_restante = maxf(frenado_restante - delta, 0.0)
	var deseado := _rumbo_deseado()
	if deseado == Vector2.ZERO:
		return # Sin edificios intactos no tiene objetivo: se queda quieto.
	_girar_hacia(deseado, delta)
	position += rumbo * velocidad_actual * delta
	_limitar_a_la_banda()


func frenar() -> void:
	frenado_restante = Config.duracion_frenado


func rect_mundo() -> Rect2:
	var tam := Config.TAMANO_MONSTRUO
	return Rect2(global_position - Vector2(tam.x / 2.0, tam.y), tam)


func _actualizar_estado() -> void:
	if estado == Estado.ATRAIDO and overlaps_area(baliza_objetivo):
		var alcanzada := baliza_objetivo
		baliza_objetivo = null
		estado = Estado.AVANZAR
		alcanzada.destruir()
		baliza_alcanzada.emit(alcanzada)
	var cercana := _baliza_en_radio_mas_cercana()
	if cercana:
		baliza_objetivo = cercana
		estado = Estado.ATRAIDO


func _rumbo_deseado() -> Vector2:
	match estado:
		Estado.ATRAIDO:
			return position.direction_to(baliza_objetivo.global_position)
		Estado.AVANZAR:
			var edificio := _edificio_intacto_mas_cercano()
			return position.direction_to(edificio.global_position) if edificio else Vector2.ZERO
	return Vector2.ZERO


func _girar_hacia(deseado: Vector2, delta: float) -> void:
	var maximo := deg_to_rad(Config.giro_monstruo) * delta
	rumbo = rumbo.rotated(clampf(rumbo.angle_to(deseado), -maximo, maximo)).normalized()


func _limitar_a_la_banda() -> void:
	position.x = maxf(position.x, Config.TAMANO_MONSTRUO.x / 2.0)
	position.y = clampf(position.y, Config.BANDA_ALTA_Y, Config.SUELO_Y)


func _baliza_en_radio_mas_cercana() -> Baliza:
	var mejor: Baliza = null
	var mejor_distancia := Config.radio_baliza
	for nodo: Node in get_tree().get_nodes_in_group(Baliza.GRUPO):
		var distancia := position.distance_to(nodo.global_position)
		if distancia < mejor_distancia:
			mejor = nodo as Baliza
			mejor_distancia = distancia
	return mejor


func _edificio_intacto_mas_cercano() -> Edificio:
	var mejor: Edificio = null
	var mejor_distancia := INF
	for nodo: Node in get_tree().get_nodes_in_group(Edificio.GRUPO):
		var edificio := nodo as Edificio
		var distancia := position.distance_to(edificio.global_position)
		if edificio.intacto and distancia < mejor_distancia:
			mejor = edificio
			mejor_distancia = distancia
	return mejor


func _al_entrar_area(area: Area2D) -> void:
	if area is Edificio:
		edificio_golpeado.emit(area)
	elif area.name == "ZonaContencion":
		contencion_alcanzada.emit()
