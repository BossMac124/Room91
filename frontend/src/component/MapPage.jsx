import React, { useEffect } from "react";

const MapPage = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_API_KEY}&libraries=services,clusterer`;
        script.async = true;
        script.onload = () => {
            if (!window.kakao) return;
            const { maps } = window.kakao;

            const map = new maps.Map(document.getElementById("map"), {
                center: new maps.LatLng(37.5665, 126.9780),
                level: 5,
            });

            // 클러스터러, 검색, 경로, 마커 등 기존 로직을 여기에 이식
            // (함수들 분리하여 useCallback/useRef 등으로 관리 추천)
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div style={{ display: "flex", flex: 1 }}>
                <div style={{ width: 320, borderRight: "1px solid #eee", padding: 15, overflowY: "auto" }}>
                    <div style={{ fontWeight: "bold", fontSize: 20 }}>부동산 매물 지도</div>
                    <input type="text" placeholder="출발지" style={{ width: "100%", marginBottom: 8 }} readOnly />
                    <input type="text" placeholder="도착지" style={{ width: "100%", marginBottom: 8 }} readOnly />
                    <button style={{ width: "100%", marginBottom: 12, background: "#FF6B3D", color: "white", padding: "10px", border: "none", borderRadius: 4 }}>길찾기</button>
                    <div>길찾기 결과 표시 영역</div>
                    <div style={{ marginTop: 20 }}>매물 리스트 영역</div>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                    <div id="map" style={{ width: "100%", height: "100%" }}></div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
