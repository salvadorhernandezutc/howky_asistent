![Logo](./cross_asistent/static/img/UTC_logo-plano.webp)

# Proyecto Asistente Howky

Con el fin de resolver y atender las dudas sobre la UTC, tanto de administrativos, alumnos y visitantes, ademas de dar una nueva imagen a la UTC al recibir a los vistantes con esta aplicacion en las entradas de la universidad

### Paleta de colores

| Color      | Hex               |
| ---------- | ----------------- |
| Base       | #ffffff |
| Secundario | #c2c2c2 |
| Detalles   | #3b71ca |
| Extra      | #02913c |
| Oscuro     | #292f38 |


## Librerias
### Javascript:
  - ModelViewer
  - Mapbox
  - FullCalendar
  - TinyMCE
  - JQuery.Validate
  - JQuery Datatables

 ### Python:
  - Django
  - django-environ
  - pillow
  - gunicorn
  - whitenoise
  - nltk
  - openai

## Modelo 3D
En el proyecto se realizo un modelo 3D del halcon que representa a la UTC, desarrollado en blender, en conjunto por el TSU. Fransisco Malacara y el Ing. Salvador Hernandez.
Con el objetivo de ser la figura representativa del asistente, al estar directamente en el inicio del sitio y en el chat de conversacion, ademas se tiene contemplado ubicarlo en otros objetos y paginas del sitio, por ejemplo, en los varios tutoriales del sitio web.

### Colores del Modelo

| Colores      | Hex               |
| ------------ | ----------------- |
| Azul Intenso | #133362 |
| Azul Marino  | #0D223F |
| Gris Claro   | #95989D |
| Blanco       | #ffffff |
| Lima         | #77BD1F |
| Negro        | #000000 |


## Instalacion
 
Se requiere python 3.12.0 o superior y pip.
Para instalar todas las dependencias de python ANTES se debe tener **RUST** instalado, esto se puede verificar con:
```bash
rustc --version
cargo --version
```

### Entorno Virtual
Configura el entorno virtual para instalar las dependencias de python.
```bash
pip install virtualenv
virtualenv venv
```

Activar el Entorno virtual para trabajar en él y ejecutar python del entorno virtual en lugar de utilizarlo globalmente.
```bash
venv\Scripts\activate
```

### Requerimientos del Proyecto
Instala las dependencias definidas en requirements.txt, esto se debe instalar dentro de tu entorno virtual:
```bash
pip install -r requirements.txt
```

## Iniciar Django

### Base de Datos
Crear las tablas de los modelos definidos y los modelos iniciales propios de Django.
```bash
python manage.py makemigrations
python manage.py migrate
```
![note](https://img.shields.io/badge/NOTA-Importante-blue)
Las aplicaciones creadas deben estar definidas en el proyecto, se definen en **INSTALLED_APPS** de settings.py [`\cross_project\settings.py`](/cross_project/settings.py)

### Crear Usuario Administrador
Este es un usuario importante para manjar tanto la base de datos como el uso de las tablas y modelos locales de DJango.
Antes de crearlo se requiere un nombre de usuario, email (opcional) y una contraseña que se repetirá para completar el proceso.
```bash
python manage.py createsuperuser
```

### Levantar servidor local

Ejecuta:
```bash
py manage.py runserver
```

Despues puedes acceder a [http://127.0.0.1:8000/](http://127.0.0.1:8000/) o puedes hacer click en el mismo link en la terminal si es que lo permite.
