# Siguientes pasos: compilación nativa y validación

Estado a 8 de noviembre de 2026. Documento de trabajo: se actualiza al cerrar cada paso.

## Dónde estamos

- **Prototipo:** fusionado en `main` (PR #31). Pasa sus pruebas de aceptación en CI, en headless y con ventana virtual.
- **Prueba informal en móvil:** se hizo con la versión web en un iPhone. Sirvió para descubrir dos problemas, pero la web queda descartada: a partir de aquí, solo compilación nativa.
- **Destino:**
  - **iOS:** el iPhone del autor. Ahí se harán las pruebas de validación: se le pasa el móvil a cada persona.
  - **Android:** los móviles de los demás, para que jueguen por su cuenta.

## Comentarios recibidos (no cuentan como validación)

Las dos personas jugaron en el móvil, **en vertical**, con la versión web.

| Persona | Qué dijo | Lectura |
|---|---|---|
| Hermano | Le costó entender qué era y no descubrió cómo llevar al monstruo a la zona verde. | Es el fallo del criterio 1 de la especificación, pero no es concluyente: jugó con controles diminutos. |
| Sobrino | Entendió todo, pero le pareció aburrido y no pudo ganar. Los controles eran muy pequeños e incómodos. | Confirma que falla el criterio 11 (control con el dedo). El "aburrido" no es fiable mientras no pueda apuntar. |

- **Por qué los controles salían tan pequeños:** el juego está pensado para 1280×720 y se reduce para caber en pantalla.
  - En horizontal, en un iPhone se ve a unos dos tercios de su tamaño, y el tirador del slider queda de unos 10 pt.
  - En vertical se ve a menos de un tercio, y el tirador queda de unos 5 pt.
  - Un dedo necesita unos 44 pt.
- **Ninguno de los dos puede ser tester de validación:** ya conocen el juego. Sí pueden volver a probar los controles.

## Orden de trabajo

1. Preparar el entorno desde cero (sección 1).
2. Crear los presets de exportación de iOS y Android (cambio de código 2). Sin ellos, los comandos de exportación fallan.
3. Compilar para iOS e instalar en el iPhone del autor (sección 3).
4. Comprobar los controles en horizontal con el hermano o el sobrino. Si siguen siendo pequeños, hacer el cambio de código 1.
5. Compilar para Android y repartir el APK.
6. Hacer la validación con tres personas nuevas (sección 4).

## 1. Entorno desde cero (macOS)

Todo se instala por usuario. Lo que pide contraseña de administrador lo tiene que ejecutar la persona, no un agente.

### Base

```bash
# Homebrew: https://brew.sh
brew install --cask godot          # Godot 4.7.2; el CI usa esa misma versión
brew install node@22               # Para los scripts npm del monorepo
# node@22 es keg-only: Homebrew no lo pone en el PATH por sí solo.
echo 'export PATH="$(brew --prefix node@22)/bin:$PATH"' >> ~/.zprofile
export PATH="$(brew --prefix node@22)/bin:$PATH"
cd <repo> && npm ci
npm run diversion:test             # Debe terminar con "RESULT: 0 failures"
```

### Plantillas de exportación de Godot

Paquete de 1,2 GB. Solo se necesitan las plantillas de iOS y Android.

```bash
V=4.7.2-stable
curl -fsSL -o templates.tpz "https://github.com/godotengine/godot/releases/download/$V/Godot_v${V}_export_templates.tpz"
# SHA-256 publicado por GitHub para ese asset:
echo "f298490b8d44d934be425a5a65a51bf15f422428b229a06a6e11d9ffea248011  templates.tpz" | shasum -a 256 -c
T="$HOME/Library/Application Support/Godot/export_templates/4.7.2.stable"
mkdir -p "$T"
unzip -q -o -j templates.tpz 'templates/version.txt' 'templates/ios.zip' 'templates/android_*' -d "$T"
rm templates.tpz
```

### iOS

1. **Xcode:** instalarlo desde la App Store (unos 15 GB) y abrirlo una vez para que instale sus componentes.
2. **Apple ID:** en Xcode, Settings y después Accounts, añadir el Apple ID. La cuenta gratuita basta: firma como "Personal Team".
3. **Identificador del equipo:** Godot lo exige antes de exportar (`application/app_store_team_id`); elegir el equipo en Xcode después no basta. Para obtenerlo:
   - En Xcode, Settings, Accounts, Manage Certificates, pulsar + y crear un certificado "Apple Development".
   - Leer el identificador, que es el `OU` de diez caracteres:
     ```bash
     security find-certificate -c "Apple Development" -p | openssl x509 -noout -subject
     ```
   - Ponerlo en el preset de iOS desde Godot (Project, Export, iOS). Es un dato personal: no se sube al repo si el preset va a ser compartido.
4. **iPhone:** activar Ajustes, Privacidad y seguridad, Modo desarrollador, y reiniciar.
5. **Límite de la cuenta gratuita:** la app caduca a los 7 días y solo se instala por cable desde el Mac. Para renovarla se vuelve a instalar. TestFlight requiere la cuenta de pago (99 $/año) y solo tiene sentido si el prototipo pasa la validación.

### Android

```bash
brew install --cask temurin@17                # JDK 17; pide contraseña de administrador
brew install --cask android-commandlinetools  # sdkmanager
# El SDK vive donde lo instala el cask; adb queda en platform-tools, fuera del PATH.
echo 'export ANDROID_HOME="$(brew --prefix)/share/android-commandlinetools"' >> ~/.zprofile
echo 'export PATH="$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zprofile
source ~/.zprofile
# Versiones exactas: guía "Exporting for Android" de Godot 4.7. Comprobarlas antes de instalar.
sdkmanager "platform-tools" "build-tools;35.0.1" "platforms;android-35"
adb version                                   # Comprueba que adb está en el PATH
```

- **Clave de firma de depuración:** no se sube al repo.
  ```bash
  keytool -genkeypair -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey \
    -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
  ```
- **Configuración de Godot:** en Editor Settings, Export y después Android, indicar la ruta del JDK (`/usr/libexec/java_home -v 17`), la del SDK (`$ANDROID_HOME`) y la de la clave de depuración.
- **Activar la depuración USB en cada Android:** solo si se va a instalar por cable con `adb install`. Si no, basta con mandar el APK y permitir "instalar apps de origen desconocido".

## 2. Cambios de código pendientes

Cada uno va en su propio PR, con su comprobación en `tests/acceptance.gd`.

1. **Controles grandes:** tiradores y sliders de al menos 44 pt en un iPhone en horizontal, y botones +1/−1 para el ángulo y la potencia. Es el criterio 11 de la especificación técnica.
2. **Presets de exportación en el repo:** `export_presets.cfg` con iOS y Android.
   - **Orientación:** solo horizontal (`window/handheld/orientation=0` ya está en `project.godot`; comprobar que el preset lo respeta).
   - **Filtro de exportación:** excluir `tests/*`, `docs/*`, `tools/*` y `logs/*`.
   - **iOS:** identificador de paquete propio, `user_data/accessible_from_files_app=true` para sacar el CSV desde la app Archivos, y `application/export_project_only=true` para que Godot genere solo el proyecto de Xcode y la firma se haga en Xcode.
   - **Secretos:** ni contraseñas ni claves en el repo. Godot guarda las credenciales en `.godot/export_credentials.cfg`, que ya está ignorado.
3. **Registro accesible en Android:** ahora `SessionLog` escribe en `user://logs`, dentro del almacenamiento privado de la app. Para que los testers puedan mandar el CSV, escribir también en una carpeta accesible o añadir un botón para compartirlo. Por decidir.
4. **APK en CI:** un paso en `ci-diversion-prototype.yml` que genere el APK de depuración y lo publique como artefacto en cada push a `main`. El paso de Godot ya verifica su hash; el de las plantillas tendría que verificar el suyo igual.
5. **Scripts npm:** `diversion:export:ios` y `diversion:export:android`, igual que los existentes.

## 3. Compilar e instalar

Desde la raíz del repo. Godot resuelve las rutas de salida relativas desde la carpeta del proyecto, así que los archivos quedan en `projects/diversion-prototype/build/`.

```bash
P=projects/diversion-prototype
mkdir -p "$P/build/ios" "$P/build/android"   # Godot no crea la carpeta de destino
node $P/tools/godot.mjs --headless --import
# iOS: genera un proyecto de Xcode
node $P/tools/godot.mjs --headless --export-debug "iOS" build/ios/DiversionPrototype.xcodeproj
# Android: genera el APK
node $P/tools/godot.mjs --headless --export-debug "Android" build/android/diversion-prototype.apk
```

- **iOS:** abrir `projects/diversion-prototype/build/ios/DiversionPrototype.xcodeproj` y comprobar en Signing & Capabilities que aparece el "Personal Team". Conectar el iPhone y darle a Play. La primera vez, en el iPhone, ir a Ajustes, General, VPN y gestión de dispositivos, y confiar en el desarrollador.
- **Android:** instalar con `adb install projects/diversion-prototype/build/android/diversion-prototype.apk`, o mandar el archivo.
- **`build/`:** no debe entrar en el repo. Añadirlo al `.gitignore` del proyecto con el primer preset.

## 4. Validación (sección 7 de la especificación)

- **Quién:** tres personas sin contexto previo, que no sean ni el hermano ni el sobrino.
- **Instrucción única:** "saca al bicho de la ciudad".
- **Cómo:** el móvil del autor, siempre en horizontal, sin explicar nada.
- **Una sesión por persona:** cerrar la app del todo y volver a abrirla antes de cada participante. Cada arranque crea un CSV nuevo, y si no se cierra, el primer intento de la persona siguiente quedaría encadenado al último resultado de la anterior. Apuntar qué archivo (`session_<id>.csv`) corresponde a quién.
- **Qué apuntar durante la observación:**
  - Si entienden la mecánica de la baliza sin explicación (criterio 1 de éxito).
  - Si repiten tras perder sin que se les pida (criterio 2), y en qué momento.
  - Si verbalizan intención espacial, del tipo "si lo pongo ahí, lo llevo hacia allá" (criterio 3).
  - Si preguntan cómo se juega (criterio de fallo).
  - Si intentan dañar al monstruo (criterio de fallo).
  - Si lo resuelven a la primera sin pensar (criterio de fallo: falta tensión).
- **Después:** sacar los CSV desde la app Archivos y cruzarlos con las notas. El CSV solo escribe `restarted_after` cuando termina el intento siguiente: si alguien reinicia tras perder y abandona antes de terminar, ese reinicio no aparece en el archivo. Por eso cada reinicio tras una derrota se apunta en las notas, aunque la persona lo deje a medias.
