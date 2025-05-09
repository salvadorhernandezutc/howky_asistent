from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.contrib.auth.models import User
from django.db import models, transaction
from django.http import JsonResponse
from django.urls import reverse
from . import functions, models

mapaall = models.Mapa.objects.all()
databaseall = models.Database.objects.all()
categoriasall = models.Categorias.objects.all()
settingsall = models.Configuraciones.objects.all()
questions_all = models.Preguntas.objects.all().order_by('-id')
categoriasFilter = models.Categorias.objects.exclude(categoria__in=['Mapa', 'Calendario'])
idConfig = 1
idHawky = 2

def obtener_configuraciones(questID):
    oneconfig = get_object_or_404(models.Configuraciones, pk=questID)
    return {
        f'qr_image_{questID}': oneconfig.qr_image.url,
        f'qr_button_{questID}': oneconfig.qr_button,
        f'redes_sociales_{questID}': oneconfig.redes_sociales,
        f'copyright_year_{questID}': oneconfig.copyright_year,
        f'utc_link_{questID}': oneconfig.utc_link,
        f'calendar_btnsYear_{questID}': oneconfig.calendar_btnsYear,
        f'about_img_first_{questID}': oneconfig.about_img_first.url,
        f'about_text_first_{questID}': oneconfig.about_text_first,
        f'about_img_second_{questID}': oneconfig.about_img_second.url,
        f'about_text_second_{questID}': oneconfig.about_text_second,
    }

error_messages = {
    400: 'Hubo un problema con la solicitud que realizaste. Asegúrate de que la información enviada sea correcta y vuelve a intentarlo.',
    401: 'No tienes autorización para acceder a este recurso. Por favor, inicia sesión y asegúrate de tener los permisos adecuados.',
    403: 'No tienes permiso para acceder a esta página. Si crees que esto es un error, contacta con el administrador.',
    404: 'Lo sentimos, no pudimos encontrar la página que estás buscando. Verifica la URL o vuelve a la página de inicio.',
    405: 'El método de la solicitud no está permitido para este recurso. Verifica la forma en que intentas acceder y prueba de nuevo.',
    408: 'La solicitud tardó demasiado tiempo en completarse. Verifica tu conexión a internet e inténtalo nuevamente.',
    429: 'Has realizado demasiadas solicitudes en poco tiempo. Por favor, espera un momento antes de volver a intentarlo.',
    500: 'Ocurrió un problema en el servidor. Estamos trabajando para solucionarlo. Intenta nuevamente más tarde.',
    502: 'El servidor recibió una respuesta inválida al intentar procesar tu solicitud. Intenta de nuevo más tarde.',
    503: 'El servicio no está disponible en este momento debido a tareas de mantenimiento o sobrecarga. Por favor, vuelve a intentarlo más tarde.',
    504: 'El servidor no pudo obtener una respuesta a tiempo. Revisa tu conexión e intenta nuevamente más tarde.'
}

def index(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones(idConfig)
    hawkySettings = obtener_configuraciones(idHawky)
    
    return render(request, 'index.html', {
        'active_page': 'inicio',
        'img_qr': configuraciones[f'qr_image_{idConfig}'],
        'btn_qr': configuraciones[f'qr_button_{idConfig}'],
        'model_3D': hawkySettings[f'qr_image_{idHawky}'],
        'active_areas': hawkySettings[f'qr_button_{idHawky}'],
        'anim_default': hawkySettings[f'utc_link_{idHawky}'],
        'hawkyAlways': hawkySettings[f'calendar_btnsYear_{idHawky}'],
    })

def fqt_questions(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones(1)
    categoria_Preguntas = get_object_or_404(models.Categorias, categoria="Preguntas")
    questall = models.Database.objects.filter(frecuencia__gt=0, categoria=categoria_Preguntas)
    return render(request, 'frecuentes.html', {
        'active_page': 'faq',
        'quest_all': questall,
        'quest_top': questall.order_by('-frecuencia')[:8],
        'copyright_year': configuraciones['copyright_year_1'],
        'utc_link': configuraciones['utc_link_1'],
    })

def fqt_questions_send(request):
    if request.method == "POST":
        try:
            preguntaPOST = request.POST.get('pregunta')
            descripcionPOST = request.POST.get('descripcion')

            pregunta = models.Preguntas(pregunta=preguntaPOST, descripcion=descripcionPOST)
            pregunta.save()

            return JsonResponse({'success': True, 'functions':'reset', 'message': 'Gracias por tu pregunta. ❤️💕😁👍 <br>Te responderemos lo más pronto posible. 😁😊🫡'}, status=200)
        except Exception as e:
            print(f'Hay un error en: {e}')
            return JsonResponse({'error':True, 'success': False, 'message': 'Ups! 😥😯 hubo un error y tu pregunta no se pudo registrar. Por favor intente de nuevo más tarde.'}, status=400)

def calendario(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones(idConfig)
    return render(request, 'calendario.html', {
        'active_page': 'calendario',
        'copyright_year': configuraciones[f'copyright_year_{idConfig}'],
        'utc_link': configuraciones[f'utc_link_{idConfig}'],
        'calendar_btnsYear': bool(configuraciones[f'calendar_btnsYear_{idConfig}']),
    })

def map(request):
    if not request.user.is_staff:
        logout(request)
    return render(request, 'mapa.html', {
        'active_page': 'map'
    })

def about(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones(1)
    return render(request, 'about.html', {
        'active_page': 'about',
        **configuraciones
    })

# Administracion ----------------------------------------------------------
@never_cache
def singup(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        response = functions.create_newuser(
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            username=request.POST.get('username'),
            email=request.POST.get('email'),
            password1=request.POST.get('password1'),
            password2=request.POST.get('password2'),
        )
        
        response['functions'] = 'reload'
        status = 200 if response['success'] else 400
        return JsonResponse(response, status=status)
    else:
        logout(request)
        return redirect('singin')

@never_cache
def singinpage(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        login_identifier = request.POST.get('username')  # Puede ser username o email
        password = request.POST.get('password')
        
        try:
            user = User.objects.get(username=login_identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=login_identifier)
            except User.DoesNotExist:
                user = None
        
        if user is not None:
            if not user.is_active:
                return JsonResponse({'success': False, 'functions': 'singin', 'message': '🧐😥😯 UPS! <br> Al parecer tu cuenta esta <u>Desactiva</u>. Será activada si estas autorizado'}, status=400)
            
            user = authenticate(request, username=user.username, password=password)
            if user is None:
                return JsonResponse({'success': False, 'functions': 'singin', 'message': 'Revisa el usuario o contraseña 😅.'}, status=400)
            else:
                login(request, user)
                pageRedirect = reverse('vista_programador')
                return JsonResponse({'success': True, 'functions': 'singin', 'redirect_url': pageRedirect}, status=200)
        else:
            return JsonResponse({'success': False, 'functions': 'singin', 'message': 'Usuario no registrado 😅. Verifica tu nombre de usuario o contraseña'}, status=400)
    else:
        configuraciones = obtener_configuraciones(idConfig)
        logout(request)
        return render(request, 'singinup.html', {
            'active_page': 'singin',
            'copyright_year': configuraciones[f'copyright_year_{idConfig}'],
            'utc_link': configuraciones[f'utc_link_{idConfig}'],
        })

@never_cache
def singout(request):
    logout(request)
    return redirect('singin')

@login_required
@never_cache
def vista_programador(request):
    users = User.objects.all().order_by('-id')
    configuraciones = obtener_configuraciones(idConfig)
    hawkySettings = obtener_configuraciones(idHawky)
    
    contexto = {
        'users':users,
        'user':request.user,
        'active_page':'home',
        'pages':functions.pages,
        'settingsall':settingsall,
        'categorias':categoriasFilter,
        'preguntas_sending':questions_all[:8], # limitar a los primeros 8 registros
        'preguntas_count':questions_all.count(),
        'num_preguntas':databaseall.count(),
        **configuraciones,
        **hawkySettings,
        'copyright_year': configuraciones[f'copyright_year_{idConfig}'],
        'utc_link': configuraciones[f'utc_link_{idConfig}'],
    }
    
    if request.method == 'POST':
        response = functions.create_newuser(
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            username=request.POST.get('username'),
            email=request.POST.get('email'),
            password1=request.POST.get('password'),
            is_staff=request.POST.get('is_staff', False),
            is_active=request.POST.get('is_active', False),
        )
        response['position'] = 'top'
        response['functions'] = 'reload'
        status = 200 if response['success'] else 400
        return JsonResponse(response, status=status)

    return render(request, 'admin/vista_programador.html', contexto)

@login_required
@never_cache
def ver_perfil(request):
    perfil_extencion = request.user.userprofile
    if perfil_extencion.profile_picture:
        request.user.userprofile.profile_picture = request.user.userprofile.profile_picture.url
    else:
        request.user.userprofile.profile_picture = '/static/img/UTC_logo-plano.webp'
                
    return render(request, 'admin/perfil.html', {
        'user_profile': perfil_extencion,
        'active_page': 'perfil',
        'pages': functions.pages
    })

# Base de Datos ----------------------------------------------------------
@login_required
@never_cache
def database_page(request):
    context = { 'active_page':'database','pages':functions.pages, 'preguntas_sending':questions_all, 'categorias':categoriasFilter, 'categoriasall':categoriasall }
    return render(request, 'admin/database.html', context)

# Calendario ----------------------------------------------------------
@login_required
@never_cache
def calendario_page(request):
    configuraciones = obtener_configuraciones(1)
    context = {
        'pages': functions.pages,
        'active_page': 'calendario',
        'calendar_btnsYear': bool(configuraciones[f'calendar_btnsYear_{idConfig}']),
    }
    return render(request, 'admin/calendario.html', context)

#Mapa ----------------------------------------------------------
@login_required
@never_cache
def map_page(request):
    categoria_mapa = models.Categorias.objects.get(categoria="Mapa")
    map_inDB = models.Database.objects.filter(categoria=categoria_mapa)
    UID = f'mapa-pleace_{models.generate_random_string(11)}'
    return render(request, 'admin/mapa.html', {'map_inDB': map_inDB, 'active_page': 'mapa', 'UID':UID, 'pages': functions.pages})

@login_required
@never_cache
def update_create_pleace_map(request):
    if request.method != 'POST':
        return redirect('update_mapa')

    isNewPost = request.POST.get('isNew')
    is_markerPost = request.POST.get('ismarker')
    hide_namePost = request.POST.get('hidename')
    uuidPost = request.POST.get('uuid')
    nombrePost = request.POST.get('nombreEdificio').lower()
    colorPost = request.POST.get('colorEdificio')
    informacionText = request.POST.get('textTiny')
    sizemarkerPost = request.POST.get('sizemarker')
    informacionPost = request.POST.get('contenidoWord')
    coordsPost = request.POST.get('coords')
    doorPost = request.POST.get('doorcoords')
    imagenPost = request.FILES.get('fotoEdificio')
    
    if not nombrePost:
        return JsonResponse({'success': False, 'message': 'Al parecer no se enviaron datos. 😯🤔⚠️😥'}, status=400)

    with transaction.atomic():
        if isNewPost == 'notnew':
            if models.Mapa.objects.filter(uuid=uuidPost).exists():
                edificio = get_object_or_404(models.Mapa, uuid=uuidPost)
                edificio.nombre = nombrePost
                edificio.color = colorPost
                edificio.coords = coordsPost
                edificio.size_marker = sizemarkerPost
                edificio.informacion = informacionPost
                edificio.door = doorPost
                edificio.is_marker = bool(is_markerPost)
                edificio.hide_name = bool(hide_namePost)
                edificio.save()
                success_message = f'Se Actualizaron los datos de <span>"{nombrePost}"</span> en el mapa de forma exitosa 🧐😁🎈'

            if imagenPost:
                map_database = get_object_or_404(models.Database, uuid=uuidPost)
                map_database.imagen = imagenPost
                map_database.save()
                success_message += '<br>Se actualizó su imagen en la Base de datos 😁🎉🎈'
            return JsonResponse({'success': True, 'message': success_message}, status=200)
        else:
            # validar si este ya existe en el mapa y en db para que no se repitan
            models.Mapa.objects.create(
                uuid = uuidPost,
                color = colorPost,
                nombre = nombrePost,
                coords = coordsPost,
                door = doorPost,
                informacion = informacionPost,
                size_marker  =  sizemarkerPost,
                is_marker = bool(is_markerPost),
                hide_name = bool(hide_namePost),
            )
            
            models.Database.objects.create(
                categoria=models.Categorias.objects.get(categoria="Mapa"),
                titulo=nombrePost,
                informacion=informacionText,
                imagen=imagenPost,
                uuid=uuidPost,
                evento_lugar='',
                evento_className='',
            )

            return JsonResponse({'success': True, 'message': 'Se creó un nuevo edificio en el mapa y en la base de datos de forma exitosa 🎉🎉🎉', 'functions':'reload'}, status=200)

#Paginas de error -----------------------------------------------
def error_code_info(setCode):
    hawkySettings = obtener_configuraciones(idHawky)
    
    codeList = {}
    error_code = 'error_code'
    error_info = 'error_info'
    model_3D = 'model_3D'
    anim_default = 'anim_default'
    active_areas = 'active_areas'
    hawkyAlways = 'hawkyAlways'
    
    codeList[error_code] = setCode
    codeList[model_3D] = hawkySettings[f'qr_image_{idHawky}']
    codeList[anim_default] = hawkySettings[f'utc_link_{idHawky}']
    codeList[active_areas] = hawkySettings[f'qr_button_{idHawky}']
    codeList[hawkyAlways] = hawkySettings[f'calendar_btnsYear_{idHawky}']
    
    if setCode in error_messages:
        codeList['error_info'] = error_messages[setCode]
    else:
        codeList['error_info'] = 'Error desconocido.'
    
    return codeList

def error_400(request, exception):
    setErrorCode = error_code_info(400)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=400)

def error_401(request):
    setErrorCode = error_code_info(401)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=401)

def error_403(request, exception):
    setErrorCode = error_code_info(403)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=403)

def error_404(request, exception):
    setErrorCode = error_code_info(404)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=404)

def error_405(request):
    setErrorCode = error_code_info(405)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=405)

def error_408(request):
    setErrorCode = error_code_info(408)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=408)

def error_429(request):
    setErrorCode = error_code_info(429)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=429)

def error_500(request):
    setErrorCode = error_code_info(500)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=500)

def error_502(request):
    setErrorCode = error_code_info(502)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=502)

def error_503(request):
    setErrorCode = error_code_info(503)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=503)

def error_504(request):
    setErrorCode = error_code_info(504)
    contexto = {**setErrorCode}
    return render(request, 'base/error_page.html', contexto, status=504)
