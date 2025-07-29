import React, { useEffect, useRef, useState } from "react";
import HouseDetailPanel from "./Oneroom/HouseDetailPanel.jsx";
import { AnimatePresence, motion } from "framer-motion";

const MapPage = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [houseList, setHouseList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mapRef = useRef(null);
    const clustererRef = useRef(null);

    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                console.log("✅ MarkerClusterer 확인:", window.kakao.maps.MarkerClusterer);
                initMap();
            });
        } else {
            const script = document.createElement("script");
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_API_KEY}&autoload=false&libraries=services,clusterer`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    console.log("✅ MarkerClusterer 확인:", window.kakao.maps.MarkerClusterer);
                    initMap();
                });
            };
            document.head.appendChild(script);
        }

        function initMap() {
            const mapContainer = document.getElementById("map");
            const mapOption = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 5,
            };
            const map = new window.kakao.maps.Map(mapContainer, mapOption);
            mapRef.current = map;

            fetchHouseData(map.getCenter());

            window.kakao.maps.event.addListener(map, "dragend", () => {
                fetchHouseData(map.getCenter());
            });
        }

        function fetchHouseData(center) {
            const lat = center.getLat();
            const lng = center.getLng();

            console.log(`[요청] 매물 데이터 → lat: ${lat}, lng: ${lng}`);

            fetch(`${baseUrl}/api/house?lat=${lat}&lng=${lng}`, {
                method: "GET",
                credentials: "include",
            })
                .then(res => {
                    console.log(`[응답] 상태 코드: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    console.log(`[결과] 받은 매물 수: ${data.length}`);
                    if (data.length === 0) console.warn("⚠️ 표시할 매물이 없습니다.");
                    setHouseList(data);
                    setupMarkersWithRetry(data, mapRef.current);
                })
                .catch(err => console.error("❌ 매물 불러오기 실패", err));
        }

        function setupMarkersWithRetry(houses, map, retryCount = 0) {
            if (!map || !window.kakao || !window.kakao.maps.MarkerClusterer) {
                if (retryCount < 5) {
                    console.warn(`⌛ MarkerClusterer 준비 중... (${retryCount + 1}/5)`);
                    setTimeout(() => setupMarkersWithRetry(houses, map, retryCount + 1), 5000);
                } else {
                    console.error("❌ MarkerClusterer 로드 실패. 클러스터 표시 생략.");
                }
                return;
            }

            if (!clustererRef.current) {
                clustererRef.current = new window.kakao.maps.MarkerClusterer({
                    map,
                    averageCenter: true,
                    minLevel: 5,
                });
            } else {
                clustererRef.current.clear();
            }

            const markers = houses
                .filter(h => h.latitude && h.longitude)
                .map(house => {
                    const marker = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(house.latitude, house.longitude),
                        title: house.name,
                    });

                    window.kakao.maps.event.addListener(marker, "click", () => {
                        setSelectedHouse(house);
                    });

                    return marker;
                });

            clustererRef.current.addMarkers(markers);
        }
    }, [baseUrl]);

    const filteredHouses = houseList.filter(house => {
        const target = `${house.region} ${house.buildingName} ${house.articleName}`.toLowerCase();
        return target.includes(searchText.toLowerCase());
    });

    const handleResultClick = (house) => {
        setSelectedHouse(house);
        setMapCenter(house);
    };

    const setMapCenter = (house) => {
        if (window.kakao && window.kakao.maps && house.latitude && house.longitude) {
            const latlng = new window.kakao.maps.LatLng(house.latitude, house.longitude);
            mapRef.current.setCenter(latlng);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div style={{ display: "flex", flex: 1 }}>
                <div style={{
                    width: 320,
                    borderRight: "1px solid #eee",
                    padding: 15,
                    background: "#fff",
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                    height: "90vh",
                }}>
                    <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 10 }}>부동산 매물 지도</div>
                    <input
                        type="text"
                        placeholder="지역, 건물명 등 검색"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="w-full border px-2 py-1 mb-2"
                    />
                    <button
                        style={{
                            width: "100%",
                            marginBottom: 12,
                            background: "#FF6B3D",
                            color: "white",
                            padding: "10px",
                            border: "none",
                            borderRadius: 4,
                        }}
                    >
                        검색
                    </button>

                    <div style={{
                        height: "80vh",
                        overflowY: "auto",
                        paddingRight: 5,
                        boxSizing: "border-box",
                    }}>
                        <ul className="space-y-2">
                            {filteredHouses.map((house, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleResultClick(house)}
                                    className={`border p-3 rounded shadow cursor-pointer ${
                                        selectedHouse?.articleName === house.articleName
                                            ? 'border-orange-400 bg-orange-50'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="text-base font-bold text-orange-500">
                                        {house.articleName || '-'}
                                    </div>
                                    <div className="text-sm text-gray-700">월세: {house.rentPrc || '-'}</div>
                                    <div className="text-sm text-gray-700">보증금: {house.dealOrWarrantPrc || '-'}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ flex: 1, position: "relative" }}>
                    <div id="map" style={{ width: "100%", height: "90vh" }}></div>

                    <AnimatePresence>
                        {selectedHouse && (
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    height: "100%",
                                    width: 400,
                                    backgroundColor: "#fff",
                                    zIndex: 10,
                                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                }}
                            >
                                <HouseDetailPanel house={selectedHouse} onClose={() => setSelectedHouse(null)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
