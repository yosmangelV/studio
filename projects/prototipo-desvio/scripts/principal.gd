extends Node2D
## Orquesta la partida: integridad, senales y fin del intento.

var integridad: float = Config.INTEGRIDAD_MAX
var terminado := false

@onready var _monstruo: Monstruo = $Monstruo
@onready var _barra: ProgressBar = $Interfaz/BarraIntegridad
@onready var _resultado: Label = $Interfaz/EtiquetaResultado
@onready var _panel: Panel = $Interfaz/PanelDepuracion


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_monstruo.process_mode = Node.PROCESS_MODE_PAUSABLE
	_monstruo.position = Vector2(Config.ENTRADA_X, Config.SUELO_Y)
	_monstruo.edificio_golpeado.connect(_al_golpear_edificio)
	var edificios := $Edificios.get_children()
	for i in edificios.size():
		var edificio: Edificio = edificios[i]
		edificio.position = Vector2(Config.EDIFICIOS_X[i], Config.BANDA_ALTA_Y)
		edificio.destruido.connect(_al_destruir_edificio)
	_configurar_zona_contencion()
	_barra.max_value = Config.INTEGRIDAD_MAX
	_barra.value = integridad
	$Interfaz/BotonPanel.pressed.connect(_panel.alternar)


func _draw() -> void:
	var mundo := Config.MUNDO
	draw_rect(mundo, Config.COLOR_FONDO)
	draw_rect(Rect2(0.0, Config.BANDA_ALTA_Y, mundo.size.x, Config.SUELO_Y - Config.BANDA_ALTA_Y), Config.COLOR_BANDA)
	draw_rect(Rect2(0.0, Config.SUELO_Y, mundo.size.x, mundo.end.y - Config.SUELO_Y), Config.COLOR_SUELO)
	draw_rect(Rect2(Config.CONTENCION_X_MIN, 0.0, mundo.end.x - Config.CONTENCION_X_MIN, Config.SUELO_Y), Config.COLOR_CONTENCION)


func _input(evento: InputEvent) -> void:
	var tecla := evento as InputEventKey
	if tecla and tecla.pressed and not tecla.echo and tecla.physical_keycode == KEY_R:
		_reiniciar()
		return
	var toque := evento as InputEventScreenTouch
	if terminado and toque and toque.pressed:
		_reiniciar()


func _configurar_zona_contencion() -> void:
	var mundo := Config.MUNDO
	var forma := RectangleShape2D.new()
	forma.size = Vector2(mundo.end.x - Config.CONTENCION_X_MIN, mundo.size.y)
	$ZonaContencion/Colision.shape = forma
	$ZonaContencion.position = Vector2(Config.CONTENCION_X_MIN + forma.size.x / 2.0, mundo.size.y / 2.0)


func _al_golpear_edificio(edificio: Edificio) -> void:
	edificio.recibir_golpe()


func _al_destruir_edificio(_edificio: Edificio) -> void:
	integridad = maxf(integridad - Config.dano_edificio, 0.0)
	_barra.value = integridad
	if integridad <= 0.0:
		_terminar("derrota")


func _terminar(resultado: String) -> void:
	if terminado:
		return
	terminado = true
	_resultado.text = "%s. Toca o pulsa R para reiniciar" % resultado.capitalize()
	_resultado.visible = true
	get_tree().paused = true


func _reiniciar() -> void:
	get_tree().paused = false
	get_tree().reload_current_scene()
