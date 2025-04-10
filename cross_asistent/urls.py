from django.urls import path
from . import chatbot, functions, views, imex_port
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    # Páginas de inicio ----------------------------------------------------------
    path('', views.index, name='home'),
    path('preguntas_frecuentes/', views.fqt_questions, name='faq'),
    path('preguntar/', views.fqt_questions_send, name='enviar_preguntas'),
    path('calendario/', views.calendario, name='calendario'),
    path('calendario/eventos/', functions.calendario_eventos, name='calendario_eventos'),
    path('mapa/', views.map, name='map'),
    path('mapa/edificios/', functions.mapa_data, name='mapa_edificios'),
    path('mapa/marcadores/', functions.mapa_markers, name='mapa_markers'),
    path('acercade/', views.about, name='about'),
    
    # Chatbot ----------------------------------------------------------
    path('chatbot/', chatbot.chatbot, name='chatbot'),
    path('model_settings/', chatbot.modelsettings, name='modelsettings'),
    
    # Sesion y registro ----------------------------------------------------------
    path('logout/', views.singout, name='singout'),
    path('acceder/', views.singinpage, name='singin'),
    path('registro/', views.singup, name='singup'),
    
    # Administracion y programacion ----------------------------------------------------------
    path('administracion/', views.vista_programador, name='vista_programador'),
    path('administracion/perfil/', views.ver_perfil, name='perfil'),
    path('administracion/perfil/editar_perfil/', functions.editar_perfil, name='editprofile'),
    
    # Usuarios ----------------------------------------------------------
    path('administracion/usuarios/activacion/', functions.in_active, name='in_active'),
    path('administracion/usuarios/editar/<int:user_id>/', functions.editar_usuario, name='editar_usuario'),
    path('administracion/usuarios/eliminar/<int:user_id>/', functions.eliminar_usuario, name='eliminar_usuario'),

    # Categorias ----------------------------------------------------------
    path('administracion/categorias/crear/', functions.categorias_create, name='categorias_create'),
    path('administracion/categorias/actualizar/', functions.categorias_update, name='categorias_update'),
    path('administracion/categorias/eliminar/', functions.categorias_delete, name='categorias_delete'),
    
    # Database ----------------------------------------------------------
    path('administracion/base_de_datos/', views.database_page, name='database_page'),
    path('administracion/database/crear/', functions.database_create, name='create_database'),
    path('administracion/database/lista/', functions.database_list, name='database_list'),
    path('administracion/database/actualizar/', functions.database_update, name='database_update'),
    path('administracion/database/eliminar/', functions.database_delete, name='database_delete'),
    path('administracion/database/informacion/', functions.database_getitem, name='database_getitem'),
    
    path('administracion/calendario/', views.calendario_page, name='calendario_page'),
    
    path('administracion/preguntas/eliminar/', functions.preguntas_deleted, name='question_deleted'),
    path('database/actualizar_frecuencia/', functions.frequesnce_update, name='update_frequencies_database'),
    
    # Mapa ----------------------------------------------------------
    path('administracion/mapa/', views.map_page, name='update_mapa'),
    path('administracion/mapa/modificar/', views.update_create_pleace_map, name='upload_map'),
    path('administracion/mapa/eliminar/', functions.delete_pleaceMap, name='del_pleace_map'),
    path('administracion/mapa/elimiina/database/', functions.delete_pleaceMap_DB, name='del_pleace_mapdb'),
        
    # configuraciones ----------------------------------------------------------
    path('administracion/configuraciones/actualizar/', functions.settings_update, name='update_settings'),
    
    # Importar y Exportar ----------------------------------------------------------
    path('administracion/export/categorias/', imex_port.export_categorias, name='export_categorias'),
    path('administracion/importar/categorias/', imex_port.import_categorias, name='import_categorias'),
    path('administracion/export/database/', imex_port.export_database, name='export_database'),
    path('administracion/importar/database/', imex_port.import_database, name='import_database'),
    path('administracion/export/mapa/', imex_port.export_mapa, name='export_mapa'),
    path('administracion/importar/mapa/', imex_port.import_mapa, name='import_mapa'),
    path('administracion/export/preguntas/', imex_port.export_preguntas, name='export_preguntas'),
    path('administracion/importar/preguntas/', imex_port.import_Preguntas, name='import_preguntas'),
    path('administracion/export/configuracion/', imex_port.export_configuraciones, name='export_configuraciones'),
    path('administracion/importar/configuraciones/', imex_port.import_Configuraciones, name='import_configuraciones'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
