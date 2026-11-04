class_name Main
extends Node2D
## Runs the game: integrity, signals, the end of an attempt and the session log.

const RESULT_WIN := "win"
const RESULT_LOSS := "loss"
# Player-facing text stays in Spanish: the playtesters are Spanish speakers.
const RESULT_TEXT := {RESULT_WIN: "Victoria", RESULT_LOSS: "Derrota"}
const RESTART_HINT := "%s. Toca o pulsa R para reiniciar"

var integrity: float = Config.MAX_INTEGRITY
var finished := false
var result := "" # RESULT_WIN or RESULT_LOSS once finished.
var duration: float = 0.0
var shots := {Projectile.Kind.BEACON: 0, Projectile.Kind.FOAM: 0}

@onready var _monster: Monster = $Monster
@onready var _integrity_bar: ProgressBar = $UI/IntegrityBar
@onready var _result_label: Label = $UI/ResultLabel
@onready var _debug_panel: Panel = $UI/DebugPanel


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for node: Node in [_monster, $Launcher, $Projectiles, $Beacons]:
		node.process_mode = Node.PROCESS_MODE_PAUSABLE
	SessionLog.start_attempt()
	$Ground.position = Vector2(Config.WORLD.get_center().x, Config.GROUND_Y)
	_monster.position = Vector2(Config.SPAWN_X, Config.GROUND_Y)
	_monster.building_hit.connect(_on_building_hit)
	_monster.containment_reached.connect(_finish.bind(RESULT_WIN))
	$Launcher.shot_fired.connect(_on_shot_fired)
	var buildings := $Buildings.get_children()
	for i in buildings.size():
		var building: Building = buildings[i]
		building.position = Vector2(Config.BUILDINGS_X[i], Config.GROUND_Y)
		building.destroyed.connect(_on_building_destroyed)
	_setup_containment_zone()
	_integrity_bar.max_value = Config.MAX_INTEGRITY
	_integrity_bar.value = integrity
	$UI/PanelButton.pressed.connect(_debug_panel.toggle)


func _draw() -> void:
	var world := Config.WORLD
	draw_rect(world, Config.COLOR_BACKGROUND)
	draw_rect(Rect2(0.0, Config.GROUND_Y, world.size.x, world.end.y - Config.GROUND_Y), Config.COLOR_GROUND)
	draw_rect(Rect2(0.0, 0.0, Config.CONTAINMENT_MAX_X, Config.GROUND_Y), Config.COLOR_CONTAINMENT)


func _physics_process(delta: float) -> void:
	if not finished:
		duration += delta


func _input(event: InputEvent) -> void:
	var key := event as InputEventKey
	if key and key.pressed and not key.echo and key.physical_keycode == KEY_R:
		_restart()
		return
	var touch := event as InputEventScreenTouch
	if finished and touch and touch.pressed:
		_restart()


func _setup_containment_zone() -> void:
	var world := Config.WORLD
	var shape := RectangleShape2D.new()
	shape.size = Vector2(Config.CONTAINMENT_MAX_X, world.size.y)
	$ContainmentZone/Collision.shape = shape
	$ContainmentZone.position = Vector2(shape.size.x / 2.0, world.size.y / 2.0)


func _on_shot_fired(kind: Projectile.Kind) -> void:
	shots[kind] += 1


func _on_building_hit(building: Building) -> void:
	building.take_hit()


func _on_building_destroyed(_building: Building) -> void:
	integrity = maxf(integrity - Config.building_damage, 0.0)
	_integrity_bar.value = integrity
	if integrity <= 0.0 or not _any_building_left():
		_finish(RESULT_LOSS)


## The launcher sits on the last building: no buildings means no weapon, whatever the damage.
func _any_building_left() -> bool:
	return $Buildings.get_children().any(func(building: Building) -> bool: return building.intact)


## Writes the row when the attempt ends, not on restart: closing the game after a loss keeps it.
func _finish(new_result: String) -> void:
	if finished:
		return
	finished = true
	result = new_result
	SessionLog.record(duration, result, integrity, shots[Projectile.Kind.BEACON], shots[Projectile.Kind.FOAM])
	_result_label.text = RESTART_HINT % RESULT_TEXT[result]
	_result_label.visible = true
	get_tree().paused = true


func _restart() -> void:
	get_tree().paused = false
	get_tree().reload_current_scene()
