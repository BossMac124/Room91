from google.cloud import texttospeech
from config import GOOGLE_CREDENTIAL

def generate_tts(text, output_path):
    if len(text.encode("utf-8")) > 5000:
        raise ValueError("❌ 텍스트가 5000바이트를 초과합니다. TTS 요청은 줄여서 다시 시도하세요.")

    try:
        client = texttospeech.TextToSpeechClient(credentials=GOOGLE_CREDENTIAL)
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="ko-KR",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

        response = client.synthesize_speech(
            request={"input": synthesis_input, "voice": voice, "audio_config": audio_config}
        )

        with open(output_path, "wb") as out:
            out.write(response.audio_content)
        print(f"🔊 TTS 생성 완료 → {output_path}")

    except Exception as e:
        print(f"❌ TTS 생성 실패: {e}")
        raise
