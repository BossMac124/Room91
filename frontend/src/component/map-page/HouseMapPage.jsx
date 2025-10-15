import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MapSidebar from "./MapSidebar.jsx";
import MapFilterBar from "./MapFilterBar.jsx";
import HouseDetailPanel from "./HouseDetailPanel.jsx";
import { useKakaoMap } from "../hooks/useKakaoMap.js";
import { useHouses } from "../hooks/useHouses.js";
import HouseMarkers from "./HouseMarkers.jsx";

const HouseMapPage = ({ roomType = "one" }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [filters, setFilters] = useState({
        jeonse: true,
        monthly: true,
        short: true,
        minRent: "",
        maxRent: "",
        minDeposit: "",
        maxDeposit: "",
    });
    const [searchText, setSearchText] = useState("");
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [radius, setRadius] = useState(3); // ✅ 기본 반경 3km

    const { mapRef, center } = useKakaoMap({
        initialCenter: { lat: 37.5665, lng: 126.9780 },
        level: 5,
    });

    // ✅ 지도 줌 레벨에 따라 radius 동적 조정
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;
        const handleZoomChanged = () => {
            const zoom = map.getLevel();
            let newRadius;

            if (zoom <= 3) newRadius = 1;
            else if (zoom <= 5) newRadius = 3;
            else if (zoom <= 7) newRadius = 5;
            else if (zoom <= 8) newRadius = 10;
            else newRadius = 30;

            setRadius(newRadius);
            console.log(`[Zoom ${zoom}] 반경 자동조정 → ${newRadius}km`);
        };

        window.kakao.maps.event.addListener(map, "zoom_changed", handleZoomChanged);
        // console.log("✅ zoom_changed 이벤트 등록 완료");

        return () => {
            window.kakao.maps.event.removeListener(map, "zoom_changed", handleZoomChanged);
            // console.log("🧹 zoom_changed 이벤트 해제");
        };
    }, [mapRef, center]); // ✅ center 의존성 추가


    // ✅ API endpoint 설정
    const config = useMemo(
        () => ({
            one: { apiEndpoint: "/api/house", title: "원룸" },
            two: { apiEndpoint: "/api/house/two", title: "투룸" },
        }),
        []
    );
    const currentConfig = config[roomType];

    // ✅ useHouses 훅 호출 시 radius 포함
    const { houses, loading, refetch } = useHouses({
        baseUrl,
        endpoint: currentConfig.apiEndpoint,
        center,
        filters: { ...filters, radius }, // ← radius 추가
    });

    const filteredHouses = useMemo(() => {
        if (!searchText) return houses;
        return houses.filter((h) => {
            const target = `${h.region || ""} ${h.buildingName || ""} ${h.articleName || ""}`.toLowerCase();
            return target.includes(searchText.toLowerCase());
        });
    }, [houses, searchText]);

    const toggleFilter = (key) =>
        setFilters((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            const isJeonseOnly = next.jeonse && !next.monthly && !next.short;
            if (isJeonseOnly) {
                next.minRent = "";
                next.maxRent = "";
            }
            return next;
        });

    const applyFilter = () => refetch();

    const handleMarkerClick = (house) => {
        setSelectedHouse((prev) => (prev?.id === house.id ? null : house));
        if (mapRef.current && house.latitude && house.longitude) {
            const latlng = new window.kakao.maps.LatLng(house.latitude, house.longitude);
            mapRef.current.setCenter(latlng);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <div style={{ width: 360, borderRight: "1px solid #eee", padding: 12, overflowY: "auto" }}>
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        background: "#fff",
                        zIndex: 5,
                        padding: "8px 0 12px",
                        fontSize: 24,
                        fontWeight: 800,
                        borderBottom: "1px solid #f2f2f2",
                        marginBottom: 12,
                    }}
                >
                    {currentConfig.title} 매물 지도
                </div>
                <MapSidebar
                    currentConfig={currentConfig}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    applyFilter={applyFilter}
                    filteredHouses={filteredHouses}
                    selectedHouse={selectedHouse}
                    handleResultClick={handleMarkerClick}
                    showTitle={false}
                />
            </div>

            <div style={{ flex: 1, position: "relative" }}>
                <MapFilterBar
                    filters={filters}
                    toggleFilter={toggleFilter}
                    setFilters={setFilters}
                    applyFilter={applyFilter}
                    center={center}
                />
                <div id="map" style={{ width: "100%", height: "100%" }} />
                <HouseMarkers mapRef={mapRef} houses={filteredHouses} onMarkerClick={handleMarkerClick} />

                <AnimatePresence>
                    {selectedHouse && (
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.25 }}
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
                            <HouseDetailPanel house={selectedHouse} onClose={() => setSelectedHouse(null)} roomType={roomType} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HouseMapPage;