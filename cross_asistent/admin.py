from django.contrib import admin
from . import models

class CategoriasAdmin(admin.ModelAdmin):
    list_display = ('categoria', 'descripcion')

class DatabaseAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'categoria', 'uuid')
    search_fields = ('titulo', 'informacion', 'uuid')

class MapaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'access_to', 'tags', 'is_marker', 'uuid')
    search_fields = ('nombre', 'tags', 'uuid')

class NotifAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'leida')
    search_fields = ('user__username', 'user__email')

class PreguntasAdmin(admin.ModelAdmin):
    list_display = ('pregunta', 'descripcion', 'fecha')

class ConfigAdmin(admin.ModelAdmin):
    list_display = ('copyright_year','id')
    
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'tutorial', 'blog_firma')
    search_fields = ('user__username', 'user__email')

# Register your models here.
admin.site.register(models.Categorias, CategoriasAdmin)
admin.site.register(models.Database, DatabaseAdmin)
admin.site.register(models.Mapa, MapaAdmin)
admin.site.register(models.galeria)
admin.site.register(models.Preguntas, PreguntasAdmin)
admin.site.register(models.Configuraciones, ConfigAdmin)
admin.site.register(models.UserProfile, UserProfileAdmin)

