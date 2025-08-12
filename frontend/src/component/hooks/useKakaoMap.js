import { useEffect, useRef, useState } from "react";

export function useKakaoMap({ initialCenter = { lat: 37.5665, lng: 126.9780 }, level = 5 }) {
    const mapRef = useRef(null);
    const [center, setCenter] = useState(null);

    useEffect(() => {
        const load = () => {
            const container = document.getElementById("map");
            const options = {
                center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
                level,
            };
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;

            const c = map.getCenter();
            setCenter({ lat: c.getLat(), lng: c.getLng() });

            window.kakao.maps.event.addListener(map, "idle", () => {
                const cc = map.getCenter();
                setCenter({ lat: cc.getLat(), lng: cc.getLng() });
            });
        };

        if (!window.kakao?.maps) {
            const script = document.createElement("script");
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_API_KEY}&autoload=false&libraries=services,clusterer`;
            script.async = true;
            script.onload = () => window.kakao.maps.load(load);
            document.head.appendChild(script);
        } else {
            window.kakao.maps.load(load);
        }
    }, [level, initialCenter.lat, initialCenter.lng]);

    return { mapRef, center };
}