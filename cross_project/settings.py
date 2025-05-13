import os
import environ
from pathlib import Path

env = environ.Env(DEBUG=(bool, True),ALLOWED_HOSTS=(list, []))
environ.Env.read_env()
OPENAI_API_KEY = env('OPENAI_API_KEY')

BASE_DIR = Path(__file__).resolve().parent.parent

# Utiliza las variables del entorno que estan en otra ubicacion
#env = environ.Env(
#    DEBUG=(bool, True),
#    ALLOWED_HOSTS=(list, []),
#)
#environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# Cambiar la clave secreta en produccion ---------------------------------------------------------
SECRET_KEY = env('SECRET_KEY', default='django-secure-dwkz!xn+ahpk*ah)69dvo3x6@xw%^$u3du-ia$zjf^_(w+9r2b')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env('ALLOWED_HOSTS')

INSTALLED_APPS = [
    'cross_asistent',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cross_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.media',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cross_project.wsgi.application'

# Base de datos local -------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]


# Internationalization
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True


# Documentos estaticos ##########################
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# destruccion de la sesion #######################
LOGIN_URL = '/acceder/'
LOGOUT_URL = '/acceder/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'