import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MapSidebar from "./MapSidebar.jsx";
import MapFilterBar from "./MapFilterBar.jsx";
import HouseDetailPanel from "./HouseDetailPanel.jsx";

import { useKakaoMap } from "../hooks/useKakaoMap.js";
import { useHouses } from "../hooks/useHouses.js";
import RouteSearchPanel from "./RouteSearchPanel.jsx";
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

    const { mapRef, center } = useKakaoMap({ initialCenter: { lat: 37.5665, lng: 126.9780 }, level: 5 });

    const config = useMemo(() => ({
        one: { apiEndpoint: "/api/house", title: "원룸" },
        two: { apiEndpoint: "/api/house/two", title: "투룸" },
    }), []);
    const currentConfig = config[roomType];

    const { houses, loading, refetch } = useHouses({
        baseUrl,
        endpoint: currentConfig.apiEndpoint,
        center,
        filters
    });

    const filteredHouses = useMemo(() => {
        if (!searchText) return houses;
        return houses.filter((h) => {
            const target = `${h.region || ""} ${h.buildingName || ""} ${h.articleName || ""}`.toLowerCase();
            return target.includes(searchText.toLowerCase());
        });
    }, [houses, searchText]);

    const toggleFilter = (key) => setFilters(prev => {
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
        setSelectedHouse(prev => (prev?.id === house.id ? null : house));
        if (mapRef.current && house.latitude && house.longitude) {
            const latlng = new window.kakao.maps.LatLng(house.latitude, house.longitude);
            mapRef.current.setCenter(latlng);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* 사이드바: 기존 MapSidebar를 쓴다면 아래에 RouteSearchPanel만 위에 추가해도 됨 */}
            <div style={{ width: 360, borderRight: "1px solid #eee", padding: 12, overflowY: "auto" }}>
                {/* ✅ 제목을 가장 위로 이동 */}
                <div
                    style={{
                        position: "sticky",   // 옵션: 스크롤해도 상단 고정하고 싶으면
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

                <RouteSearchPanel mapRef={mapRef} baseUrl={baseUrl} />

                <MapSidebar
                    currentConfig={currentConfig}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    applyFilter={applyFilter}
                    filteredHouses={filteredHouses}
                    selectedHouse={selectedHouse}
                    handleResultClick={handleMarkerClick}
                    showTitle={false}            // ✅ 내부 제목은 숨김
                />
            </div>

            {/* 지도 + 상단 필터바 + 상세패널 */}
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