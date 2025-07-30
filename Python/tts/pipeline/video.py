import os
import random
import datetime
from PIL import Image
import numpy as np
from moviepy.video.VideoClip import ImageClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip

def create_news_video(audio_path, thumbnails_dir="thumbnails", output_base_dir="news_video"):
    # 오디오 로딩
    audio = AudioFileClip(audio_path)

    # 1. 썸네일 자동 랜덤 선택
    available_images = [f for f in os.listdir(thumbnails_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not available_images:
        raise FileNotFoundError(f"❌ 썸네일 폴더에 이미지가 없습니다: {thumbnails_dir}")

    selected_thumbnail = random.choice(available_images)
    image_path = os.path.join(thumbnails_dir, selected_thumbnail)
    print(f"🖼️ 선택된 썸네일: {selected_thumbnail}")

    # 2. 날짜별 폴더 구성
    today = datetime.datetime.now().strftime("%Y%m%d")
    output_dir = os.path.join(output_base_dir, today)
    os.makedirs(output_dir, exist_ok=True)
    video_output_path = os.path.join(output_dir, f"news_{today}.mp4")

    # 3. 이미지와 오디오를 결합한 영상 생성
    image_clip = ImageClip(image_path, duration=audio.duration)

    # 텍스트 오버레이 비워두기 (필요 시 채워도 됨)
    text_image = Image.new("RGBA", image_clip.size, (0, 0, 0, 0))
    text_clip = ImageClip(np.array(text_image), duration=audio.duration)

    # 영상 생성
    video = CompositeVideoClip([image_clip, text_clip]).with_audio(audio)
    video.write_videofile(video_output_path, fps=24, codec="libx264", audio_codec="aac")

    print(f"✅ 뉴스 영상 저장 완료: {video_output_path}")
