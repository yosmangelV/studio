extends Node
## Comprueba en headless los criterios de la seccion 7 contra el juego real.
## Los criterios 4 y 11 tienen una parte que solo se valida a ojo y con el dedo.

const PRINCIPAL := "res://escenas/principal.tscn"
const ESCENA_BALIZA := preload("res://escenas/baliza.tscn")
const ESCENA_PROYECTIL := preload("res://escenas/proyectil.tscn")

var _fallos := 0
var _originales := {}
var _juego: Node


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for ajuste: Dictionary in Config.AJUSTES:
		_originales[ajuste["nombre"]] = Config.get(ajuste["nombre"])
	_ejecutar.call_deferred()


func _ejecutar() -> void:
	get_tree().current_scene = null # Este nodo sobrevive a los cambios de escena.
	for prueba: Callable in [_c1_y_c8_derrota, _c2_desvio, _c3_fuera_de_radio, _c4_giro, _c5_espuma, _c6_determinismo, _c7_guia, _c8_victoria, _c9_panel, _c10_registro]:
		await prueba.call()
	print("RESULTADO: %d fallos" % _fallos)
	get_tree().quit(1 if _fallos > 0 else 0)


func _comprobar(criterio: String, condicion: bool, detalle: String = "") -> void:
	print("%s %s %s" % ["OK   " if condicion else "FALLO", criterio, detalle])
	if not condicion:
		_fallos += 1


func _cargar() -> void:
	for nombre: String in _originales:
		Config.set(nombre, _originales[nombre])
	get_tree().paused = false
	get_tree().change_scene_to_file(PRINCIPAL)
	await get_tree().process_frame
	await get_tree().process_frame
	_juego = get_tree().current_scene


func _simular(pasos: int) -> void:
	for _i in pasos:
		await get_tree().physics_frame


func _poner_baliza(x: float) -> Baliza:
	var baliza: Baliza = ESCENA_BALIZA.instantiate()
	baliza.position = Vector2(x, Config.SUELO_Y)
	_juego.get_node("Balizas").add_child(baliza)
	return baliza


func _c1_y_c8_derrota() -> void:
	await _cargar()
	await _simular(1500)
	_comprobar("1  avanza y destruye", _juego.integridad < Config.INTEGRIDAD_MAX, "integridad=%s" % _juego.integridad)
	await _simular(6000)
	_comprobar("8b integridad 0 da derrota", _juego.terminado and _juego.integridad <= 0.0)
	var destruidos := _juego.get_node("Edificios").get_children().filter(func(e: Edificio) -> bool: return not e.intacto)
	_comprobar("1  un edificio resta una sola vez", is_equal_approx(destruidos.size() * Config.dano_edificio, 102.0))


func _c2_desvio() -> void:
	await _cargar()
	var baliza := _poner_baliza(200.0)
	await _simular(2)
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	_comprobar("2  entra en ATRAIDO", monstruo.estado == Monstruo.Estado.ATRAIDO and monstruo.baliza_objetivo == baliza)
	await _simular(300)
	_comprobar("2  destruye la baliza", not is_instance_valid(baliza))
	_comprobar("2  retoma AVANZAR", monstruo.estado == Monstruo.Estado.AVANZAR)
	await _simular(30)
	_comprobar("2  retoma rumbo a la ciudad", monstruo.rumbo.y < 0.0 and monstruo.rumbo.x > 0.0, str(monstruo.rumbo))


func _c3_fuera_de_radio() -> void:
	await _cargar()
	var baliza := _poner_baliza(60.0 + Config.radio_baliza + 300.0)
	await _simular(60)
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	_comprobar("3  fuera de radio no hace nada", monstruo.estado == Monstruo.Estado.AVANZAR and is_instance_valid(baliza))


func _c4_giro() -> void:
	await _cargar()
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	monstruo.position = Vector2(300.0, Config.SUELO_Y)
	_poner_baliza(100.0)
	var maximo := 0.0
	var pasos_hasta_girar := 0
	for _i in 300:
		var previo := monstruo.rumbo
		await _simular(1)
		maximo = maxf(maximo, absf(previo.angle_to(monstruo.rumbo)))
		if monstruo.rumbo.dot(Vector2.LEFT) < 0.99:
			pasos_hasta_girar += 1
	_comprobar("4  giro limitado por paso", maximo <= deg_to_rad(Config.giro_monstruo) / 60.0 + 0.0001, "max=%f rad" % maximo)
	_comprobar("4  el giro dura frames", pasos_hasta_girar > 60, "%d pasos" % pasos_hasta_girar)


func _c5_espuma() -> void:
	await _cargar()
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	monstruo.position = Vector2(60.0, Config.BANDA_ALTA_Y) # A la altura del objetivo: rumbo constante.
	await _simular(10)
	var inicio := monstruo.position
	await _simular(30)
	var normal := monstruo.position.x - inicio.x
	var rumbo_previo := monstruo.rumbo
	var proyectil: Proyectil = ESCENA_PROYECTIL.instantiate()
	proyectil.tipo = Proyectil.Tipo.ESPUMA
	proyectil.posicion = monstruo.rect_mundo().get_center()
	proyectil.velocidad = Vector2.ZERO
	_juego.get_node("Proyectiles").add_child(proyectil)
	await _simular(3)
	_comprobar("5  impacto activa frenado", monstruo.frenado_restante > 0.0 and not is_instance_valid(proyectil))
	inicio = monstruo.position
	await _simular(30)
	var frenado := monstruo.position.x - inicio.x
	_comprobar("5  reduce la velocidad", is_equal_approx(snappedf(frenado / normal, 0.01), Config.fuerza_frenado), "ratio=%f" % (frenado / normal))
	_comprobar("5  no cambia el rumbo", monstruo.rumbo.is_equal_approx(rumbo_previo))


func _trayectoria() -> PackedVector2Array:
	var puntos := PackedVector2Array()
	var proyectil: Proyectil = ESCENA_PROYECTIL.instantiate()
	proyectil.tipo = Proyectil.Tipo.ESPUMA
	proyectil.posicion = Vector2(Config.LANZADOR_X, Config.SUELO_Y) + Config.BOCA_LANZADOR
	proyectil.velocidad = Proyectil.velocidad_inicial(120.0, 60.0)
	_juego.get_node("Proyectiles").add_child(proyectil)
	while is_instance_valid(proyectil):
		puntos.append(proyectil.posicion)
		await _simular(1)
	return puntos


func _c6_determinismo() -> void:
	await _cargar()
	var a := await _trayectoria()
	await _cargar()
	var b := await _trayectoria()
	_comprobar("6  misma trayectoria", a == b and a.size() > 10, "%d puntos" % a.size())


func _c7_guia() -> void:
	await _cargar()
	var guia: Line2D = _juego.get_node("Lanzador/GuiaTrayectoria")
	var longitud := 0.0
	for i in range(1, guia.points.size()):
		longitud += guia.points[i - 1].distance_to(guia.points[i])
	_comprobar("7  guia limitada", longitud <= Config.longitud_guia + 0.01 and guia.points.size() > 2, "longitud=%f" % longitud)
	_comprobar("7  no llega al suelo", guia.points[guia.points.size() - 1].y < 0.0)
	_juego.get_node("Interfaz/SliderPotencia").value = 80.0
	_comprobar("7  reacciona al slider", guia.points[1].length() > 0.0)


func _c8_victoria() -> void:
	await _cargar()
	var x := 200.0
	while x <= 1250.0: # La ultima cae dentro de la contencion: el monstruo toca la zona antes de alcanzarla.
		_poner_baliza(x)
		x += 150.0
	await _simular(2500)
	_comprobar("8a contencion da victoria sin tocar edificios", _juego.terminado and is_equal_approx(_juego.integridad, Config.INTEGRIDAD_MAX), "integridad=%s" % _juego.integridad)


func _c9_panel() -> void:
	await _cargar()
	var panel := _juego.get_node("Interfaz/PanelDepuracion")
	for ajuste: Dictionary in Config.AJUSTES:
		var slider: HSlider = panel._sliders[ajuste["nombre"]]
		slider.value = ajuste["min"] + ajuste["paso"] * 2.0
		_comprobar("9  " + ajuste["nombre"], is_equal_approx(Config.get(ajuste["nombre"]), slider.value))


func _c10_registro() -> void:
	await _cargar()
	var filas_antes := FileAccess.get_file_as_string(Registro.ruta).strip_edges().split("\n").size()
	_juego._terminar("derrota")
	var lineas := FileAccess.get_file_as_string(Registro.ruta).strip_edges().split("\n")
	_comprobar("10 una fila por intento", lineas.size() == filas_antes + 1, lineas[lineas.size() - 1])
	_comprobar("10 ocho columnas", lineas[lineas.size() - 1].split(",").size() == 8)
	get_tree().paused = false
