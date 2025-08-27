from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.views.decorators.cache import never_cache
from django.db import IntegrityError, transaction
from django.shortcuts import redirect
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.http import JsonResponse
from functools import wraps
from . import models
import datetime
import json

# Decorador de Accesos ----------------------------------------------------------
def access_required(group_name):
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def _wrapped_view(request, *args, **kwargs):
            if request.user.is_superuser or request.user.groups.filter(name=group_name).exists():
                return view_func(request, *args, **kwargs)
            return redirect('singout')
        return _wrapped_view
    return decorator

# Plantilla links programador / administrador ----------------------------------------------------------
pages = [
        {'name': 'database', 'url': 'database_page', 'display_name': 'Base de Datos', 'icon':'fa-solid fa-database', 'access':'all'},
        {'name': 'mapa', 'url': 'update_mapa', 'display_name': 'Mapa', 'icon':'fa-solid fa-map-location-dot', 'access':'staff'},
        {'name': 'calendario', 'url': 'calendario_page', 'display_name': 'Calendario', 'icon':'fa-solid fa-calendar-days', 'access':'all'},
    ]

# Editar Perfil ----------------------------------------------------------
def editar_perfil(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        user_auth = request.user
        user_perfil = request.user.userprofile
        
        fNamePOST = request.POST.get('first_nameChanged')
        lNamePOST = request.POST.get('last_nameChanged')
        usernamePOST = request.POST.get('usernameChanged')
        emailPOST = request.POST.get('emailChanged')
        firmaPOST = request.POST.get('firmaBlog')
        picturePOST = request.FILES.get('userPictureChanged')
        delPicturePOST = request.POST.get('deletePicture')
        PasswordPOST = request.POST.get('passwordSend')
        newPasswordPOST = request.POST.get('confNewPass')
        
        if not user_auth.check_password(PasswordPOST):
            return JsonResponse({'success': False, 'message': 'La contraseña actual es incorrecta.'}, status=400)
        
        if emailPOST and User.objects.filter(email=emailPOST).exclude(id=user_auth.id).exists():
            return JsonResponse({'success': False, 'message': f'El correo electrónico "{emailPOST}" ya está en uso por otra cuenta. 🤔😯😯🧐'}, status=400)
        
        if usernamePOST and usernamePOST != user_auth.username:
            if User.objects.filter(username=usernamePOST).exists():
                return JsonResponse({'success': False, 'message': 'El nombre de usuario ya está en uso.'}, status=400)
            user_auth.username = usernamePOST
        
        with transaction.atomic():
            if fNamePOST:
                user_auth.first_name = fNamePOST
            
            if lNamePOST:
                user_auth.last_name = lNamePOST
            
            if emailPOST:
                user_auth.email = emailPOST
            
            if firmaPOST:
                user_perfil.blog_firma = firmaPOST
            
            if picturePOST:
                user_perfil.profile_picture = picturePOST
            
            if delPicturePOST == 'on':
                user_perfil.profile_picture.delete()
                user_perfil.profile_picture = None
            
            if newPasswordPOST:
                if PasswordPOST == newPasswordPOST:
                    return JsonResponse({'success': False, 'message': 'La nueva contraseña no puede ser igual a la actual.'}, status=400)
                user_auth.set_password(newPasswordPOST)
                user_perfil.passwoed_update = datetime.date.today()

            user_auth.save()
            user_perfil.save()
        return JsonResponse({'success': True, 'message': 'Tus Datos Se guardaron exitosamente. 🥳😋🤘🎉🎈', 'position': 'top'}, status=200)
    else:
        return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

# usuarios ----------------------------------------------------------
def create_newuser(first_name, last_name, username, email, password1, password2=None, is_staff=False, is_active=False):
    if not (password1 and username and email):
        return {'success':False, 'message':'Datos incompletos 😅'}
    if password2 is not None and password1 != password2:
        return {'success':False, 'message':'Las contraseñas no coinciden 😬'}
    if User.objects.filter(username=username).exists():
        return {'success':False, 'message':f'El usuario <u>{username}</u> ya existe. 😯🤔 <br>Te recomiendo utilizar uno distinto', 'valSelector':'usernameSelect'}
    if User.objects.filter(email=email).exists():
        return {'success':False, 'message':f'El correo electrónico <u>{email}</u> ya está registrado 😯<br>Te recomiendo utilizar uno distinto', 'valSelector':'emailSelect'}

    try:
        new_user = User.objects.create_user(
            first_name=first_name.lower(),
            last_name=last_name.lower(),
            username=username,
            email=email,
            password=password1,
            is_staff=is_staff,
            is_active=is_active,
        )
        new_user.save()
        aviso=''
        if password2 is not None:
            aviso = '<br>Tu cuenta está <u>Desactivada</u> 😯😬'
        return {'success': True, 'message': f'Usuario creado exitosamente 🥳🎈 {aviso}'}
    except IntegrityError:
        return {'success': False, 'message': 'Ocurrió un error durante el registro. Intente nuevamente.'}

# (programacion) ----
@login_required
@never_cache
def in_active(request):
    if request.method == 'POST' and request.user.is_staff:
        user_id = request.POST.get('user_id')
        action = request.POST.get('actionform')
        userChange = get_object_or_404(User, id=user_id)

        if action == 'activate':
            userChange.is_active = True
            message = f'Usuario "{userChange.username}" activado exitosamente. 😊🎈'
            icon = 'info'
        elif action == 'deactivate':
            userChange.is_active = False
            message = f'Usuario "{userChange.username}" <strong><u>desactivado</u></strong> exitosamente. 😯🧐😬'
            icon = 'warning'
        else:
            return JsonResponse({'success': False, 'message': 'Acción no válida.'}, status=400)

        userChange.save()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': message, 'icon':icon}, status=200)
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

@login_required
@never_cache
def eliminar_usuario(request, user_id):
    if request.method == 'POST':
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return JsonResponse({'success': True, 'message': 'Usuario eliminado exitosamente.', 'icon': 'warning', 'position':'top'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
def editar_usuario(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        is_staffPost = request.POST.get('is_staff') == 'on'
        
        if password or is_staffPost:
            if password:
                user.set_password(password)
            user.is_active = True
            user.is_staff = is_staffPost
            user.is_superuser = is_staffPost
            user.save()
            
            messagereturn = f'El usuario <u>{username}</u> fue modificado exitosamente 🥳🎉🎈.'
            
        return JsonResponse({'success': True, 'message': messagereturn}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

# Categorias ----------------------------------------------------------
@login_required
@never_cache
def categorias_create(request):
    if request.method == 'POST':
        try:
            categoriaPOST = request.POST.get('categoria')
            descripcionPOST = request.POST.get('descripcion')
            
            existing_record = models.Categorias.objects.filter(categoria=categoriaPOST).exists()
            if existing_record:
                return JsonResponse({'success': False, 'message': f'la categoría "{categoriaPOST}" ya está registrada. 🧐🤔😯',}, status=400)
            
            models.Categorias.objects.create(
                categoria=categoriaPOST,
                descripcion=descripcionPOST,
            )
            
            return JsonResponse({'success': True, 'functions':'reload', 'message': f'Categoría <span>{categoriaPOST}</span> fue creada exitosamente 😁🎉🎈', 'position':'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def categorias_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')
            categPOST = request.POST.get('categoria')
            itemUpdate = get_object_or_404(models.Categorias, id=idPOST)
            itemUpdate.descripcion = request.POST.get('descripcion')
            itemUpdate.save()
            
            catMessage = f'Se actualizó la categoria <span>{categPOST}</span> exitosamente 🫡😁🎉'
            return JsonResponse({'success': True, 'functions': 'reload', 'message': catMessage, 'position': 'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'No se pudo actualizar la categoria, Ocurrió un error 😯😥'}, status=400)
    
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def categorias_delete(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')            
            categoriaDel = get_object_or_404(models.Categorias, id=idPOST)
            categoriaDel.delete()
            
            catMessage =  f'La categoria <u>{categoriaDel.categoria}</u> se eliminó correctamente 😯🧐😬🫡'
            return JsonResponse({'success': True, 'functions':'reload', 'message': catMessage, 'icon':'warning'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

# Base de Datos ----------------------------------------------------------
@login_required
@never_cache
def database_list(request):
    listDatabase = models.Database.objects.all()
    datos_modificados = []
    for dato in listDatabase:
        if dato.imagen:
            imagen_url = dato.imagen.url
        else:
            imagen_url = ''
        if dato.documento:
            documento_url = dato.documento.url
        else:
            documento_url = ''
        datos_modificados.append({
            'id': dato.id,
            'categoria': dato.categoria.categoria,
            'titulo': dato.titulo,
            'informacion': dato.informacion,
            'redirigir': dato.redirigir,
            'frecuencia': dato.frecuencia,
            'documento': documento_url,
            'imagen': imagen_url,
            'fecha_modificacion': dato.fecha_modificacion,
        })
    data = {'infodb': datos_modificados}
    return JsonResponse(data)

@login_required
@never_cache
def database_create(request):
    if request.method == 'POST':
        try:
            categoriaIdPOST = request.POST.get('categoria')
            categoria = get_object_or_404(models.Categorias, categoria=categoriaIdPOST)
            tituloPOST = request.POST.get('titulo').lower()
            informacionPOST = request.POST.get('informacion')
            redirigirPOST = request.POST.get('redirigir').lower()
            documentoPOST = request.FILES.get('documento')
            imagenPOST = request.FILES.get('imagen')
            tagsPOST = request.POST.get('tags').lower()
            evento_fecha_inicioPOST = request.POST.get('eStart')
            evento_fecha_finPOST = request.POST.get('eEnd')
            evento_allDayPOST = request.POST.get('eAllDay')
            evento_lugarPOST = request.POST.get('ePleace')
            evento_classNamePOST = request.POST.get('eColor')
            
            existing_record = models.Database.objects.filter(titulo=tituloPOST,evento_fecha_inicio=evento_fecha_inicioPOST,evento_fecha_fin=evento_fecha_finPOST,).exists()

            if existing_record:
                return JsonResponse({'success': False, 'message': '😯Este registro ya existe. <br> Hay otro registro con el mismo nombre, fecha de inicio y fecha de fin. 🧐🤔😯',}, status=400)
            
            if categoriaIdPOST == 'Preguntas':
                frecuenciaVAL = 1
            else:
                frecuenciaVAL = 0
                
            dbMessage =  'Nuevo registro en la base de datos 🎉🎉🎉'
            if categoriaIdPOST == 'Calendario':
                dbMessage =  'Nuevo Evento registrado exitosamente 🫡😁🎉'
            
            models.Database.objects.create(
                categoria=categoria,
                titulo=tituloPOST,
                informacion=informacionPOST,
                redirigir=redirigirPOST,
                frecuencia=frecuenciaVAL,
                documento=documentoPOST,
                imagen=imagenPOST,
                tags=tagsPOST,
                uuid=f'{categoriaIdPOST}_{models.generate_random_string(6)}',
                evento_fecha_inicio=evento_fecha_inicioPOST or None,
                evento_fecha_fin=evento_fecha_finPOST or None,
                evento_allDay=evento_allDayPOST if not evento_allDayPOST == None else False,
                evento_lugar=evento_lugarPOST or '',
                evento_className=evento_classNamePOST or '',
            )            
            return JsonResponse({'success': True, 'functions':'reload', 'message': dbMessage, 'position':'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def database_getitem(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)            
            idPOST = data.get('id')
            dbItem = get_object_or_404(models.Database, id=idPOST)
            data = {
                'categoria':dbItem.categoria.categoria,
                'titulo':dbItem.titulo,
                'informacion':dbItem.informacion,
                'redirigir':dbItem.redirigir,
                'tags':dbItem.tags,
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)

    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def database_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')
            categoriaIdPOST = request.POST.get('categoria')
            categoriaGET = get_object_or_404(models.Categorias, categoria=categoriaIdPOST)
            frecuenciaPOST = request.POST.get('frecuencia')
            evento_fecha_inicioPOST = request.POST.get('eStart')
            evento_fecha_finPOST = request.POST.get('eEnd')
            evento_allDayPOST = request.POST.get('eAllDay')
            evento_lugarPOST = request.POST.get('ePleace')
            evento_classNamePOST = request.POST.get('eColor')
            tagsPOST = request.POST.get('tags')
            
            dbUpdate = get_object_or_404(models.Database, id=idPOST)
            dbUpdate.categoria = categoriaGET
            dbUpdate.titulo = request.POST.get('titulo').lower()
            dbUpdate.informacion = request.POST.get('informacion')
            dbUpdate.redirigir = request.POST.get('redirigir').lower()
            dbUpdate.frecuencia = frecuenciaPOST or '0'
            
            # Validación de archivo
            documento = request.FILES.get('documento')
            imagen = request.FILES.get('imagen')

            if documento:
                dbUpdate.documento = documento

            if imagen:
                if '..' in imagen.name or imagen.name.startswith('/'):
                    return JsonResponse({'success': False, 'message': 'Ruta de archivo inválida.'}, status=400)
                dbUpdate.imagen = imagen

            dbUpdate.uuid = f'{categoriaIdPOST}_{models.generate_random_string(6)}'
            dbUpdate.evento_fecha_inicio = evento_fecha_inicioPOST or None
            dbUpdate.evento_fecha_fin = evento_fecha_finPOST or None
            dbUpdate.evento_allDay = evento_allDayPOST if not evento_allDayPOST == None else False
            dbUpdate.evento_lugar = evento_lugarPOST or ''
            dbUpdate.evento_className = evento_classNamePOST or 'event_detail'
            dbUpdate.tags = tagsPOST or ''
            dbUpdate.save()
                        
            dbMessage = f'Se actualizó "{request.POST.get("titulo")}" en la base de datos exitosamente 🫡😁🎉'
            return JsonResponse({'success': True, 'message': dbMessage, 'position': 'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def database_delete(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')            
            dbDelete = get_object_or_404(models.Database, id=idPOST)
            dbDelete.delete()
            
            dbMessage =  f'"{dbDelete.titulo}" Se eliminó de la base de datos 😯🧐😬🫡'
            return JsonResponse({'success': True, 'functions':'reload', 'message': dbMessage, 'icon':'warning'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

def frequesnce_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('frequence_id')
            dbUpdate = get_object_or_404(models.Database, id=idPOST)
            dbUpdate.frecuencia = dbUpdate.frecuencia + 1
            dbUpdate.save()
        
            return JsonResponse({'success': 'success', }, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥.  {str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

# Calendario: Eventos ---------------------
def calendario_eventos(request):
    categoriaGet = get_object_or_404(models.Categorias, categoria="Calendario")
    eventos = models.Database.objects.filter(categoria=categoriaGet).select_related('categoria')
    eventos_json = [{
        'id': evento.id,
        'title': evento.titulo,
        'description': evento.informacion,
        'classNames': evento.evento_className,
        'location': evento.evento_lugar,
        'imagen': evento.imagen.url if evento.imagen else '',
        'button': evento.redirigir if evento.redirigir else '',
        'start': evento.evento_fecha_inicio.isoformat() if evento.evento_fecha_inicio else '',
        'end': evento.evento_fecha_fin.isoformat() if evento.evento_fecha_fin else '',
        'allDay': evento.evento_allDay,
    } for evento in eventos]
    
    return JsonResponse(eventos_json, safe=False)

# Mapa ----------------------------------------------------------
def mapa_data(request):
    mapas = models.Mapa.objects.filter(is_marker=False)
    data = []
    
    for mapa in mapas:
        imagenQuery = models.Database.objects.filter(uuid=mapa.uuid).values_list('imagen', flat=True)
        imagen = imagenQuery.first() if imagenQuery.exists() else None

        galeryQuery = models.galeria.objects.filter(uuid=mapa.uuid)
        galery_items = []
        for galeria_item in galeryQuery:
            galery_items.append({
                "id": galeria_item.id,
                "imagen": galeria_item.imagen.url,
                "img_size": galeria_item.imagen.size
            })
        
        item = {
            "uuid": mapa.uuid,
            "color": mapa.color,
            "imagen_url": imagen,
            "nombre": mapa.nombre,
            "ismarker": mapa.is_marker,
            "sizemarker": mapa.size_marker,
            "informacion": mapa.informacion,
            "galery_items": galery_items,
            "galery_count": galeryQuery.count(),
            "hidename": bool(mapa.hide_name),
            "coords": [json.loads(mapa.coords)] if mapa.coords else [],
            "door": json.loads(mapa.door) if mapa.door else [],
            "otheraction": mapa.otheraction,
            "tags": mapa.tags,
        }
        data.append(item)
    return JsonResponse(data, safe=False)

def mapa_markers(request):
    mapas = models.Mapa.objects.filter(is_marker=True)
    data = []
    for mapa in mapas:
        imagen_mark = get_object_or_404(models.Database, uuid=mapa.uuid)
        item = {
            "uuid": mapa.uuid,
            "nombre": mapa.nombre,
            "ismarker": mapa.is_marker,
            "sizemarker": mapa.size_marker,
            "otheraction": mapa.otheraction,
            "imagen": imagen_mark.imagen.url,
            "icon_size": float(mapa.size_marker),
            "door": json.loads(mapa.door) if mapa.door else [],
        }
        data.append(item)

    return JsonResponse(data, safe=False)

@login_required
@never_cache
def delete_pleaceMap(request):
    if request.method == 'POST':
        sendUid = request.POST.get('uuid')
        pleace = get_object_or_404(models.Mapa, uuid=sendUid)
        pleace.delete()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': f'Se eliminó <u>"{pleace.nombre}"</u> del Mapa exitosamente. 😯😬🎉', 'icon': 'warning'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
def delete_pleaceMap_DB(request):
    if request.method == 'POST':
        sendUid = request.POST.get('uuid')
        pleace = get_object_or_404(models.Mapa, uuid=sendUid)
        pleace.delete()
        pleaceDB = get_object_or_404(models.Database, uuid=sendUid)
        pleaceDB.delete()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': f'Se eliminó <u>"{pleace.nombre}"</u> del Mapa y de la Base de Datos exitosamente. ⚠️😯😬🎉', 'icon': 'warning'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

# Preguntas ----------------------------------------------------------
@login_required
@never_cache
def preguntas_deleted(request):
    if request.method == 'POST':
        try:
            quest_id = request.POST.get('question_id')
            pregunta = get_object_or_404(models.Preguntas, id=quest_id)
            pregunta.delete()
            return JsonResponse({'success': True, 'message': f'Pregunta #.{quest_id} eliminada permanentemente. 😯🫡', 'icon': 'warning', 'position':'top'}, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Pregunta #{quest_id} no encontrada.'}, status=404)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

# Configuraciones ----------------------------------------------------------
@login_required
@never_cache
def settings_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('setId')
            qrImgPOST = request.FILES.get('qrImage')
            qrButtonPOST = request.POST.get('btnqrpost')
            qrButton = bool(request.POST.get('btnqr'))
            aboutimgfirst = request.FILES.get('firstimage')
            aboutimgsecond = request.FILES.get('secondimage')
            btnyearPOST = request.POST.get('btnsYearpost')
            btnyear_calendar = bool(request.POST.get('btnsYear'))
            copyryear = request.POST.get('cr_year')
            utclink = request.POST.get('utclink')
            redeslinks = request.POST.get('redeslinks')
            firstsection = request.POST.get('firstsection')
            secondsection = request.POST.get('secondsection')
            abouttext = request.POST.get('contenidoWord')

            if not idPOST:
                idPOST = '1'
            else:
                valH = request.POST.get('camHorizontal')
                valV = request.POST.get('camVertical')
                valD = request.POST.get('camDistance')
                numAreas = request.POST.get('num_areas')
                rowAreas = request.POST.get('row_areas')
                colAreas = request.POST.get('col_areas')
                areaAnim = request.POST.getlist('areaAnim')
                areaTime = request.POST.getlist('areaTime')
                areaWidth = request.POST.getlist('areaWidth')
                areaHeight = request.POST.getlist('areaHeight')
                
                modelData = {}
                cameraOrbit = "cameraOrbit"
                modelData[cameraOrbit] = [valH, valV, valD]
                
                if qrButton:
                    gridAreas = "gridAreas"
                    modelData[gridAreas] = [numAreas, rowAreas, colAreas]
                    animations = "animations"
                    modelData[animations] = [areaAnim, areaTime, areaHeight, areaWidth]
                    
                redeslinks = json.dumps(modelData)
            
            config = get_object_or_404(models.Configuraciones, id=idPOST)
            if qrImgPOST:
                config.qr_image = qrImgPOST
            if qrButtonPOST:
                config.qr_button = qrButton
            if btnyearPOST:
                config.calendar_btnsYear = btnyear_calendar
            if copyryear:
                config.copyright_year = copyryear
            if utclink:
                config.utc_link = utclink
            if redeslinks:
                config.redes_sociales = redeslinks
            if firstsection:
                config.about_text_first = abouttext
            if secondsection:
                config.about_text_second = abouttext
            if aboutimgfirst:
                config.about_img_first = aboutimgfirst
            if aboutimgsecond:
                config.about_img_second = aboutimgsecond
                
            config.save()
            
            return JsonResponse({'success': True, 'message': f'Configuraciones Actualizadas', 'position':'top-end', 'functions':'submit'}, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrio un error. {str(e)}'}, status=404)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)
