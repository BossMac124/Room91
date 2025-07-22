from google.cloud import texttospeech
from config import GOOGLE_CREDENTIAL

client = texttospeech.TextToSpeechClient(credentials=GOOGLE_CREDENTIAL)

def generate_tts(text, output_path):
    input_text = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(language_code="ko-KR", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL)
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = client.synthesize_speech(
        request={"input": input_text, "voice": voice, "audio_config": audio_config}
    )

    with open(output_path, "wb") as out:
        out.write(response.audio_content)
    print(f"🔊 TTS 생성 완료 → {output_path}")
