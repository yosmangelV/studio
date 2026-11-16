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
	var previous := pos
	pos += velocity * delta
	position = pos
	if _immobile():
		queue_free()
	elif kind == Kind.FOAM and _hit_monster(previous):
		queue_free()
	elif pos.y >= Config.GROUND_Y:
		_on_ground_reached()
		queue_free()
	elif not Config.WORLD.has_point(pos):
		queue_free()


## With zero gravity and zero power from the panel, a projectile would never leave the world.
## A slow but moving one is kept: it still lands or leaves eventually.
func _immobile() -> bool:
	return is_zero_approx(Config.projectile_gravity) and velocity.is_zero_approx()


## Checks the whole step, not just its end: a fast shot could otherwise skip over the monster.
func _hit_monster(previous: Vector2) -> bool:
	var monster := get_tree().get_first_node_in_group(Monster.GROUP) as Monster
	if monster == null or not _segment_hits_rect(previous, pos, monster.world_rect()):
		return false
	monster.slow_down()
	return true


static func _segment_hits_rect(from: Vector2, to: Vector2, rect: Rect2) -> bool:
	if rect.has_point(from) or rect.has_point(to):
		return true
	var corners := [rect.position, Vector2(rect.end.x, rect.position.y), rect.end, Vector2(rect.position.x, rect.end.y)]
	for i in corners.size():
		if Geometry2D.segment_intersects_segment(from, to, corners[i], corners[(i + 1) % corners.size()]) != null:
			return true
	return false


func _on_ground_reached() -> void:
	if kind != Kind.BEACON or not Config.WORLD.has_point(Vector2(pos.x, Config.GROUND_Y)):
		return
	var beacon: Beacon = BEACON_SCENE.instantiate()
	beacon.position = Vector2(pos.x, Config.GROUND_Y)
	beacon_container.add_child(beacon)
