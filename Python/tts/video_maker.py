from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy.video.VideoClip import ImageClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip

def create_text_image(text, font_path, font_size, color, bg_color=(0,0,0,0), image_size=(1280,720)):
    img = Image.new("RGBA", image_size, bg_color)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, font_size)
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    position = ((image_size[0] - text_width)//2, (image_size[1] - text_height)//2)
    draw.text(position, text, font=font, fill=color)
    return img

audio_path = "output/news_audio.mp3/full_news_audio.mp3"
image_path = "썸네일/춘식버스.png"
video_output_path = "output/news_video.mp4"  # 확장자 .mp4로 변경
font_path = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"

# 오디오 파일 로드
audio = AudioFileClip(audio_path)
print(f"Audio duration: {audio.duration} seconds")  # 오디오 길이 출력하여 확인

# 비디오 이미지 클립 생성
image_clip = ImageClip(image_path, duration=audio.duration)

# 텍스트 이미지 생성
text_image = create_text_image("", font_path, 50, color="white")
text_clip = ImageClip(np.array(text_image), duration=audio.duration)

# 비디오와 텍스트 이미지 결합
video = CompositeVideoClip([image_clip, text_clip])

# 오디오 설정: 전체 비디오에 오디오 추가
video = video.with_audio(audio)  # set_audio -> with_audio로 변경

# 비디오 출력 (코덱 명시)
video.write_videofile(video_output_path, fps=24, codec="libx264", audio_codec="aac")

print(f"✅ 뉴스 영상 저장 완료: {video_output_path}")
