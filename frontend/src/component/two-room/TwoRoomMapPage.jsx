import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TwoRoomDetailPanel from "./TwoRoomDetailPanel.jsx";

const TwoRoomMapPage = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [houseList, setHouseList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mapRef = useRef(null);
    const clustererRef = useRef(null);

    useEffect(() => {
        const loadKakaoMapScript = () => {
            const script = document.createElement("script");
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_API_KEY}&autoload=false&libraries=services,clusterer`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    initMap();
                });
            };
            document.head.appendChild(script);
        };

        const initMap = () => {
            const mapContainer = document.getElementById("map");
            const mapOption = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 5,
            };
            const map = new window.kakao.maps.Map(mapContainer, mapOption);
            mapRef.current = map;

            fetchTwoRoomData(map.getCenter());

            window.kakao.maps.event.addListener(map, "dragend", () => {
                fetchTwoRoomData(map.getCenter());
            });
        };

        const fetchTwoRoomData = (center) => {
            const lat = center.getLat();
            const lng = center.getLng();
            fetch(`${baseUrl}/api/house/two?lat=${lat}&lng=${lng}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    setHouseList(data);
                    setupMarkers(data, mapRef.current);
                })
                .catch((err) => {
                    console.error("❌ 투룸 데이터 불러오기 실패", err);
                });
        };

        const setupMarkers = (houses, map) => {
            if (!window.kakao?.maps?.MarkerClusterer) return;

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
                .filter((h) => h.latitude && h.longitude)
                .map((house) => {
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
        };

        if (!window.kakao?.maps) {
            loadKakaoMapScript();
        } else {
            initMap();
        }
    }, [baseUrl]);

    const filteredHouses = houseList.filter((house) => {
        const target = `${house.region} ${house.buildingName} ${house.articleName}`.toLowerCase();
        return target.includes(searchText.toLowerCase());
    });

    const handleResultClick = (house) => {
        if (selectedHouse?.id === house.id) {
            setSelectedHouse(null);
        } else {
            setSelectedHouse(house);
            setMapCenter(house);
        }
    };

    const setMapCenter = (house) => {
        if (window.kakao && house.latitude && house.longitude) {
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
                    <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 10 }}>투룸 매물 지도</div>
                    <input
                        type="text"
                        placeholder="지역, 건물명 등 검색"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
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
                                <TwoRoomDetailPanel house={selectedHouse} onClose={() => setSelectedHouse(null)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TwoRoomMapPage;