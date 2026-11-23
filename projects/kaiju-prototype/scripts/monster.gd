class_name Monster
extends Area2D
## Explicit state machine. Being slowed is not a state: it is a modifier that only
## affects speed. The origin is at the feet: it walks on Config.GROUND_Y, so turning
## means slowing down, stopping and walking off the other way.

signal beacon_reached(beacon: Beacon)
signal building_hit(building: Building)
signal containment_reached()

enum State { ADVANCE, ATTRACTED }

const GROUP := &"monster"
const CONTAINMENT_ZONE := &"ContainmentZone"

var state: State = State.ADVANCE
var heading: Vector2 = Vector2.RIGHT
var target_beacon: Beacon = null
var slow_remaining: float = 0.0


func _ready() -> void:
	add_to_group(GROUP)
	var shape := RectangleShape2D.new()
	shape.size = Config.MONSTER_SIZE
	$Collision.shape = shape
	$Collision.position = Vector2(0.0, -Config.MONSTER_SIZE.y / 2.0)
	area_entered.connect(_on_area_entered)


func _draw() -> void:
	var size := Config.MONSTER_SIZE
	var color := Config.COLOR_FOAM if slow_remaining > 0.0 else Config.COLOR_MONSTER
	draw_rect(Rect2(-size.x / 2.0, -size.y, size.x, size.y), color)


func _physics_process(delta: float) -> void:
	_update_state()
	var slowed := slow_remaining > 0.0
	var speed := Config.monster_speed * (Config.slow_factor if slowed else 1.0) * _attraction_factor()
	slow_remaining = maxf(slow_remaining - delta, 0.0)
	if slowed and slow_remaining <= 0.0:
		queue_redraw()
	var desired := _desired_heading()
	if desired == Vector2.ZERO:
		return # No intact buildings means no target: it stays still.
	_turn_towards(desired, delta)
	position += heading * speed * delta
	_clamp_to_ground()


func slow_down() -> void:
	slow_remaining = Config.slow_duration
	queue_redraw()


func world_rect() -> Rect2:
	var size := Config.MONSTER_SIZE
	return Rect2(global_position - Vector2(size.x / 2.0, size.y), size)


func _update_state() -> void:
	if state == State.ATTRACTED and _beacon_gone():
		target_beacon = null
		state = State.ADVANCE
	elif state == State.ATTRACTED and overlaps_area(target_beacon):
		var reached := target_beacon
		target_beacon = null
		state = State.ADVANCE
		reached.destroy()
		beacon_reached.emit(reached)
	var nearest := _nearest_beacon_in_radius()
	if nearest:
		target_beacon = nearest
		state = State.ATTRACTED


## A beacon expires during its own step, so it can stay valid until the end of the frame.
func _beacon_gone() -> bool:
	return not is_instance_valid(target_beacon) or target_beacon.is_queued_for_deletion()


## 1 at the beacon's centre, `min_attraction` at the edge of its radius. 1 when not attracted.
func _attraction_factor() -> float:
	if state != State.ATTRACTED or Config.beacon_radius <= 0.0:
		return 1.0
	var closeness := 1.0 - position.distance_to(target_beacon.global_position) / Config.beacon_radius
	return lerpf(Config.min_attraction, 1.0, clampf(closeness, 0.0, 1.0))


func _desired_heading() -> Vector2:
	match state:
		State.ATTRACTED:
			return position.direction_to(target_beacon.global_position)
		State.ADVANCE:
			var building := _nearest_intact_building()
			return position.direction_to(building.global_position) if building else Vector2.ZERO
	return Vector2.ZERO


func _turn_towards(desired: Vector2, delta: float) -> void:
	var max_turn := deg_to_rad(Config.monster_turn_rate) * delta
	heading = heading.rotated(clampf(heading.angle_to(desired), -max_turn, max_turn)).normalized()


func _clamp_to_ground() -> void:
	position.x = maxf(position.x, Config.MONSTER_SIZE.x / 2.0)
	position.y = Config.GROUND_Y


func _nearest_beacon_in_radius() -> Beacon:
	var best: Beacon = null
	var best_distance := Config.beacon_radius
	for node: Node in get_tree().get_nodes_in_group(Beacon.GROUP):
		var distance := position.distance_to(node.global_position)
		if distance < best_distance:
			best = node as Beacon
			best_distance = distance
	return best


func _nearest_intact_building() -> Building:
	var best: Building = null
	var best_distance := INF
	for node: Node in get_tree().get_nodes_in_group(Building.GROUP):
		var building := node as Building
		var distance := position.distance_to(building.global_position)
		if building.intact and distance < best_distance:
			best = building
			best_distance = distance
	return best


func _on_area_entered(area: Area2D) -> void:
	if area is Building:
		building_hit.emit(area)
	elif area.name == CONTAINMENT_ZONE:
		containment_reached.emit()
