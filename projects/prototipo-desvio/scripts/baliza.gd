class_name Baliza
extends Area2D
## Activa hasta que el monstruo la alcanza. Sin duracion temporal.
## El radio visible es deliberado: el riesgo debe ser calculable.

const GRUPO := &"balizas"


func _ready() -> void:
	add_to_group(GRUPO)
	var forma := CircleShape2D.new()
	forma.radius = Config.RADIO_NUCLEO_BALIZA
	$Colision.shape = forma
	Config.valor_cambiado.connect(_al_cambiar_config)


func _draw() -> void:
	var relleno := Config.COLOR_BALIZA
	relleno.a = 0.18
	draw_circle(Vector2.ZERO, Config.radio_baliza, relleno)
	draw_circle(Vector2.ZERO, Config.RADIO_NUCLEO_BALIZA, Config.COLOR_BALIZA)


func destruir() -> void:
	remove_from_group(GRUPO)
	queue_free()


func _al_cambiar_config(nombre: String, _valor: float) -> void:
	if nombre == "radio_baliza":
		queue_redraw()
