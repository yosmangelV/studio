class_name Beacon
extends Area2D
## Active until the monster reaches it or `beacon_lifetime` runs out.
## The visible radius is deliberate: the risk must be calculable. The rings show that
## it pulls harder near the centre, and their opacity shows the energy left.

const GROUP := &"beacons"

var age: float = 0.0


func _ready() -> void:
	add_to_group(GROUP)
	var shape := CircleShape2D.new()
	shape.radius = Config.BEACON_CORE_RADIUS
	$Collision.shape = shape


func _physics_process(delta: float) -> void:
	age += delta
	if age >= Config.beacon_lifetime:
		destroy()
	else:
		queue_redraw()


func _draw() -> void:
	var fill := Config.COLOR_BEACON
	fill.a = Config.BEACON_RING_ALPHA * (1.0 - age / Config.beacon_lifetime)
	for ring in range(1, Config.BEACON_RINGS + 1):
		draw_circle(Vector2.ZERO, Config.beacon_radius * ring / Config.BEACON_RINGS, fill)
	draw_circle(Vector2.ZERO, Config.BEACON_CORE_RADIUS, Config.COLOR_BEACON)


func destroy() -> void:
	remove_from_group(GROUP)
	queue_free()
