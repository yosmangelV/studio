extends Node
## Autoload. The only place where numbers live (technical spec, section 5.1).
## Every tunable value is PROVISIONAL: it exists so the game runs, not as a
## balance proposal. Tuning happens by playing.

signal value_changed(name: String, value: float)

# --- Fixed geometry (not exposed in the debug panel) ---
const GROUND_Y := 600.0
const WORLD := Rect2(0.0, 0.0, 1280.0, 720.0)
const SPAWN_X := 320.0
const LAUNCHER_X := 1180.0
const LAUNCHER_HEIGHT := 40.0
const LAUNCHER_WIDTH := 28.0
## The launcher sits on the roof of the last building; its origin stays on the ground.
const LAUNCHER_MUZZLE := Vector2(0.0, -150.0)
const GUIDE_MAX_STEPS := 600
## The guide never covers more than this fraction of the arc, so it cannot reveal the impact.
const GUIDE_MAX_ARC_FRACTION := 0.4
const CONTAINMENT_MAX_X := 110.0
const BUILDINGS_X: Array[float] = [920.0, 1050.0, LAUNCHER_X]
const MONSTER_SIZE := Vector2(90.0, 110.0)
const BUILDING_SIZE := Vector2(90.0, 110.0)
const BEACON_CORE_RADIUS := 10.0
const BEACON_RINGS := 4
const BEACON_RING_ALPHA := 0.1
const PROJECTILE_RADIUS := 6.0
const MAX_INTEGRITY := 100.0
const INITIAL_ANGLE := 135.0
const INITIAL_POWER := 70.0
const FIXED_STEP := 1.0 / 60.0

# --- Reduced palette ---
const COLOR_BACKGROUND := Color("#20242c")
const COLOR_GROUND := Color("#14161b")
const COLOR_CONTAINMENT := Color("#2f7d5b")
const COLOR_BUILDING := Color("#c9ced8")
const COLOR_DESTROYED := Color("#4d535f")
const COLOR_MONSTER := Color("#d9503f")
const COLOR_BEACON := Color("#f0a13a")
const COLOR_FOAM := Color("#6fc4e8")
const COLOR_LAUNCHER := Color("#c9ced8")

## Debug panel metadata: editing ranges, not recommendations.
const TUNABLES: Array[Dictionary] = [
	{"name": "monster_speed", "min": 0.0, "max": 300.0, "step": 1.0},
	{"name": "beacon_radius", "min": 0.0, "max": 1000.0, "step": 1.0},
	{"name": "beacon_lifetime", "min": 0.5, "max": 60.0, "step": 0.5},
	{"name": "min_attraction", "min": 0.0, "max": 1.0, "step": 0.05},
	{"name": "monster_turn_rate", "min": 1.0, "max": 720.0, "step": 1.0},
	{"name": "slow_factor", "min": 0.0, "max": 1.0, "step": 0.01},
	{"name": "slow_duration", "min": 0.0, "max": 20.0, "step": 0.1},
	{"name": "projectile_gravity", "min": 0.0, "max": 3000.0, "step": 10.0},
	{"name": "power_scale", "min": 0.0, "max": 40.0, "step": 0.5},
	{"name": "reload_time", "min": 0.0, "max": 10.0, "step": 0.1},
	{"name": "guide_length", "min": 0.0, "max": 1000.0, "step": 5.0},
	{"name": "building_damage", "min": 0.0, "max": 100.0, "step": 1.0},
]

var monster_speed: float = 20.0:
	set(v):
		monster_speed = v
		value_changed.emit("monster_speed", v)
var beacon_radius: float = 249.0:
	set(v):
		beacon_radius = v
		value_changed.emit("beacon_radius", v)
var beacon_lifetime: float = 8.0:
	set(v):
		beacon_lifetime = v
		value_changed.emit("beacon_lifetime", v)
## Fraction of the monster's speed at the edge of the radius; the centre pulls at 100%.
var min_attraction: float = 0.25:
	set(v):
		min_attraction = v
		value_changed.emit("min_attraction", v)
## Degrees per second.
var monster_turn_rate: float = 90.0:
	set(v):
		monster_turn_rate = v
		value_changed.emit("monster_turn_rate", v)
## Speed multiplier while foam slows the monster.
var slow_factor: float = 0.4:
	set(v):
		slow_factor = v
		value_changed.emit("slow_factor", v)
## Seconds.
var slow_duration: float = 3.0:
	set(v):
		slow_duration = v
		value_changed.emit("slow_duration", v)
var projectile_gravity: float = 900.0:
	set(v):
		projectile_gravity = v
		value_changed.emit("projectile_gravity", v)
var power_scale: float = 10.0:
	set(v):
		power_scale = v
		value_changed.emit("power_scale", v)
## Seconds between shots.
var reload_time: float = 1.0:
	set(v):
		reload_time = v
		value_changed.emit("reload_time", v)
## Pixels of arc shown by the trajectory guide.
var guide_length: float = 120.0:
	set(v):
		guide_length = v
		value_changed.emit("guide_length", v)
var building_damage: float = 34.0:
	set(v):
		building_damage = v
		value_changed.emit("building_damage", v)
