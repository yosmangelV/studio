class_name Projectile
extends Node2D
## Manual, deterministic integration at a fixed step. The launcher's guide reuses the
## same functions so its arc matches the real projectile's.

enum Kind { BEACON, FOAM }

const BEACON_SCENE := preload("res://scenes/beacon.tscn")

var kind: Kind = Kind.BEACON
var pos: Vector2
var velocity: Vector2
var beacon_container: Node
## With gravity and power set to zero from the panel, a projectile never leaves the world.
var age: float = 0.0


static func initial_velocity(angle_degrees: float, power: float) -> Vector2:
	var angle := deg_to_rad(angle_degrees)
	return Vector2(cos(-angle), sin(-angle)) * power * Config.power_scale


static func velocity_after_step(previous: Vector2, delta: float) -> Vector2:
	return previous + Vector2(0.0, Config.projectile_gravity * delta)


func _ready() -> void:
	position = pos


func _draw() -> void:
	var color := Config.COLOR_BEACON if kind == Kind.BEACON else Config.COLOR_FOAM
	draw_circle(Vector2.ZERO, Config.PROJECTILE_RADIUS, color)


func _physics_process(delta: float) -> void:
	velocity = velocity_after_step(velocity, delta)
	pos += velocity * delta
	position = pos
	age += delta
	if age >= Config.PROJECTILE_MAX_LIFETIME:
		queue_free()
	elif kind == Kind.FOAM and _hit_monster():
		queue_free()
	elif pos.y >= Config.GROUND_Y:
		_on_ground_reached()
		queue_free()
	elif not Config.WORLD.has_point(pos):
		queue_free()


func _hit_monster() -> bool:
	var monster := get_tree().get_first_node_in_group(Monster.GROUP) as Monster
	if monster == null or not monster.world_rect().has_point(pos):
		return false
	monster.slow_down()
	return true


func _on_ground_reached() -> void:
	if kind != Kind.BEACON or not Config.WORLD.has_point(Vector2(pos.x, Config.GROUND_Y)):
		return
	var beacon: Beacon = BEACON_SCENE.instantiate()
	beacon.position = Vector2(pos.x, Config.GROUND_Y)
	beacon_container.add_child(beacon)
