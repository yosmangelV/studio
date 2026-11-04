extends Panel
## One control per Config tunable; every change applies live.
## F1 toggles it; the UI button does the same on touch screens.

const NAME_WIDTH := 170.0
const SLIDER_SIZE := Vector2(190.0, 44.0)
const VALUE_WIDTH := 60.0

var _sliders: Dictionary = {}
var _values: Dictionary = {}


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var list: VBoxContainer = $Scroll/List
	for tunable: Dictionary in Config.TUNABLES:
		list.add_child(_create_row(tunable))
	Config.value_changed.connect(_on_config_changed)


func _unhandled_key_input(event: InputEvent) -> void:
	var key := event as InputEventKey
	if key and key.pressed and not key.echo and key.physical_keycode == KEY_F1:
		toggle()


func toggle() -> void:
	visible = not visible


func _create_row(tunable: Dictionary) -> Control:
	var tunable_name: String = tunable["name"]
	var row := HBoxContainer.new()
	var label := Label.new()
	label.text = tunable_name
	label.custom_minimum_size.x = NAME_WIDTH
	var slider := HSlider.new()
	slider.min_value = tunable["min"]
	slider.max_value = tunable["max"]
	slider.step = tunable["step"]
	slider.value = Config.get(tunable_name)
	slider.custom_minimum_size = SLIDER_SIZE
	slider.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var value := Label.new()
	value.text = str(Config.get(tunable_name))
	value.custom_minimum_size.x = VALUE_WIDTH
	slider.value_changed.connect(func(v: float) -> void: Config.set(tunable_name, v))
	_sliders[tunable_name] = slider
	_values[tunable_name] = value
	row.add_child(label)
	row.add_child(slider)
	row.add_child(value)
	return row


func _on_config_changed(tunable_name: String, value: float) -> void:
	_sliders[tunable_name].set_value_no_signal(value)
	_values[tunable_name].text = str(value)
