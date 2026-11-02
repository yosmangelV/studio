class_name Proyectil
extends Node2D
## Integracion manual y determinista, a paso fijo. La guia del lanzador reutiliza
## las mismas funciones para que su arco coincida con el del proyectil real.

enum Tipo { BALIZA, ESPUMA }

const ESCENA_BALIZA := preload("res://escenas/baliza.tscn")

var tipo: Tipo = Tipo.BALIZA
var posicion: Vector2
var velocidad: Vector2
var contenedor_balizas: Node


static func velocidad_inicial(angulo_grados: float, potencia: float) -> Vector2:
	var angulo := deg_to_rad(angulo_grados)
	return Vector2(cos(-angulo), sin(-angulo)) * potencia * Config.escala_potencia


static func velocidad_tras_paso(velocidad_previa: Vector2, delta: float) -> Vector2:
	return velocidad_previa + Vector2(0.0, Config.gravedad_proyectil * delta)


func _ready() -> void:
	position = posicion


func _draw() -> void:
	var color := Config.COLOR_BALIZA if tipo == Tipo.BALIZA else Config.COLOR_ESPUMA
	draw_circle(Vector2.ZERO, Config.RADIO_PROYECTIL, color)


func _physics_process(delta: float) -> void:
	velocidad = velocidad_tras_paso(velocidad, delta)
	posicion += velocidad * delta
	position = posicion
	if tipo == Tipo.ESPUMA and _impactar_monstruo():
		queue_free()
	elif posicion.y >= Config.SUELO_Y:
		_al_tocar_suelo()
		queue_free()
	elif not Config.MUNDO.has_point(posicion):
		queue_free()


func _impactar_monstruo() -> bool:
	var monstruo := get_tree().get_first_node_in_group(Monstruo.GRUPO) as Monstruo
	if monstruo == null or not monstruo.rect_mundo().has_point(posicion):
		return false
	monstruo.frenar()
	return true


func _al_tocar_suelo() -> void:
	if tipo != Tipo.BALIZA or not Config.MUNDO.has_point(Vector2(posicion.x, Config.SUELO_Y)):
		return
	var baliza: Baliza = ESCENA_BALIZA.instantiate()
	baliza.position = Vector2(posicion.x, Config.SUELO_Y)
	contenedor_balizas.add_child(baliza)
