extends Node2D
## Orquesta la partida: integridad, senales, fin del intento y registro.

var integridad: float = Config.INTEGRIDAD_MAX
var terminado := false
var resultado := "" # "victoria" o "derrota" al terminar.
var duracion: float = 0.0
var disparos := {Proyectil.Tipo.BALIZA: 0, Proyectil.Tipo.ESPUMA: 0}

@onready var _monstruo: Monstruo = $Monstruo
@onready var _barra: ProgressBar = $Interfaz/BarraIntegridad
@onready var _resultado: Label = $Interfaz/EtiquetaResultado
@onready var _panel: Panel = $Interfaz/PanelDepuracion


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for nodo: Node in [_monstruo, $Lanzador, $Proyectiles, $Balizas]:
		nodo.process_mode = Node.PROCESS_MODE_PAUSABLE
	Registro.iniciar_intento()
	_monstruo.position = Vector2(Config.ENTRADA_X, Config.SUELO_Y)
	_monstruo.edificio_golpeado.connect(_al_golpear_edificio)
	_monstruo.contencion_alcanzada.connect(_terminar.bind("victoria"))
	$Lanzador.disparo_realizado.connect(_al_disparar)
	var edificios := $Edificios.get_children()
	for i in edificios.size():
		var edificio: Edificio = edificios[i]
		edificio.position = Vector2(Config.EDIFICIOS_X[i], Config.SUELO_Y)
		edificio.destruido.connect(_al_destruir_edificio)
	_configurar_zona_contencion()
	_barra.max_value = Config.INTEGRIDAD_MAX
	_barra.value = integridad
	$Interfaz/BotonPanel.pressed.connect(_panel.alternar)


func _draw() -> void:
	var mundo := Config.MUNDO
	draw_rect(mundo, Config.COLOR_FONDO)
	draw_rect(Rect2(0.0, Config.SUELO_Y, mundo.size.x, mundo.end.y - Config.SUELO_Y), Config.COLOR_SUELO)
	draw_rect(Rect2(0.0, 0.0, Config.CONTENCION_X_MAX, Config.SUELO_Y), Config.COLOR_CONTENCION)


func _physics_process(delta: float) -> void:
	if not terminado:
		duracion += delta


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
	forma.size = Vector2(Config.CONTENCION_X_MAX, mundo.size.y)
	$ZonaContencion/Colision.shape = forma
	$ZonaContencion.position = Vector2(forma.size.x / 2.0, mundo.size.y / 2.0)


func _al_disparar(tipo: Proyectil.Tipo) -> void:
	disparos[tipo] += 1


func _al_golpear_edificio(edificio: Edificio) -> void:
	edificio.recibir_golpe()


func _al_destruir_edificio(_edificio: Edificio) -> void:
	integridad = maxf(integridad - Config.dano_edificio, 0.0)
	_barra.value = integridad
	if integridad <= 0.0 or not _quedan_edificios():
		_terminar("derrota")


## El lanzador esta sobre el ultimo edificio: sin edificios no hay arma, sea cual sea el dano.
func _quedan_edificios() -> bool:
	return $Edificios.get_children().any(func(edificio: Edificio) -> bool: return edificio.intacto)


## Escribe la fila al terminar, no al reiniciar: cerrar el juego tras perder no la pierde.
func _terminar(nuevo_resultado: String) -> void:
	if terminado:
		return
	terminado = true
	resultado = nuevo_resultado
	Registro.registrar(duracion, resultado, integridad, disparos[Proyectil.Tipo.BALIZA], disparos[Proyectil.Tipo.ESPUMA])
	_resultado.text = "%s. Toca o pulsa R para reiniciar" % resultado.capitalize()
	_resultado.visible = true
	get_tree().paused = true


func _reiniciar() -> void:
	get_tree().paused = false
	get_tree().reload_current_scene()
