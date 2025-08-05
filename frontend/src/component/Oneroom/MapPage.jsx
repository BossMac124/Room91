import React, { useEffect, useRef, useState } from "react";
import HouseDetailPanel from "./HouseDetailPanel.jsx";
import { AnimatePresence, motion } from "framer-motion";

// 메인 지도 페이지 컴포넌트
const MapPage = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;                       // 백엔드 API 주소 (환경변수에서 불러옴)
    const [selectedHouse, setSelectedHouse] = useState(null);      // 선택된 매물 정보
    const [houseList, setHouseList] = useState([]);         // 지도에 표시할 전체 매물 리스트
    const [searchText, setSearchText] = useState("");       // 검색창 입력값
    const mapRef = useRef(null);                    // 카카오맵 객체 참조
    const clustererRef = useRef(null);              // 클러스터러 객체 참조 (여러 마커를 묶어서 군집 처리)

    // 페이지가 처음 로드될 때 실행되는 로직
    useEffect(() => {
        // 카카오맵 SDK 로드 함수
        const loadKakaoMapScript = () => {
            const script = document.createElement("script");
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_API_KEY}&autoload=false&libraries=services,clusterer`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    console.log("✅ Kakao Maps SDK 완전 로드됨");
                    initMap(); // 지도 초기화
                });
            };
            document.head.appendChild(script);
        };

        // 지도 초기화 및 이벤트 등록
        const initMap = () => {
            const mapContainer = document.getElementById("map");
            const mapOption = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심 좌표
                level: 5, // 확대 수준
            };
            const map = new window.kakao.maps.Map(mapContainer, mapOption);
            mapRef.current = map;

            // 처음 로드된 중심 좌표로 매물 데이터 요청
            fetchHouseData(map.getCenter());

            // 사용자가 지도를 움직였을 때 → 중심 좌표로 다시 요청
            window.kakao.maps.event.addListener(map, "dragend", () => {
                fetchHouseData(map.getCenter());
            });
        };

        // 중심 좌표 기반 매물 데이터 요청
        const fetchHouseData = (center) => {
            const lat = center.getLat();
            const lng = center.getLng();
            console.log(`[요청] 매물 데이터 → lat: ${lat}, lng: ${lng}`);

            fetch(`${baseUrl}/api/house?lat=${lat}&lng=${lng}`, {
                method: "GET",
                credentials: "include", // 쿠키 포함 여부
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(`[결과] 받은 매물 수: ${data.length}`);
                    setHouseList(data); // 매물 리스트 상태 저장
                    setupMarkers(data, mapRef.current); // 마커 생성
                })
                .catch((err) => {
                    console.error("❌ 매물 불러오기 실패", err);
                });
        };

        // 마커 및 클러스터러 설정
        const setupMarkers = (houses, map) => {
            if (!window.kakao || !window.kakao.maps || !window.kakao.maps.MarkerClusterer) {
                console.warn("⚠️ MarkerClusterer가 준비되지 않았습니다.");
                return;
            }

            // 클러스터러가 없으면 새로 만들고, 있으면 초기화
            if (!clustererRef.current) {
                clustererRef.current = new window.kakao.maps.MarkerClusterer({
                    map,
                    averageCenter: true,
                    minLevel: 5,
                });
            } else {
                clustererRef.current.clear();
            }

            // 매물 리스트 → 마커 객체 리스트로 변환
            const markers = houses
                .filter((h) => h.latitude && h.longitude)
                .map((house) => {
                    const marker = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(house.latitude, house.longitude),
                        title: house.name,
                    });

                    // 마커 클릭 시 상세 정보 패널 열기
                    window.kakao.maps.event.addListener(marker, "click", () => {
                        setSelectedHouse(house);
                    });

                    return marker;
                });

            // 마커를 클러스터러에 추가
            clustererRef.current.addMarkers(markers);
        };

        // SDK가 로드되지 않았으면 스크립트 삽입
        if (!window.kakao || !window.kakao.maps) {
            loadKakaoMapScript();
        } else {
            initMap();
        }
    }, [baseUrl]); // baseUrl 변경 시 다시 실행됨

    // 검색 필터링된 매물 리스트
    const filteredHouses = houseList.filter((house) => {
        const target = `${house.region} ${house.buildingName} ${house.articleName}`.toLowerCase();
        return target.includes(searchText.toLowerCase());
    });

    // 검색 결과 클릭 시 지도 이동 + 상세 보기
    const handleResultClick = (house) => {
        if (selectedHouse?.id === house.id) {
            // 이미 선택된 매물 → 다시 클릭 시 닫기
            setSelectedHouse(null);
        } else {
            // 새 매물 선택 → 열기 + 지도 이동
            setSelectedHouse(house);
            setMapCenter(house);
        }
    };
    // 지도 중심 좌표를 해당 매물 위치로 이동
    const setMapCenter = (house) => {
        if (window.kakao && window.kakao.maps && house.latitude && house.longitude) {
            const latlng = new window.kakao.maps.LatLng(house.latitude, house.longitude);
            mapRef.current.setCenter(latlng);
        }
    };

    // 화면 구성
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div style={{ display: "flex", flex: 1 }}>
                {/* 왼쪽: 검색창 + 매물 리스트 */}
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

                    {/* 매물 리스트 스크롤 영역 */}
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

                {/* 오른쪽: 지도 영역 */}
                <div style={{ flex: 1, position: "relative" }}>
                    <div id="map" style={{ width: "100%", height: "90vh" }}></div>

                    {/* 상세 패널 애니메이션 */}
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
