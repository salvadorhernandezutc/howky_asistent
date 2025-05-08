![Logo](./static/img/UTC_logo-plano.webp)

# Proyecto Asistente Howky

Con el fin de resolver y atender las dudas sobre la UTC, tanto de administrativos, alumnos y visitantes, ademas de dar una nueva imagen a la UTC al recibir a los vistantes con esta aplicacion en las entradas de la universidad

### Paleta de colores

| Color      | Hex               |
| ---------- | ----------------- |
| Base       | <span style="display:inline-block;width:12px;height:12px;background-color:#ffffff;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #ffffff |
| Secundario | <span style="display:inline-block;width:12px;height:12px;background-color:#c2c2c2;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #c2c2c2 |
| Detalles   | <span style="display:inline-block;width:12px;height:12px;background-color:#3b71ca;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #3b71ca |
| Extra      | <span style="display:inline-block;width:12px;height:12px;background-color:#02913c;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #02913c |
| Oscuro     | <span style="display:inline-block;width:12px;height:12px;background-color:#292f38;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #292f38 |


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
| Azul Intenso | <span style="display:inline-block;width:12px;height:12px;background-color:#133362;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #133362 |
| Azul Marino  | <span style="display:inline-block;width:12px;height:12px;background-color:#0D223F;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #0D223F |
| Gris Claro   | <span style="display:inline-block;width:12px;height:12px;background-color:#95989D;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #95989D |
| Blanco       | <span style="display:inline-block;width:12px;height:12px;background-color:#ffffff;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #ffffff |
| Lima         | <span style="display:inline-block;width:12px;height:12px;background-color:#77BD1F;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #77BD1F |
| Negro        | <span style="display:inline-block;width:12px;height:12px;background-color:#000000;border:1px solid #ccc;border-radius:2px;margin-right:4px;"></span> #000000 |


## Instalacion
 
Se requiere python 3.12.0 o superior y pip.
Para instalar todas las dependencias de python ANTES se debe tener RUST instalado, esto se puede verificar con:
```sh
rustc --version
```
```sh
cargo --version
```
De no tenerlo entonces se requiere su instalacion.
Posteriormente se instalan todas las dependencias de los requerimientos:
```sh
pip install -r requirements.txt
```
