from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.http import JsonResponse, HttpResponse
from .views import databaseall, mapaall, categoriasall
from django.utils import timezone
from .forms import CSVUploadForm
from . import models
import csv
import io

"""Crea una respuesta HTTP con contenido CSV."""
def create_csv_response(filename, header, rows):
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response.write('\ufeff'.encode('utf8'))
    writer = csv.writer(response)
    writer.writerow(header)
    for row in rows:
        writer.writerow(row)
    return response


@login_required
@never_cache
def export_categorias(request):
    now = timezone.localtime(timezone.now()).strftime('%d%m%y_%H%M%S')
    if request.user.is_staff:
        rows = [
            [item.categoria or '', item.descripcion or '']
            for item in categoriasall
        ]
        return create_csv_response(f"UTC_categorias_{now}.csv", ['Categoria', 'Descripcion'], rows)
    return JsonResponse({'success': False, 'message': 'Acción no permitida. 🧐😠🤥'}, status=400)

@login_required
@never_cache
def export_database(request):
    now = timezone.localtime(timezone.now()).strftime('%d%m%y_%H%M%S')
    if request.user.is_staff:
        rows = [
            [
                info.categoria or '',
                info.titulo or '',
                info.informacion or '',
                info.documento or '',
                info.imagen or '',
                info.redirigir or '',
                info.frecuencia,
                info.uuid or '',
                info.evento_fecha_inicio or '',
                info.evento_fecha_fin or '',
                info.evento_allDay,
                info.evento_lugar or '',
                info.evento_className or '',
                info.fecha_modificacion or '',
            ]
            for info in databaseall
        ]
        return create_csv_response(f"UTC_database_{now}.csv", 
            ['Categoria', 'Titulo', 'Informacion','Documento', 'Imagen', 'Redirigir','Frecuencia', 'uuid','Evento:fecha de inicio', 'Evento:fecha de fin', 'Evento:Todo el dia','Evento:lugar', 'Evento:className (CSS)', 'Fecha Modificacion'], 
            rows
        )
    return JsonResponse({'success': False, 'message': 'Acción no permitida. 🧐😠🤥'}, status=400)

@login_required
@never_cache
def export_preguntas(request):
    now = timezone.localtime(timezone.now()).strftime('%d%m%y_%H%M%S')

    if request.user.is_staff:
        preguntas = models.Preguntas.objects.all()
        rows = [
            [
                pregunta.pregunta,
                pregunta.descripcion or '',
                pregunta.fecha,
            ]
            for pregunta in preguntas
        ]
        return create_csv_response(f"UTC_preguntas_{now}.csv",['Pregunta', 'Descripción', 'Fecha'],rows)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

@login_required
@never_cache
def export_configuraciones(request):
    now = timezone.localtime(timezone.now()).strftime('%d%m%y_%H%M%S')

    if request.user.is_staff:
        configuraciones = models.Configuraciones.objects.all()
        rows = [
            [
                conf.qr_image.url.replace('/media/', '') if conf.qr_image else '',
                conf.redes_sociales or '',
                conf.copyright_year,
                conf.utc_link,
                True if conf.calendar_btnsYear else False,
                conf.about_img_first.url.replace('/media/', '') if conf.about_img_first else '',
                conf.about_text_first,
                conf.about_img_second.url.replace('/media/', '') if conf.about_img_second else '',
                conf.about_text_second,
            ]
            for conf in configuraciones
        ]
        return create_csv_response(f"UTC_configuraciones_{now}.csv",['QR Imagen', 'Redes Sociales', 'Año Copyright', 'UTC Link', 'Botones Año Calendario', 'Imagen Sobre 1', 'Texto Sobre 1', 'Imagen Sobre 2', 'Texto Sobre 2'],rows)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

@login_required
@never_cache
def export_mapa(request):
    now = timezone.localtime(timezone.now()).strftime('%d%m%y_%H%M%S')
    if request.user.is_staff:
        rows = [
            [
                info.uuid or '',
                info.nombre or '',
                info.informacion or '',
                info.color or '',
                info.coords or '',
                info.door or '',
                info.tags or '',
                bool(info.hide_name) or '',
                bool(info.is_marker) or '',
                info.size_marker or '0.05',
            ]
            for info in mapaall
        ]
        return create_csv_response(f"UTC_mapa_{now}.csv", 
            ['uuid', 'Nombre', 'Informacion', 'Color', 'Coordenadas', 'Puerta', 'Etiquetas', 'Ocultar Nombre', 'Es Marcador', 'Tamaño Marcador'],
            rows
        )
    return JsonResponse({'success': False, 'message': 'Acción no permitida. 🧐😠🤥'}, status=400)

@login_required
@never_cache
def import_database(request):
    return import_csv_data(request, models.Database, {
        'categoria': lambda row: models.Categorias.objects.get_or_create(categoria=row[0])[0],
        'titulo': 1,
        'informacion': 2,
        'documento': 3,
        'imagen': 4,
        'redirigir': 5,
        'frecuencia': lambda row: int(row[6]) if row[6] else 0,
        'uuid': 7,
        'evento_fecha_inicio': lambda row: parse_date(row[8]),
        'evento_fecha_fin': lambda row: parse_date(row[9]),
        'evento_allDay': lambda row: parse_boolean(row[10]),
        'evento_lugar': 11,
        'evento_className': 12,
        'fecha_modificacion': lambda row: parse_date(row[13]),
    }, 'Base de Datos importadas correctamente. 🎉😁🫡')

@login_required
@never_cache
def import_categorias(request):
    return import_csv_data(request, models.Categorias, {
        'categoria': 0,
        'descripcion': 1,
    }, 'Categorías importadas correctamente. 🎉😁🫡')

@login_required
@never_cache
def import_mapa(request):
    return import_csv_data(request, models.Mapa, {
        'uuid': 0,
        'nombre': 1,
        'informacion': 2,
        'color': 3,
        'coords': 4,
        'door': 5,
        'tags': 6,
        'hide_name': lambda row: parse_boolean(row[7]),
        'is_marker': lambda row: parse_boolean(row[8]),
        'size_marker': 9,
    }, 'Datos Del Mapa importados correctamente. 🎉😁🫡')

@login_required
@never_cache
def import_Preguntas(request):
    return import_csv_data(request, models.Preguntas, {
        'pregunta': 0,
        'descripcion': 1,
        'fecha': lambda row: parse_date(row[2]),
    }, 'Preguntas importadas correctamente. 🎉😁🫡')

@login_required
@never_cache
def import_Configuraciones(request):
    return import_csv_data(request, models.Configuraciones, {
        'qr_image': 0,
        'redes_sociales': 1,
        'copyright_year': 2,
        'utc_link': 3,
        'calendar_btnsYear': lambda row: parse_boolean(row[4]),
        'about_img_first': 5,
        'about_text_first': 6,
        'about_img_second': 7,
        'about_text_second': 8,
    }, 'Configuraciones importadas correctamente. 🎉😁🫡')


"""Importa datos desde un archivo CSV para un modelo específico."""
def import_csv_data(request, model, field_map, success_message):
    if request.method == 'POST':
        form = CSVUploadForm(request.POST, request.FILES)
        if form.is_valid():
            file = request.FILES['file']
            try:
                csv_file = io.TextIOWrapper(file, encoding='utf-8')
                reader = csv.reader(csv_file)
                next(reader)  # Omitir la fila de encabezado
                for row in reader:
                    data = {}
                    for field, index in field_map.items():
                        if callable(index):
                            data[field] = index(row)
                        else:
                            data[field] = row[index]
                    model.objects.create(**data)
                return JsonResponse({'success': True, 'functions':'reload', 'message': success_message}, status=200)
            except UnicodeDecodeError:
                return JsonResponse({'success': False, 'message': 'Error de codificación. Asegúrese de que el archivo esté en formato UTF-8.'}, status=400)
            except Exception as e:
                return JsonResponse({'success': False, 'message': f'Error al importar datos: {str(e)}'}, status=400)
        return JsonResponse({'success': False, 'message': 'Formulario no válido.'}, status=400)
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

"""Convierte el valor en un booleano. Devuelve False si no es "True"."""
def parse_boolean(value):
    return value.strip().lower() == 'true'

def parse_date(value):
    """Convierte una cadena en un objeto datetime o devuelve None si está vacío."""
    if value.strip():
        formats = [
            '%Y-%m-%d %H:%M:%S%z',   # Fecha con hora y zona horaria
            '%Y-%m-%d %H:%M:%S',     # Fecha con hora
            '%Y-%m-%d',              # Solo fecha
            '%Y-%m-%d %H:%M:%S.%f',  # Fecha con microsegundos
            '%Y-%m-%d %H:%M:%S.%f%z' # Fecha con microsegundos y zona horaria
        ]
        for date_format in formats:
            try:
                return timezone.datetime.strptime(value, date_format)
            except ValueError:
                continue
        raise ValueError(f"Formato de fecha inválido: {value}")
    return None
