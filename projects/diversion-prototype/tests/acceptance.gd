extends Node
## Checks the section 7 acceptance criteria against the real game, headless or windowed.
## Criteria 4 and 11 also have a part that can only be judged by eye and by finger.

const MAIN_SCENE := "res://scenes/main.tscn"
const BEACON_SCENE := preload("res://scenes/beacon.tscn")
const PROJECTILE_SCENE := preload("res://scenes/projectile.tscn")

## A script error aborts the run without failing a check: counting the checks exposes it.
const GUI_CHECKS := 5
const EXPECTED_CHECKS := 58

var _failures := 0
var _checks := 0
var _defaults := {}
var _game: Main


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for tunable: Dictionary in Config.TUNABLES:
		_defaults[tunable["name"]] = Config.get(tunable["name"])
	_run.call_deferred()


func _run() -> void:
	get_tree().current_scene = null # This node survives scene changes.
	for test: Callable in [_c1_and_c8_loss, _c2_diversion, _c3_out_of_radius, _c4_turn, _c5_foam, _c6_determinism, _c7_guide, _immobile_projectile_expires, _c8_win, _c9_panel, _c10_session_log, _beacon_expires, _attraction_by_distance, _launcher_on_last_building, _real_launch, _touches, _restart, _game_with_real_shots]:
		await test.call()
	var expected := EXPECTED_CHECKS - (GUI_CHECKS if _headless() else 0)
	_check("All checks ran", _checks == expected, "%d of %d" % [_checks, expected])
	print("RESULT: %d failures" % _failures)
	get_tree().quit(1 if _failures > 0 else 0)


func _headless() -> bool:
	return DisplayServer.get_name() == "headless"


func _check(criterion: String, condition: bool, detail: String = "") -> void:
	_checks += 1
	print("%s %s %s" % ["OK   " if condition else "FAIL ", criterion, detail])
	if not condition:
		_failures += 1


func _load() -> void:
	for tunable_name: String in _defaults:
		Config.set(tunable_name, _defaults[tunable_name])
	get_tree().paused = false
	get_tree().change_scene_to_file(MAIN_SCENE)
	await get_tree().scene_changed
	_game = get_tree().current_scene


func _simulate(steps: int) -> void:
	for _i in steps:
		await get_tree().physics_frame


func _seconds_to_steps(seconds: float) -> int:
	return int(seconds * Engine.physics_ticks_per_second)


func _place_beacon(x: float) -> Beacon:
	var beacon: Beacon = BEACON_SCENE.instantiate()
	beacon.position = Vector2(x, Config.GROUND_Y)
	_game.get_node("Beacons").add_child(beacon)
	return beacon


func _monster() -> Monster:
	return _game.get_node("Monster")


func _c1_and_c8_loss() -> void:
	await _load()
	await _simulate(1800)
	_check("1  advances and destroys", _game.integrity < Config.MAX_INTEGRITY, "integrity=%s" % _game.integrity)
	await _simulate(6000)
	_check("8b zero integrity is a loss", _game.result == Main.RESULT_LOSS and _game.integrity <= 0.0)
	var destroyed := _game.get_node("Buildings").get_children().filter(func(b: Building) -> bool: return not b.intact)
	_check("1  each building costs integrity once", is_equal_approx(destroyed.size() * Config.building_damage, 102.0))


func _c2_diversion() -> void:
	await _load()
	Config.beacon_lifetime = 60.0 # The monster should destroy it, not time.
	var beacon := _place_beacon(Config.SPAWN_X - 120.0) # Behind it: forces a reversal.
	await _simulate(2)
	var monster := _monster()
	_check("2  enters ATTRACTED", monster.state == Monster.State.ATTRACTED and monster.target_beacon == beacon)
	await _simulate(600)
	_check("2  destroys the beacon", not is_instance_valid(beacon))
	_check("2  goes back to ADVANCE", monster.state == Monster.State.ADVANCE)
	await _simulate(180)
	_check("2  heads back to the city", monster.heading.x > 0.9, str(monster.heading))


func _c3_out_of_radius() -> void:
	await _load()
	var beacon := _place_beacon(Config.SPAWN_X + Config.beacon_radius + 100.0)
	await _simulate(60)
	_check("3  out of radius does nothing", _monster().state == Monster.State.ADVANCE and is_instance_valid(beacon))


func _c4_turn() -> void:
	await _load()
	var monster := _monster()
	monster.position = Vector2(300.0, Config.GROUND_Y)
	_place_beacon(100.0)
	var max_step := 0.0
	var turning_steps := 0
	for _i in 300:
		var previous := monster.heading
		await _simulate(1)
		max_step = maxf(max_step, absf(previous.angle_to(monster.heading)))
		if monster.heading.dot(Vector2.LEFT) < 0.99:
			turning_steps += 1
	_check("4  turn limited per step", max_step <= deg_to_rad(Config.monster_turn_rate) / Engine.physics_ticks_per_second + 0.0001, "max=%f rad" % max_step)
	_check("4  the turn takes several frames", turning_steps > 60, "%d steps" % turning_steps)


func _c5_foam() -> void:
	await _load()
	var monster := _monster()
	await _simulate(10)
	var start := monster.position
	await _simulate(30)
	var normal := monster.position.x - start.x
	var previous_heading := monster.heading
	var projectile: Projectile = PROJECTILE_SCENE.instantiate()
	projectile.kind = Projectile.Kind.FOAM
	projectile.pos = monster.world_rect().get_center()
	projectile.velocity = Vector2.ZERO
	_game.get_node("Projectiles").add_child(projectile)
	await _simulate(3)
	_check("5  a hit slows it down", monster.slow_remaining > 0.0 and not is_instance_valid(projectile))
	start = monster.position
	await _simulate(30)
	var slowed := monster.position.x - start.x
	_check("5  reduces speed", is_equal_approx(snappedf(slowed / normal, 0.01), Config.slow_factor), "ratio=%f" % (slowed / normal))
	_check("5  keeps the heading", monster.heading.is_equal_approx(previous_heading))


func _trajectory() -> PackedVector2Array:
	var points := PackedVector2Array()
	var projectile: Projectile = PROJECTILE_SCENE.instantiate()
	projectile.kind = Projectile.Kind.FOAM
	projectile.pos = Vector2(Config.LAUNCHER_X, Config.GROUND_Y) + Config.LAUNCHER_MUZZLE
	projectile.velocity = Projectile.initial_velocity(120.0, 60.0)
	_game.get_node("Projectiles").add_child(projectile)
	while is_instance_valid(projectile):
		points.append(projectile.pos)
		await _simulate(1)
	return points


func _c6_determinism() -> void:
	await _load()
	var a := await _trajectory()
	await _load()
	var b := await _trajectory()
	_check("6  same trajectory", a == b and a.size() > 10, "%d points" % a.size())


func _c7_guide() -> void:
	await _load()
	var guide: Line2D = _game.get_node("Launcher/TrajectoryGuide")
	var power_slider: HSlider = _game.get_node("UI/PowerSlider")
	var length := 0.0
	for i in range(1, guide.points.size()):
		length += guide.points[i - 1].distance_to(guide.points[i])
	_check("7  guide is limited", length <= Config.guide_length + 0.01 and guide.points.size() > 2, "length=%f" % length)
	_check("7  does not reach the ground", guide.points[guide.points.size() - 1].y < 0.0)
	power_slider.value = 80.0
	_check("7  reacts to the slider", guide.points[1].length() > 0.0)
	power_slider.value = 5.0
	var low_end := guide.points[guide.points.size() - 1]
	_check("7  low power stops far above the ground", -low_end.y > -Config.LAUNCHER_MUZZLE.y / 2.0, str(low_end))
	power_slider.value = 60.0
	Config.guide_length = 1000.0
	var long_end := guide.points[guide.points.size() - 1]
	_check("7  a long guide does not reach the impact", -long_end.y > -Config.LAUNCHER_MUZZLE.y / 2.0, str(long_end))


func _immobile_projectile_expires() -> void:
	await _load()
	Config.projectile_gravity = 0.0
	_game.get_node("UI/PowerSlider").value = 0.0
	_game.get_node("Launcher").fire()
	await _simulate(_seconds_to_steps(Config.PROJECTILE_MAX_LIFETIME) - 10)
	_check("P  an immobile projectile is alive before it expires", _game.get_node("Projectiles").get_child_count() == 1)
	await _simulate(15)
	_check("P  an immobile projectile is removed", _game.get_node("Projectiles").get_child_count() == 0)


func _c8_win() -> void:
	await _load()
	Config.beacon_lifetime = 60.0
	_place_beacon(150.0)
	_place_beacon(20.0) # Inside containment: the monster touches the zone before reaching it.
	await _simulate(2500)
	_check("8a containment is a win without touching buildings", _game.result == Main.RESULT_WIN and is_equal_approx(_game.integrity, Config.MAX_INTEGRITY), "integrity=%s" % _game.integrity)


func _c9_panel() -> void:
	await _load()
	var panel := _game.get_node("UI/DebugPanel")
	for tunable: Dictionary in Config.TUNABLES:
		var slider: HSlider = panel._sliders[tunable["name"]]
		slider.value = tunable["min"] + tunable["step"] * 2.0
		_check("9  " + tunable["name"], is_equal_approx(Config.get(tunable["name"]), slider.value))


func _c10_session_log() -> void:
	await _load()
	var rows_before := FileAccess.get_file_as_string(SessionLog.path).strip_edges().split("\n").size()
	# Distinct values: swapped columns or a hard-coded value would not pass.
	_game.shots[Projectile.Kind.BEACON] = 3
	_game.shots[Projectile.Kind.FOAM] = 5
	_game.integrity = 66.0
	# Read before finishing, so they do not depend on the order of earlier tests.
	var expected := PackedStringArray([
		SessionLog._session_id,
		str(SessionLog._attempt),
		"%.2f" % _game.duration,
		Main.RESULT_LOSS,
		"%.0f" % _game.integrity,
		str(_game.shots[Projectile.Kind.BEACON]),
		str(_game.shots[Projectile.Kind.FOAM]),
		SessionLog._last_result,
	])
	_game._finish(Main.RESULT_LOSS)
	var lines := FileAccess.get_file_as_string(SessionLog.path).strip_edges().split("\n")
	var fields := lines[lines.size() - 1].split(",")
	_check("10 one row per attempt", lines.size() == rows_before + 1, lines[lines.size() - 1])
	_check("10 eight columns", fields.size() == 8)
	_check("10 recorded content", fields == expected, "%s vs %s" % [",".join(fields), ",".join(expected)])
	await _load()
	_game._finish(Main.RESULT_WIN)
	var next_lines := FileAccess.get_file_as_string(SessionLog.path).strip_edges().split("\n")
	var next_row := next_lines[next_lines.size() - 1].split(",")
	_check("10 the next row records restarted_after=loss", next_lines.size() == lines.size() + 1 and next_row[7] == Main.RESULT_LOSS, ",".join(next_row))
	get_tree().paused = false


func _beacon_expires() -> void:
	await _load()
	Config.beacon_lifetime = 1.0
	var monster := _monster()
	var beacon := _place_beacon(Config.SPAWN_X - 200.0)
	await _simulate(30)
	_check("B  attracts while it has energy", monster.state == Monster.State.ATTRACTED)
	await _simulate(45)
	_check("B  expires and the monster goes back to ADVANCE", not is_instance_valid(beacon) and monster.state == Monster.State.ADVANCE)
	await _simulate(180)
	_check("B  heads back to the city", monster.heading.x > 0.9, str(monster.heading))


## Distance covered over a short stretch, already facing the beacon.
func _attracted_advance(distance: float) -> float:
	await _load()
	var monster := _monster()
	monster.heading = Vector2.LEFT
	_place_beacon(Config.SPAWN_X - distance)
	await _simulate(2)
	var start := monster.position.x
	await _simulate(6)
	return start - monster.position.x


func _attraction_by_distance() -> void:
	var far := await _attracted_advance(Config.beacon_radius - 5.0)
	var near := await _attracted_advance(70.0)
	var step := Config.monster_speed * 6.0 / Engine.physics_ticks_per_second
	_check("A  the edge of the radius pulls at the minimum speed", absf(far / step - 0.265) < 0.02, "%.3f" % (far / step))
	_check("A  near the centre pulls harder", absf(near / step - 0.79) < 0.02, "%.3f" % (near / step))


func _launcher_on_last_building() -> void:
	await _load()
	var buildings := _game.get_node("Buildings").get_children()
	_check("E  the launcher sits on the last building", is_equal_approx(_game.get_node("Launcher").position.x, buildings[buildings.size() - 1].position.x))
	Config.building_damage = 1.0
	for building: Building in buildings:
		building.take_hit()
	_check("E  no buildings left is a loss even with integrity left", _game.result == Main.RESULT_LOSS and _game.integrity > 0.0)
	get_tree().paused = false


func _tap_at(point: Vector2, release := true) -> void:
	var touch := InputEventScreenTouch.new()
	touch.position = point
	touch.pressed = true
	Input.parse_input_event(touch)
	Input.flush_buffered_events()
	await get_tree().process_frame
	if release:
		var end := InputEventScreenTouch.new()
		end.position = point
		end.pressed = false
		Input.parse_input_event(end)
		Input.flush_buffered_events()
		await get_tree().process_frame


func _center_of(node_path: String) -> Vector2:
	return (_game.get_node(node_path) as Control).get_global_rect().get_center()


func _aim_and_fire(angle: float, power: float) -> void:
	_game.get_node("UI/AngleSlider").value = angle
	_game.get_node("UI/PowerSlider").value = power
	_game.get_node("Launcher").fire()


func _real_launch() -> void:
	await _load()
	var beacons := _game.get_node("Beacons")
	_aim_and_fire(135.0, 60.0)
	_game.get_node("Launcher").fire()
	_check("L  reload blocks the second shot", _game.get_node("Projectiles").get_child_count() == 1 and _game.shots[Projectile.Kind.BEACON] == 1)
	await _simulate(180)
	_check("L  the projectile leaves a beacon on the ground", beacons.get_child_count() == 1 and is_equal_approx(beacons.get_child(0).position.y, Config.GROUND_Y))
	var first_landing: Vector2 = beacons.get_child(0).position
	await _load()
	_aim_and_fire(135.0, 60.0)
	await _simulate(180)
	_check("L  same landing with the same sliders", _game.get_node("Beacons").get_child(0).position == first_landing, str(first_landing))
	await _load()
	_game.get_node("UI/WeaponSelector/FoamButton").pressed.emit()
	_game.get_node("Launcher").fire()
	await _simulate(180)
	_check("L  a missed foam shot leaves nothing", _game.get_node("Beacons").get_child_count() == 0 and _monster().slow_remaining == 0.0)
	await _load()
	var monster := _monster()
	await _simulate(30)
	var start := monster.position
	await _simulate(10)
	var slow_distance := start.distance_to(monster.position)
	Config.monster_speed = Config.monster_speed * 2.0
	start = monster.position
	await _simulate(10)
	_check("9  a change affects the running game", is_equal_approx(snappedf(start.distance_to(monster.position) / slow_distance, 0.01), 2.0))


func _touches() -> void:
	if _headless():
		print("SKIPPED UI touches: they do not arrive headless; run with a window")
		return
	await _load()
	var slider: HSlider = _game.get_node("UI/PowerSlider")
	var previous := slider.value
	var rect := slider.get_global_rect()
	await _tap_at(rect.position + rect.size * Vector2(0.9, 0.5))
	_check("11 an emulated touch moves the slider", slider.value > previous, "%s -> %s" % [previous, slider.value])
	await _tap_at(_center_of("UI/WeaponSelector/FoamButton"))
	_check("11 an emulated touch switches weapon", _game.get_node("Launcher").weapon == Projectile.Kind.FOAM)
	await _tap_at(_center_of("UI/FireButton"))
	_check("11 an emulated touch fires", _game.shots[Projectile.Kind.FOAM] == 1)
	await _tap_at(_center_of("UI/PanelButton"))
	_check("11 an emulated touch opens the panel", _game.get_node("UI/DebugPanel").visible)
	_check("11 a touch during play does not restart", _game == get_tree().current_scene and not _game.finished)


func _restart() -> void:
	await _load()
	var previous: Node = _game
	_game._finish(Main.RESULT_LOSS)
	await _tap_at(Vector2(640.0, 300.0), false)
	await get_tree().process_frame
	await get_tree().process_frame
	_check("R  a touch after the end restarts", get_tree().current_scene != previous and not get_tree().paused)
	_game = get_tree().current_scene
	previous = _game
	var key := InputEventKey.new()
	key.physical_keycode = KEY_R
	key.pressed = true
	Input.parse_input_event(key)
	Input.flush_buffered_events()
	await get_tree().process_frame
	await get_tree().process_frame
	await get_tree().process_frame
	_check("R  the R key restarts during play", get_tree().current_scene != previous)


## Automatic player: only uses the sliders and fire. It proves the starting values can be
## won, not that they are fun.
func _game_with_real_shots() -> void:
	await _load()
	var monster := _monster()
	var launcher := _game.get_node("Launcher")
	for _i in 6000:
		if _game.finished:
			break
		var beacon_ahead := false
		for beacon: Node in _game.get_node("Beacons").get_children():
			if monster.position.x - beacon.position.x > 110.0: # Still active when the next one lands.
				beacon_ahead = true
		if not beacon_ahead and _game.get_node("Projectiles").get_child_count() == 0 and launcher.reload_remaining <= 0.0:
			_aim_at(maxf(monster.position.x - 200.0, 30.0))
			launcher.fire()
		await _simulate(1)
	_check("V  winnable with real shots", _game.result == Main.RESULT_WIN and _game.integrity > 0.0, "result=%s integrity=%s beacons=%d duration=%.1fs" % [_game.result, _game.integrity, _game.shots[Projectile.Kind.BEACON], _game.duration])


func _aim_at(target_x: float) -> void:
	var muzzle := Vector2(Config.LAUNCHER_X, Config.GROUND_Y) + Config.LAUNCHER_MUZZLE
	var angle := 135.0 if target_x < muzzle.x else 45.0
	var best := 0.0
	var error := INF
	for power in 101:
		var p := muzzle
		var v := Projectile.initial_velocity(angle, power)
		while p.y < Config.GROUND_Y:
			v = Projectile.velocity_after_step(v, Config.FIXED_STEP)
			p += v * Config.FIXED_STEP
		if absf(p.x - target_x) < error:
			error = absf(p.x - target_x)
			best = power
	_game.get_node("UI/AngleSlider").value = angle
	_game.get_node("UI/PowerSlider").value = best
