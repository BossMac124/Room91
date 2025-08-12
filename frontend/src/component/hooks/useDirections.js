/* global kakao */
import { useEffect, useRef, useState } from "react";

export default function useDirections({ mapRef, baseUrl }) {
    const polylineRef = useRef(null);
    const [info, setInfo] = useState(null);

    useEffect(() => {
        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, []);

    const geocode = (query) =>
        new Promise((resolve, reject) => {
            if (!kakao?.maps?.services) return reject(new Error("지도 서비스 로드 전입니다."));
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(query, (result, status) => {
                if (status === kakao.maps.services.Status.OK && result.length) {
                    const { x, y } = result[0];
                    resolve({ lat: parseFloat(y), lng: parseFloat(x) });
                } else {
                    reject(new Error("주소를 찾지 못했어."));
                }
            });
        });

    const drawRoute = (pathCoords) => {
        if (!mapRef.current || !kakao?.maps) return;
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
        const path = pathCoords.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
        const polyline = new kakao.maps.Polyline({ path, strokeWeight: 5, strokeOpacity: 0.9 });
        polyline.setMap(mapRef.current);
        polylineRef.current = polyline;

        const bounds = new kakao.maps.LatLngBounds();
        path.forEach((ll) => bounds.extend(ll));
        mapRef.current.setBounds(bounds);
    };

    const searchRoute = async ({ start, end }) => {
        if (!start || !end) throw new Error("출발지/도착지를 입력해줘.");
        const [o, d] = await Promise.all([geocode(start), geocode(end)]);
        const url = new URL(`${baseUrl}/api/house/direction`);
        url.searchParams.set("originLat", o.lat);
        url.searchParams.set("originLng", o.lng);
        url.searchParams.set("destLat", d.lat);
        url.searchParams.set("destLng", d.lng);

        const res = await fetch(url);
        if (!res.ok) throw new Error("길찾기 API 실패");
        const dto = await res.json();

        drawRoute(dto.pathCoords);
        setInfo({ distance: dto.distance, duration: dto.duration });
        return dto;
    };

    const clear = () => {
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
        setInfo(null);
    };

    return { searchRoute, info, clear };
}
