class_name Building
extends Area2D
## Origin at the centre of its base. A destroyed building never costs integrity again.

signal destroyed(building: Building)

const GROUP := &"buildings"

var intact := true


func _ready() -> void:
	add_to_group(GROUP)
	var shape := RectangleShape2D.new()
	shape.size = Config.BUILDING_SIZE
	$Collision.shape = shape
	$Collision.position = Vector2(0.0, -Config.BUILDING_SIZE.y / 2.0)


func _draw() -> void:
	var size := Config.BUILDING_SIZE
	var color := Config.COLOR_BUILDING if intact else Config.COLOR_DESTROYED
	draw_rect(Rect2(-size.x / 2.0, -size.y, size.x, size.y), color)


func take_hit() -> void:
	if not intact:
		return
	intact = false
	$Collision.set_deferred("disabled", true)
	queue_redraw()
	destroyed.emit(self)
