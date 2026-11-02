class_name Baliza
extends Area2D
## Activa hasta que el monstruo la alcanza o se agota `duracion_baliza`.
## El radio visible es deliberado: el riesgo debe ser calculable. Los anillos muestran
## que atrae mas cerca del centro, y su opacidad, la energia que le queda.

const GRUPO := &"balizas"

var edad: float = 0.0


func _ready() -> void:
	add_to_group(GRUPO)
	var forma := CircleShape2D.new()
	forma.radius = Config.RADIO_NUCLEO_BALIZA
	$Colision.shape = forma


func _physics_process(delta: float) -> void:
	edad += delta
	if edad >= Config.duracion_baliza:
		destruir()
	else:
		queue_redraw()


func _draw() -> void:
	var relleno := Config.COLOR_BALIZA
	relleno.a = Config.ALFA_ANILLO_BALIZA * (1.0 - edad / Config.duracion_baliza)
	for anillo in range(1, Config.ANILLOS_BALIZA + 1):
		draw_circle(Vector2.ZERO, Config.radio_baliza * anillo / Config.ANILLOS_BALIZA, relleno)
	draw_circle(Vector2.ZERO, Config.RADIO_NUCLEO_BALIZA, Config.COLOR_BALIZA)


func destruir() -> void:
	remove_from_group(GRUPO)
	queue_free()
