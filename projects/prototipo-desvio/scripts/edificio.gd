class_name Edificio
extends Area2D
## Origen en el centro de la base. Un edificio destruido no vuelve a restar integridad.

signal destruido(edificio: Edificio)

const GRUPO := &"edificios"

var intacto := true


func _ready() -> void:
	add_to_group(GRUPO)
	var forma := RectangleShape2D.new()
	forma.size = Config.TAMANO_EDIFICIO
	$Colision.shape = forma
	$Colision.position = Vector2(0.0, -Config.TAMANO_EDIFICIO.y / 2.0)


func _draw() -> void:
	var tam := Config.TAMANO_EDIFICIO
	var color := Config.COLOR_EDIFICIO if intacto else Config.COLOR_DESTRUIDO
	draw_rect(Rect2(-tam.x / 2.0, -tam.y, tam.x, tam.y), color)


func recibir_golpe() -> void:
	if not intacto:
		return
	intacto = false
	$Colision.set_deferred("disabled", true)
	queue_redraw()
	destruido.emit(self)
