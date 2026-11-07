extends Node
## Autoload. One CSV row per finished attempt, plain text and local only.
## An attempt abandoned with R has no result and writes no row, but it uses up its
## number: the gap in `attempt` makes the abandon visible.

const FOLDER := "user://logs"
const HEADER := "session_id,attempt,duration_s,result,final_integrity,beacon_shots,foam_shots,restarted_after"
const NO_PREVIOUS_RESULT := "none"

var path: String
var _session_id: String
var _attempt := 0
var _last_result := NO_PREVIOUS_RESULT
var _file: FileAccess


func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(FOLDER)
	# The process id keeps two launches in the same second, even concurrent ones, from
	# sharing a file; the suffix covers the OS reusing an id.
	var base := "%d_%d" % [int(Time.get_unix_time_from_system()), OS.get_process_id()]
	_session_id = base
	var suffix := 1
	while FileAccess.file_exists(_path_for(_session_id)):
		suffix += 1
		_session_id = "%s_%d" % [base, suffix]
	path = _path_for(_session_id)
	_file = FileAccess.open(path, FileAccess.WRITE)
	if _file == null:
		push_error("Could not open %s: %s" % [path, FileAccess.get_open_error()])
		return
	_file.store_line(HEADER)
	_file.flush()


func _path_for(session_id: String) -> String:
	return "%s/session_%s.csv" % [FOLDER, session_id]


func start_attempt() -> void:
	_attempt += 1


func record(duration: float, result: String, integrity: float, beacon_shots: int, foam_shots: int) -> void:
	if _file == null:
		return
	var fields := PackedStringArray([
		_session_id,
		str(_attempt),
		"%.2f" % duration,
		result,
		"%.0f" % integrity,
		str(beacon_shots),
		str(foam_shots),
		_last_result,
	])
	_file.store_line(",".join(fields))
	_file.flush()
	_last_result = result
