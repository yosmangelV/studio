extends Panel
## Un control por cada variable de Config; cada cambio se aplica en caliente.
## F1 lo pliega; el boton de la interfaz hace lo mismo en pantallas tactiles.

var _sliders: Dictionary = {}
var _valores: Dictionary = {}


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var lista: VBoxContainer = $Desplazamiento/Lista
	for ajuste: Dictionary in Config.AJUSTES:
		lista.add_child(_crear_fila(ajuste))
	Config.valor_cambiado.connect(_al_cambiar_config)


func _unhandled_key_input(evento: InputEvent) -> void:
	var tecla := evento as InputEventKey
	if tecla and tecla.pressed and not tecla.echo and tecla.physical_keycode == KEY_F1:
		alternar()


func alternar() -> void:
	visible = not visible


func _crear_fila(ajuste: Dictionary) -> Control:
	var nombre: String = ajuste["nombre"]
	var fila := HBoxContainer.new()
	var etiqueta := Label.new()
	etiqueta.text = nombre
	etiqueta.custom_minimum_size.x = 170.0
	var slider := HSlider.new()
	slider.min_value = ajuste["min"]
	slider.max_value = ajuste["max"]
	slider.step = ajuste["paso"]
	slider.value = Config.get(nombre)
	slider.custom_minimum_size = Vector2(190.0, 44.0)
	slider.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var valor := Label.new()
	valor.text = str(Config.get(nombre))
	valor.custom_minimum_size.x = 60.0
	slider.value_changed.connect(func(v: float) -> void: Config.set(nombre, v))
	_sliders[nombre] = slider
	_valores[nombre] = valor
	fila.add_child(etiqueta)
	fila.add_child(slider)
	fila.add_child(valor)
	return fila


func _al_cambiar_config(nombre: String, valor: float) -> void:
	_sliders[nombre].set_value_no_signal(valor)
	_valores[nombre].text = str(valor)
