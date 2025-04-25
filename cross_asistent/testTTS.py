import asyncio
import numpy as np

from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

openai = AsyncOpenAI()

async def main() -> None:
    async with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="ash",
        # voice="onyx",
        input="¡Hoy es un día maravilloso para construir algo que la gente ama!",
        instructions="Habla en un tono neutro.",
        response_format="pcm",
    ) as response:
        await LocalAudioPlayer().play(response)

if __name__ == "__main__":
    asyncio.run(main())