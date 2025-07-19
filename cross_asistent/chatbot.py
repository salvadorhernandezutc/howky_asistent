from .models import Database, Mapa, Configuraciones
from .views import obtener_configuraciones
from django.http import JsonResponse
from django.utils import timezone
from django.conf import settings
from unidecode import unidecode
from django.urls import reverse
from django.db.models import Q
import ollama
import random
import openai
import json
import re

def modelsettings(request):
    if request.method == 'POST':
        try:
            quest_id = request.POST.get('idSetings')
            hawkySettings = obtener_configuraciones(quest_id)
            modelData = hawkySettings[f'redes_sociales_{quest_id}']
            parsed_data = json.loads(modelData)
            return JsonResponse(parsed_data, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'#{quest_id} no encontrada.'}, status=404)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

def chatgpt(question, instructions):
    client = openai.OpenAI(api_key=settings.OPENAI_APIKEY)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": question},
        ],
        temperature=0,
    )
    
    print(f"Prompt:{response.usage.prompt_tokens}")
    print(f"Compl:{response.usage.completion_tokens}")
    print(f"Total:{response.usage.total_tokens}")
    print()

    print(f"Respuesta: {response.choices[0].message.content}")
    return response.choices[0].message.content

def localLLM(question, instructions):
    ollamaModel = "llama3.2:1b"
    response = ollama.chat(
        model=ollamaModel,
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": question}
        ],
        stream=False,
        options={"temperature": 0}
    )

    print(f"Respuesta: {response['message']['content']}")
    return response['message']['content']

def tags_search(pregunta):
    pregunta_tokens = re.findall(r'\b\w+\b', pregunta.lower())
    query = Q()
    for token in pregunta_tokens:
        query |= Q(tags__icontains=token)
    
    posibles = Database.objects.filter(query)
    resultados = []

    for item in posibles:
        item_tags = item.get_tag_list()
        coincidencias = set(pregunta_tokens) & set(item_tags)
        resultados.append((item, len(coincidencias)))

    resultados = sorted(resultados, key=lambda x: x[1], reverse=True)
    print(f"Pregunta: {pregunta}")
    print(f"Tokens: {pregunta_tokens}")
    print(f"Resultados: {resultados}")

    return [item for item, score in resultados if score > 0][:3]

import re
from unidecode import unidecode
from .models import Mapa

def export_locations(question):
    pregunta_normalizada = unidecode(question.lower())
    lugares = Mapa.objects.filter(is_marker=False)

    coincidencias = []

    for lugar in lugares:
        tags = unidecode((lugar.tags or "").lower())
        if tags and any(tag in pregunta_normalizada for tag in tags.split(",")):
            coincidencias.append(lugar.nombre)

    if not coincidencias:
        for lugar in lugares:
            nombre_normalizado = unidecode(lugar.nombre.lower())
            if re.search(r'\b{}\b'.format(re.escape(nombre_normalizado)), pregunta_normalizada):
                coincidencias.append(lugar.nombre)

    if not coincidencias:
        return None, None
    elif len(coincidencias) == 1:
        return "Caseta 1", coincidencias[0]
    else:
        return coincidencias[0], coincidencias[1]


def chatbot(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pregunta = data.get('question', '').strip()
            ahora = timezone.localtime(timezone.now()).strftime('%d-%m-%Y_%H%M')

            mejores_resultados = tags_search(pregunta)

            if mejores_resultados:
                bloques_info = "\n\n".join([f"Tema relacionado:\n{r.informacion}" for r in mejores_resultados])
                system_prompt = (
                    f"Eres Hawky, asistente virtual de la Universidad Tecnológica de Coahuila (UTC)."
                    f"Responde únicamente con la información proporcionada a continuación."
                    f"No inventes ni asumas datos que no estén explícitamente en el contenido."
                    f"\n\nInformación de referencia:\n{bloques_info}\n\n"
                    f"Fecha actual: {ahora}."
                )
                info_respuesta = None
                base_url = None

                origen, destino = export_locations(pregunta)
                if destino:
                    try:
                        this_info = json.loads(mejores_resultados[0].informacion)
                        if isinstance(this_info, list):
                            info_random = random.choice(this_info)
                        else:
                            info_random = mejores_resultados[0].informacion
                    except:
                        info_random = mejores_resultados[0].informacion

                    if destino != origen:
                        info_respuesta = f"Para ir de {origen or 'Caseta 1'} a {destino}.\n{info_random} \n        👇👇👇"

                        originParams = origen or 'Caseta 1'
                        base_url = f"{originParams}~{destino}"
                    else:
                        info_respuesta = "Lo siento pero no puedo ayudarte con eso. 😕 \n Intenta hacer una ruta con dos lugares distintos"
                
                else:
                    try:
                        config = Configuraciones.objects.get(id=2)
                        model = (config.about_text_first or "").strip().lower()

                        if model == "ollama":
                            info_respuesta = localLLM(pregunta, system_prompt)
                        elif model == "chatgpt":
                            info_respuesta = chatgpt(pregunta, system_prompt)
                        else:
                            info_respuesta = "El Asistente Hawky no está disponible actualmente. por favor regrese mas tarde. 😕"
                    except Configuraciones.DoesNotExist:
                        return JsonResponse({'success': False, 'message': 'Configuración no encontrada.'}, status=404)
                    
                    base_url = mejores_resultados[0].redirigir if hasattr(mejores_resultados[0], 'redirigir') else None

                respuesta = {
                    "titulo": mejores_resultados[0].titulo,
                    "informacion": info_respuesta,
                    "redirigir": base_url,
                    "imagenes": mejores_resultados[0].imagen.url if mejores_resultados[0].imagen else None
                }

                print(f'Bloques: {bloques_info}')
                print(f'Respuesta: {respuesta}')

            else:
                baseUrl = reverse('faq')
                pill = 'pills-create-quest-tab'
                respuesta = {
                    "informacion": "Lo siento, no encontré información relacionada con lo que me pides 🤔. "
                                   "Puedes consultar la página oficial de la UTC o escribirnos directamente. 😊",
                    "redirigir": f"{baseUrl}?tab={pill}",
                }
            
            return JsonResponse({'success': True, 'answer': respuesta})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
