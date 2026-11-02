extends Node
## Autoload. Una fila CSV por intento terminado, en texto plano y solo en local.
## Un intento abandonado con R no tiene resultado y no escribe fila, pero consume
## su numero: el hueco en n_intento hace visible el abandono.

const CARPETA := "user://registros"
const CABECERA := "id_sesion,n_intento,duracion_s,resultado,integridad_final,disparos_baliza,disparos_espuma,reinicio_tras"

var ruta: String
var _id_sesion: String
var _n_intento := 0
var _ultimo_resultado := "vacio"
var _archivo: FileAccess


func _ready() -> void:
	_id_sesion = str(int(Time.get_unix_time_from_system()))
	ruta = "%s/sesion_%s.csv" % [CARPETA, _id_sesion]
	DirAccess.make_dir_recursive_absolute(CARPETA)
	_archivo = FileAccess.open(ruta, FileAccess.WRITE)
	if _archivo == null:
		push_error("No se pudo abrir %s: %s" % [ruta, FileAccess.get_open_error()])
		return
	_archivo.store_line(CABECERA)
	_archivo.flush()


func iniciar_intento() -> void:
	_n_intento += 1


func registrar(duracion: float, resultado: String, integridad: float, balizas: int, espumas: int) -> void:
	if _archivo == null:
		return
	var campos := PackedStringArray([
		_id_sesion,
		str(_n_intento),
		"%.2f" % duracion,
		resultado,
		"%.0f" % integridad,
		str(balizas),
		str(espumas),
		_ultimo_resultado,
	])
	_archivo.store_line(",".join(campos))
	_archivo.flush()
	_ultimo_resultado = resultado
