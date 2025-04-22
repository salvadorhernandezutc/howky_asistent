from .views import obtener_configuraciones
from django.http import JsonResponse
from django.utils import timezone
from django.conf import settings
from django.urls import reverse
from .models import Database
import openai
import json
import re

def chatgpt(question, instructions):
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
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
    return response.choices[0].message.content

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

def buscar_por_tags(pregunta):
    pregunta_tokens = re.findall(r'\b\w+\b', pregunta.lower())
    resultados = []

    for item in Database.objects.all():
        item_tags = item.get_tag_list()
        coincidencias = set(pregunta_tokens) & set(item_tags)
        resultados.append((item, len(coincidencias)))

    resultados = sorted(resultados, key=lambda x: x[1], reverse=True)
    return [item for item, score in resultados if score > 0][:3]

# Para el sistema de como ir a tal edificio dentro del campus se necesita cargar la lista de lugares del mapa
# despues se compara el lugar de la lista con la pregunta y se obtiene el lugar que más se asemeje a la pregunta
# y se le pasa a la IA para que genere la respuesta.

def chatbot(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pregunta = data.get('question', '').strip()
            ahora = timezone.localtime(timezone.now()).strftime('%d-%m-%Y_%H%M')

            mejores_resultados = buscar_por_tags(pregunta)

            if mejores_resultados:
                bloques_info = "\n\n".join([f"Tema relacionado:\n{r.informacion}" for r in mejores_resultados])
                system_prompt = (
                    f"Eres Hawky, asistente virtual de la Universidad Tecnológica de Coahuila (UTC). "
                    f"Usa emojis, no saludes, no repreguntes. "
                    f"Responde únicamente en base a la siguiente información:\n\n{bloques_info}\n\n"
                    f"Hoy es {ahora}."
                )
                respuesta_gpt = chatgpt(pregunta, system_prompt)

                respuesta = {
                    "blank": True,
                    "informacion": respuesta_gpt,
                    "titulo": mejores_resultados[0].titulo,
                    "redirigir": mejores_resultados[0].redirigir,
                    "imagenes": mejores_resultados[0].imagen.url if mejores_resultados[0].imagen else None
                }

            else:
                baseUrl = reverse('faq')
                pill = 'pills-create-quest-tab'
                respuesta = {
                    "informacion": "Lo siento, no encontré información relacionada con lo que me pides 🤔. "
                                   "Puedes consultar la página oficial de la UTC o escribirnos directamente. 😊",
                    "redirigir": f"{baseUrl}?tab={pill}",
                    "blank": False,
                }
            
            return JsonResponse({'success': True, 'answer': respuesta})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
