import asyncio
import numpy as np

from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

openai = AsyncOpenAI()

async def main() -> None:
    async with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        # model="tts-1",
        # model="tts-1-hd", # No Interpreta el español correctamente
        # voice="ash",
        # voice="onyx",
        # voice="nova",
        voice="echo",
        input="¡Hola! Soy Hawky tu asistente virtual de la Universidad Tecnológica de Coahuila. Puedes preguntarme sobre trámites, carreras, costos u otros temas de la universidad. ¿En qué puedo ayudarte?",
        instructions="Habla en un tono neutro.", # Es unicamente para gpt-4o-mini-tts
        response_format="pcm",
    ) as response:
        await LocalAudioPlayer().play(response)

if __name__ == "__main__":
    asyncio.run(main())