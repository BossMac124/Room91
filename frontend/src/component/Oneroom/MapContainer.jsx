import React, { useEffect, useRef } from 'react';
import loadKakaoMap from '../../utils/loadKakaoMap.js';

const MapContainer = ({ center, markers = [], selected }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const clustererRef = useRef(null);

    useEffect(() => {
        loadKakaoMap().then((kakao) => {
            const map = new kakao.maps.Map(mapRef.current, {
                center: new kakao.maps.LatLng(center.lat, center.lng),
                level: 5,
            });

            mapInstance.current = map;

            const clusterer = new kakao.maps.MarkerClusterer({
                map,
                averageCenter: true,
                minLevel: 2,
            });

            clustererRef.current = clusterer;

            renderMarkers(kakao);
        });
    }, [center]);

    useEffect(() => {
        if (!mapInstance.current || !window.kakao) return;
        renderMarkers(window.kakao);
    }, [markers, selected]);

    const renderMarkers = (kakao) => {
        const map = mapInstance.current;
        const clusterer = clustererRef.current;

        if (!map || !clusterer) return;

        clusterer.clear();

        const markerObjs = markers.map(({ lat, lng, name }) => {
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(lat, lng),
            });

            const iw = new kakao.maps.InfoWindow({
                content: `<div style="padding:8px; font-weight:bold; color:#FF6B3D;">${name}</div>`,
            });

            kakao.maps.event.addListener(marker, 'mouseover', () =>
                iw.open(map, marker)
            );
            kakao.maps.event.addListener(marker, 'mouseout', () => iw.close());

            if (
                selected &&
                parseFloat(selected.latitude) === parseFloat(lat) &&
                parseFloat(selected.longitude) === parseFloat(lng)
            ) {
                iw.open(map, marker);
            }

            return marker;
        });

        clusterer.addMarkers(markerObjs);
    };

    return <div ref={mapRef} className="w-full h-full" />;
};

export default MapContainer;
