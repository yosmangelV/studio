extends Node
## Comprueba en headless los criterios de la seccion 7 contra el juego real.
## Los criterios 4 y 11 tienen una parte que solo se valida a ojo y con el dedo.

const PRINCIPAL := "res://escenas/principal.tscn"
const ESCENA_BALIZA := preload("res://escenas/baliza.tscn")
const ESCENA_PROYECTIL := preload("res://escenas/proyectil.tscn")

## Un error de script aborta la prueba sin marcar fallo: contar las comprobaciones lo delata.
const COMPROBACIONES_GUI := 5
const COMPROBACIONES_ESPERADAS := 58

var _fallos := 0
var _comprobaciones := 0
var _originales := {}
var _juego: Node


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for ajuste: Dictionary in Config.AJUSTES:
		_originales[ajuste["nombre"]] = Config.get(ajuste["nombre"])
	_ejecutar.call_deferred()


func _ejecutar() -> void:
	get_tree().current_scene = null # Este nodo sobrevive a los cambios de escena.
	for prueba: Callable in [_c1_y_c8_derrota, _c2_desvio, _c3_fuera_de_radio, _c4_giro, _c5_espuma, _c6_determinismo, _c7_guia, _proyectil_inmovil_caduca, _c8_victoria, _c9_panel, _c10_registro, _baliza_se_apaga, _atraccion_por_distancia, _lanzador_en_ultimo_edificio, _lanzamiento_real, _toques, _reinicio, _partida_con_disparos_reales]:
		await prueba.call()
	var esperadas := COMPROBACIONES_ESPERADAS - (COMPROBACIONES_GUI if _sin_ventana() else 0)
	_comprobar("Todas las comprobaciones se ejecutaron", _comprobaciones == esperadas, "%d de %d" % [_comprobaciones, esperadas])
	print("RESULTADO: %d fallos" % _fallos)
	get_tree().quit(1 if _fallos > 0 else 0)


func _sin_ventana() -> bool:
	return DisplayServer.get_name() == "headless"


func _comprobar(criterio: String, condicion: bool, detalle: String = "") -> void:
	_comprobaciones += 1
	print("%s %s %s" % ["OK   " if condicion else "FALLO", criterio, detalle])
	if not condicion:
		_fallos += 1


func _cargar() -> void:
	for nombre: String in _originales:
		Config.set(nombre, _originales[nombre])
	get_tree().paused = false
	get_tree().change_scene_to_file(PRINCIPAL)
	await get_tree().scene_changed
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
	await _simular(1800)
	_comprobar("1  avanza y destruye", _juego.integridad < Config.INTEGRIDAD_MAX, "integridad=%s" % _juego.integridad)
	await _simular(6000)
	_comprobar("8b integridad 0 da derrota", _juego.resultado == "derrota" and _juego.integridad <= 0.0)
	var destruidos := _juego.get_node("Edificios").get_children().filter(func(e: Edificio) -> bool: return not e.intacto)
	_comprobar("1  un edificio resta una sola vez", is_equal_approx(destruidos.size() * Config.dano_edificio, 102.0))


func _c2_desvio() -> void:
	await _cargar()
	Config.duracion_baliza = 60.0 # Que la destruya el monstruo, no el tiempo.
	var baliza := _poner_baliza(Config.ENTRADA_X - 120.0) # Detras: obliga a invertir la marcha.
	await _simular(2)
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	_comprobar("2  entra en ATRAIDO", monstruo.estado == Monstruo.Estado.ATRAIDO and monstruo.baliza_objetivo == baliza)
	await _simular(600)
	_comprobar("2  destruye la baliza", not is_instance_valid(baliza))
	_comprobar("2  retoma AVANZAR", monstruo.estado == Monstruo.Estado.AVANZAR)
	await _simular(180)
	_comprobar("2  retoma rumbo a la ciudad", monstruo.rumbo.x > 0.9, str(monstruo.rumbo))


func _c3_fuera_de_radio() -> void:
	await _cargar()
	var baliza := _poner_baliza(Config.ENTRADA_X + Config.radio_baliza + 100.0)
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
	_comprobar("4  giro limitado por paso", maximo <= deg_to_rad(Config.giro_monstruo) / Engine.physics_ticks_per_second + 0.0001, "max=%f rad" % maximo)
	_comprobar("4  el giro dura frames", pasos_hasta_girar > 60, "%d pasos" % pasos_hasta_girar)


func _c5_espuma() -> void:
	await _cargar()
	var monstruo: Monstruo = _juego.get_node("Monstruo")
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
	_juego.get_node("Interfaz/SliderPotencia").value = 5.0
	var final_bajo := guia.points[guia.points.size() - 1]
	_comprobar("7  con potencia baja se corta lejos del suelo", -final_bajo.y > -Config.BOCA_LANZADOR.y / 2.0, str(final_bajo))
	_juego.get_node("Interfaz/SliderPotencia").value = 60.0
	Config.longitud_guia = 1000.0
	var final_largo := guia.points[guia.points.size() - 1]
	_comprobar("7  una guia larga no llega al impacto", -final_largo.y > -Config.BOCA_LANZADOR.y / 2.0, str(final_largo))


func _proyectil_inmovil_caduca() -> void:
	await _cargar()
	Config.gravedad_proyectil = 0.0
	_juego.get_node("Interfaz/SliderPotencia").value = 0.0
	_juego.get_node("Lanzador").lanzar()
	await _simular(int(Config.VIDA_MAX_PROYECTIL * Engine.physics_ticks_per_second) - 10)
	_comprobar("P  el proyectil inmovil sigue vivo antes de caducar", _juego.get_node("Proyectiles").get_child_count() == 1)
	await _simular(15)
	_comprobar("P  un proyectil inmovil se elimina", _juego.get_node("Proyectiles").get_child_count() == 0)


func _c8_victoria() -> void:
	await _cargar()
	Config.duracion_baliza = 60.0
	_poner_baliza(150.0)
	_poner_baliza(20.0) # Dentro de la contencion: el monstruo toca la zona antes de alcanzarla.
	await _simular(2500)
	_comprobar("8a contencion da victoria sin tocar edificios", _juego.resultado == "victoria" and is_equal_approx(_juego.integridad, Config.INTEGRIDAD_MAX), "integridad=%s" % _juego.integridad)


func _c9_panel() -> void:
	await _cargar()
	var panel := _juego.get_node("Interfaz/PanelDepuracion")
	for ajuste: Dictionary in Config.AJUSTES:
		var slider: HSlider = panel._sliders[ajuste["nombre"]]
		slider.value = ajuste["min"] + ajuste["paso"] * 2.0
		_comprobar("9  " + ajuste["nombre"], is_equal_approx(Config.get(ajuste["nombre"]), slider.value))


func _baliza_se_apaga() -> void:
	await _cargar()
	Config.duracion_baliza = 1.0
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	var baliza := _poner_baliza(Config.ENTRADA_X - 200.0)
	await _simular(30)
	_comprobar("B  atrae mientras tiene energia", monstruo.estado == Monstruo.Estado.ATRAIDO)
	await _simular(45)
	_comprobar("B  se apaga sola y el monstruo retoma AVANZAR", not is_instance_valid(baliza) and monstruo.estado == Monstruo.Estado.AVANZAR)
	await _simular(180)
	_comprobar("B  retoma rumbo a la ciudad", monstruo.rumbo.x > 0.9, str(monstruo.rumbo))


## Distancia recorrida en un tramo corto, ya orientado hacia la baliza.
func _avance_atraido(distancia: float) -> float:
	await _cargar()
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	monstruo.rumbo = Vector2.LEFT
	_poner_baliza(Config.ENTRADA_X - distancia)
	await _simular(2)
	var inicio := monstruo.position.x
	await _simular(6)
	return inicio - monstruo.position.x


func _atraccion_por_distancia() -> void:
	var lejos := await _avance_atraido(Config.radio_baliza - 5.0)
	var cerca := await _avance_atraido(70.0)
	var paso := Config.velocidad_monstruo * 6.0 / Engine.physics_ticks_per_second
	_comprobar("A  el borde del radio atrae a la velocidad minima", absf(lejos / paso - 0.265) < 0.02, "%.3f" % (lejos / paso))
	_comprobar("A  cerca del centro atrae mas", absf(cerca / paso - 0.79) < 0.02, "%.3f" % (cerca / paso))


func _lanzador_en_ultimo_edificio() -> void:
	await _cargar()
	var edificios := _juego.get_node("Edificios").get_children()
	_comprobar("E  el lanzador esta sobre el ultimo edificio", is_equal_approx(_juego.get_node("Lanzador").position.x, edificios[edificios.size() - 1].position.x))
	Config.dano_edificio = 1.0
	for edificio: Edificio in edificios:
		edificio.recibir_golpe()
	_comprobar("E  sin edificios hay derrota aunque quede integridad", _juego.resultado == "derrota" and _juego.integridad > 0.0)
	get_tree().paused = false


func _pulsar_en(punto: Vector2, soltar := true) -> void:
	var toque := InputEventScreenTouch.new()
	toque.position = punto
	toque.pressed = true
	Input.parse_input_event(toque)
	Input.flush_buffered_events()
	await get_tree().process_frame
	if soltar:
		var fin := InputEventScreenTouch.new()
		fin.position = punto
		fin.pressed = false
		Input.parse_input_event(fin)
		Input.flush_buffered_events()
		await get_tree().process_frame


func _centro(ruta: String) -> Vector2:
	return (_juego.get_node(ruta) as Control).get_global_rect().get_center()


func _lanzamiento_real() -> void:
	await _cargar()
	var lanzador := _juego.get_node("Lanzador")
	var balizas := _juego.get_node("Balizas")
	_juego.get_node("Interfaz/SliderAngulo").value = 135.0
	_juego.get_node("Interfaz/SliderPotencia").value = 60.0
	lanzador.lanzar()
	lanzador.lanzar()
	_comprobar("L  la recarga bloquea el segundo disparo", _juego.get_node("Proyectiles").get_child_count() == 1 and _juego.disparos[Proyectil.Tipo.BALIZA] == 1)
	await _simular(180)
	_comprobar("L  el proyectil crea una baliza en el suelo", balizas.get_child_count() == 1 and is_equal_approx(balizas.get_child(0).position.y, Config.SUELO_Y))
	var duplicada: Vector2 = balizas.get_child(0).position
	await _cargar()
	_juego.get_node("Interfaz/SliderAngulo").value = 135.0
	_juego.get_node("Interfaz/SliderPotencia").value = 60.0
	_juego.get_node("Lanzador").lanzar()
	await _simular(180)
	_comprobar("L  misma caida con los mismos sliders", _juego.get_node("Balizas").get_child(0).position == duplicada, str(duplicada))
	await _cargar()
	_juego.get_node("Interfaz/SelectorArma/BotonEspuma").pressed.emit()
	_juego.get_node("Lanzador").lanzar()
	await _simular(180)
	_comprobar("L  la espuma fallida no deja nada", _juego.get_node("Balizas").get_child_count() == 0 and _juego.get_node("Monstruo").frenado_restante == 0.0)
	await _cargar()
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	await _simular(30)
	var inicio := monstruo.position
	await _simular(10)
	var lento := inicio.distance_to(monstruo.position)
	Config.velocidad_monstruo = Config.velocidad_monstruo * 2.0
	inicio = monstruo.position
	await _simular(10)
	_comprobar("9  el cambio afecta al juego en marcha", is_equal_approx(snappedf(inicio.distance_to(monstruo.position) / lento, 0.01), 2.0))


func _toques() -> void:
	if _sin_ventana():
		print("OMITIDO toques en la interfaz: en headless no llegan; ejecutar con ventana")
		return
	await _cargar()
	var slider: HSlider = _juego.get_node("Interfaz/SliderPotencia")
	var previo := slider.value
	var rect := slider.get_global_rect()
	await _pulsar_en(rect.position + rect.size * Vector2(0.9, 0.5))
	_comprobar("11 toque emulado mueve el slider", slider.value > previo, "%s -> %s" % [previo, slider.value])
	await _pulsar_en(_centro("Interfaz/SelectorArma/BotonEspuma"))
	_comprobar("11 toque emulado cambia de arma", _juego.get_node("Lanzador").arma == Proyectil.Tipo.ESPUMA)
	await _pulsar_en(_centro("Interfaz/BotonLanzar"))
	_comprobar("11 toque emulado lanza", _juego.disparos[Proyectil.Tipo.ESPUMA] == 1)
	await _pulsar_en(_centro("Interfaz/BotonPanel"))
	_comprobar("11 toque emulado abre el panel", _juego.get_node("Interfaz/PanelDepuracion").visible)
	_comprobar("11 toque en partida no reinicia", _juego == get_tree().current_scene and not _juego.terminado)


func _reinicio() -> void:
	await _cargar()
	var anterior := _juego
	_juego._terminar("derrota")
	await _pulsar_en(Vector2(640.0, 300.0), false)
	await get_tree().process_frame
	await get_tree().process_frame
	_comprobar("R  toque al terminar reinicia", get_tree().current_scene != anterior and not get_tree().paused)
	_juego = get_tree().current_scene
	anterior = _juego
	var tecla := InputEventKey.new()
	tecla.physical_keycode = KEY_R
	tecla.pressed = true
	Input.parse_input_event(tecla)
	Input.flush_buffered_events()
	await get_tree().process_frame
	await get_tree().process_frame
	await get_tree().process_frame
	_comprobar("R  tecla R reinicia en partida", get_tree().current_scene != anterior)


## Jugador automatico: solo usa sliders y lanzar. Demuestra que se puede ganar
## con los valores de arranque, no que sea divertido.
func _partida_con_disparos_reales() -> void:
	await _cargar()
	var monstruo: Monstruo = _juego.get_node("Monstruo")
	var lanzador := _juego.get_node("Lanzador")
	for _i in 6000:
		if _juego.terminado:
			break
		var hay_delante := false
		for baliza: Node in _juego.get_node("Balizas").get_children():
			if monstruo.position.x - baliza.position.x > 110.0: # Sigue activa cuando llegue la siguiente.
				hay_delante = true
		if not hay_delante and _juego.get_node("Proyectiles").get_child_count() == 0 and lanzador.recarga_restante <= 0.0:
			_apuntar(maxf(monstruo.position.x - 200.0, 30.0))
			lanzador.lanzar()
		await _simular(1)
	_comprobar("V  ganable con disparos reales", _juego.resultado == "victoria" and _juego.integridad > 0.0, "resultado=%s integridad=%s balizas=%d duracion=%.1fs" % [_juego.resultado, _juego.integridad, _juego.disparos[Proyectil.Tipo.BALIZA], _juego.duracion])


func _apuntar(objetivo_x: float) -> void:
	var boca := Vector2(Config.LANZADOR_X, Config.SUELO_Y) + Config.BOCA_LANZADOR
	var angulo := 135.0 if objetivo_x < boca.x else 45.0
	var mejor := 0.0
	var error := INF
	for potencia in 101:
		var p := boca
		var v := Proyectil.velocidad_inicial(angulo, potencia)
		while p.y < Config.SUELO_Y:
			v = Proyectil.velocidad_tras_paso(v, Config.PASO_FIJO)
			p += v * Config.PASO_FIJO
		if absf(p.x - objetivo_x) < error:
			error = absf(p.x - objetivo_x)
			mejor = potencia
	_juego.get_node("Interfaz/SliderAngulo").value = angulo
	_juego.get_node("Interfaz/SliderPotencia").value = mejor


func _c10_registro() -> void:
	await _cargar()
	var filas_antes := FileAccess.get_file_as_string(Registro.ruta).strip_edges().split("\n").size()
	# Leidos antes de terminar: no dependen del orden de las pruebas anteriores.
	var esperado := PackedStringArray([
		Registro._id_sesion,
		str(Registro._n_intento),
		"%.2f" % _juego.duracion,
		"derrota",
		"%.0f" % _juego.integridad,
		str(_juego.disparos[Proyectil.Tipo.BALIZA]),
		str(_juego.disparos[Proyectil.Tipo.ESPUMA]),
		Registro._ultimo_resultado,
	])
	_juego._terminar("derrota")
	var lineas := FileAccess.get_file_as_string(Registro.ruta).strip_edges().split("\n")
	var campos := lineas[lineas.size() - 1].split(",")
	_comprobar("10 una fila por intento", lineas.size() == filas_antes + 1, lineas[lineas.size() - 1])
	_comprobar("10 ocho columnas", campos.size() == 8)
	_comprobar("10 contenido registrado", campos == esperado, "%s vs %s" % [",".join(campos), ",".join(esperado)])
	_comprobar("10 reinicio_tras encadena el intento anterior", Registro._ultimo_resultado == "derrota")
	get_tree().paused = false
