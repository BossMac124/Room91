let isLoaded = false;

export default function loadKakaoMap() {
    return new Promise((resolve, reject) => {
        if (isLoaded && window.kakao) {
            resolve(window.kakao);
            return;
        }

        const API_KEY = import.meta.env.VITE_KAKAO_API_KEY;
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false&libraries=services,clusterer`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                isLoaded = true;
                console.log("✅ Kakao Maps SDK loaded");
                resolve(window.kakao);
            });
        };

        script.onerror = () => reject(new Error("❌ Kakao Maps API 로드 실패"));

        document.head.appendChild(script);
    });
}
