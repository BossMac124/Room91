import { useEffect, useRef, useState } from "react";

export default function HouseMarkers({ mapRef, houses = [], onMarkerClick }) {
    const clustererRef = useRef(null);

    useEffect(() => {
        if (!mapRef?.current || !kakao?.maps?.MarkerClusterer) return;

        // 기존 클러스터러 정리
        if (clustererRef.current) {
            try { clustererRef.current.clear(); } catch {}
            clustererRef.current = null;
        }

        const clusterer = new kakao.maps.MarkerClusterer({
            map: mapRef.current,
            averageCenter: true,
            minLevel: 5,
        });
        clustererRef.current = clusterer;

        // 방어적 필터링
        const list = Array.isArray(houses) ? houses : [];
        const markers = list
            .filter((h) => Number.isFinite(h?.latitude) && Number.isFinite(h?.longitude))
            .map((h) => {
                const marker = new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(h.latitude, h.longitude),
                    title: h.name || h.buildingName || "",
                });
                kakao.maps.event.addListener(marker, "click", () => onMarkerClick?.(h));
                return marker;
            });

        clusterer.addMarkers(markers);

        return () => {
            if (clustererRef.current) {
                try { clustererRef.current.clear(); } catch {}
                clustererRef.current = null;
            }
        };
    }, [mapRef, houses, onMarkerClick]);

    return null;
}