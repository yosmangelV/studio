extends Node2D
## Reads the sliders and the weapon, fires once the reload is over and draws the short guide.

signal shot_fired(kind: Projectile.Kind)

const PROJECTILE_SCENE := preload("res://scenes/projectile.tscn")
# Player-facing text stays in Spanish: the playtesters are Spanish speakers.
const ANGLE_LABEL := "Ángulo %d°"
const POWER_LABEL := "Potencia %d"

var weapon: Projectile.Kind = Projectile.Kind.BEACON
var reload_remaining: float = 0.0
## Derived from the time since the last shot, so a `reload_time` change applies to a reload in progress.
var _since_last_shot: float = INF

@onready var _guide: Line2D = $TrajectoryGuide
@onready var _angle_slider: HSlider = $"../UI/AngleSlider"
@onready var _power_slider: HSlider = $"../UI/PowerSlider"
@onready var _angle_label: Label = $"../UI/AngleLabel"
@onready var _power_label: Label = $"../UI/PowerLabel"
@onready var _beacon_button: Button = $"../UI/WeaponSelector/BeaconButton"
@onready var _foam_button: Button = $"../UI/WeaponSelector/FoamButton"
@onready var _fire_button: Button = $"../UI/FireButton"


func _ready() -> void:
	position = Vector2(Config.LAUNCHER_X, Config.GROUND_Y)
	_angle_slider.value = Config.INITIAL_ANGLE
	_power_slider.value = Config.INITIAL_POWER
	_angle_slider.value_changed.connect(_on_slider_changed)
	_power_slider.value_changed.connect(_on_slider_changed)
	_beacon_button.pressed.connect(func() -> void: weapon = Projectile.Kind.BEACON)
	_foam_button.pressed.connect(func() -> void: weapon = Projectile.Kind.FOAM)
	_fire_button.pressed.connect(fire)
	Config.value_changed.connect(_on_config_changed)
	_on_slider_changed(0.0)


func _draw() -> void:
	draw_rect(Rect2(-Config.LAUNCHER_WIDTH / 2.0, Config.LAUNCHER_MUZZLE.y, Config.LAUNCHER_WIDTH, Config.LAUNCHER_HEIGHT), Config.COLOR_LAUNCHER)


func _physics_process(delta: float) -> void:
	_since_last_shot += delta
	_update_reload()


func fire() -> void:
	if reload_remaining > 0.0 or get_tree().paused:
		return
	_since_last_shot = 0.0
	_update_reload()
	var projectile: Projectile = PROJECTILE_SCENE.instantiate()
	projectile.kind = weapon
	projectile.pos = position + Config.LAUNCHER_MUZZLE
	projectile.velocity = Projectile.initial_velocity(_angle_slider.value, _power_slider.value)
	projectile.beacon_container = $"../Beacons"
	$"../Projectiles".add_child(projectile)
	shot_fired.emit(weapon)


func _update_reload() -> void:
	reload_remaining = maxf(Config.reload_time - _since_last_shot, 0.0)
	_fire_button.disabled = reload_remaining > 0.0


func _on_config_changed(_name: String, _value: float) -> void:
	_update_reload()
	_update_guide()


func _on_slider_changed(_value: float) -> void:
	_angle_label.text = ANGLE_LABEL % _angle_slider.value
	_power_label.text = POWER_LABEL % _power_slider.value
	_update_guide()


## First `guide_length` pixels of the arc, capped at `GUIDE_MAX_ARC_FRACTION` of the whole
## arc: with low power or a long guide, its end does not give the impact away.
func _update_guide() -> void:
	var arc := _arc_to_ground()
	var arc_length := 0.0
	for i in range(1, arc.size()):
		arc_length += arc[i - 1].distance_to(arc[i])
	var remaining := minf(Config.guide_length, arc_length * Config.GUIDE_MAX_ARC_FRACTION)
	var points := PackedVector2Array([arc[0]])
	for i in range(1, arc.size()):
		var segment := arc[i - 1].distance_to(arc[i])
		if segment >= remaining:
			points.append(arc[i - 1].move_toward(arc[i], remaining))
			break
		points.append(arc[i])
		remaining -= segment
	_guide.points = points


## Same integration as the real projectile, in local coordinates (ground at y=0).
func _arc_to_ground() -> PackedVector2Array:
	var point := Config.LAUNCHER_MUZZLE
	var velocity := Projectile.initial_velocity(_angle_slider.value, _power_slider.value)
	var arc := PackedVector2Array([point])
	for _i in Config.GUIDE_MAX_STEPS:
		velocity = Projectile.velocity_after_step(velocity, Config.FIXED_STEP)
		point += velocity * Config.FIXED_STEP
		if point.y >= 0.0:
			break
		arc.append(point)
	return arc
