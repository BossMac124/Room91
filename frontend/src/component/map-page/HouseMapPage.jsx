import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HouseDetailPanel from "./HouseDetailPanel.jsx";
import MapSidebar from "./MapSidebar.jsx";

const HouseMapPage = ({ roomType = "one" }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [houseList, setHouseList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState({
        jeonse: true,
        monthly: true,
        short: true,
        minRent: '',
        maxRent: '',
        minDeposit: '',
        maxDeposit: ''
    });
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const mapRef = useRef(null);
    const clustererRef = useRef(null);

    const config = {
        one: {
            apiEndpoint: "/api/house",
            title: "원룸"
        },
        two: {
            apiEndpoint: "/api/house/two",
            title: "투룸"
        }
    };
    const currentConfig = config[roomType];

    useEffect(() => {
        setSelectedHouse(null);
        setHouseList([]);
        setSearchText("");

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
            fetchHouseData(map.getCenter());

            window.kakao.maps.event.addListener(map, "dragend", () => {
                fetchHouseData(map.getCenter());
            });
        };

        const fetchHouseData = (center) => {
            const lat = center.getLat();
            const lng = center.getLng();
            fetch(`${baseUrl}${currentConfig.apiEndpoint}?lat=${lat}&lng=${lng}`, {
                method: "GET",
                credentials: "include",
            })
                .then(res => res.json())
                .then(data => {
                    setHouseList(data);
                    setupMarkers(data, mapRef.current);
                })
                .catch(err => console.error(err));
        };

        const setupMarkers = (houses, map) => {
            if (!window.kakao?.maps?.MarkerClusterer) return;
            if (clustererRef.current) {
                clustererRef.current.clear();
                clustererRef.current = null;
            }
            clustererRef.current = new window.kakao.maps.MarkerClusterer({
                map,
                averageCenter: true,
                minLevel: 5,
            });
            const markers = houses.filter(h => h.latitude && h.longitude).map(house => {
                const marker = new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(house.latitude, house.longitude),
                    title: house.name,
                });
                window.kakao.maps.event.addListener(marker, "click", () => setSelectedHouse(house));
                return marker;
            });
            clustererRef.current.addMarkers(markers);
        };

        if (!window.kakao?.maps) loadKakaoMapScript();
        else initMap();
    }, [baseUrl, roomType]);

    const toggleFilter = (type) => setFilters(prev => ({ ...prev, [type]: !prev[type] }));

    const applyFilter = () => {
        const filtered = houseList.filter(h => {
            const isType = (
                (filters.jeonse && h.rentType === '전세') ||
                (filters.monthly && h.rentType === '월세') ||
                (filters.short && h.rentType === '단기임대')
            );
            const rent = parseInt(h.rentPrc || 0);
            const deposit = parseInt(h.dealOrWarrantPrc || 0);
            const inRent = (!filters.minRent || rent >= filters.minRent) && (!filters.maxRent || rent <= filters.maxRent);
            const inDeposit = (!filters.minDeposit || deposit >= filters.minDeposit) && (!filters.maxDeposit || deposit <= filters.maxDeposit);
            return isType && inRent && inDeposit;
        });
        setHouseList(filtered);
    };

    const handleResultClick = (house) => {
        setSelectedHouse(selectedHouse?.id === house.id ? null : house);
        setMapCenter(house);
    };

    const setMapCenter = (house) => {
        if (window.kakao && window.kakao.maps && house.latitude && house.longitude) {
            const latlng = new window.kakao.maps.LatLng(house.latitude, house.longitude);
            mapRef.current.setCenter(latlng);
        }
    };

    const handleRouteSearch = async () => {
        if (!start || !end) return alert("출발지와 도착지를 입력하세요");
        const geocoder = new window.kakao.maps.services.Geocoder();

        const geocode = (addr) => new Promise((resolve, reject) => {
            geocoder.addressSearch(addr, (res, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    resolve(new window.kakao.maps.LatLng(res[0].y, res[0].x));
                } else reject("주소를 찾을 수 없습니다.");
            });
        });

        try {
            const [startLatLng, endLatLng] = await Promise.all([geocode(start), geocode(end)]);
            const polyline = new window.kakao.maps.Polyline({
                path: [startLatLng, endLatLng],
                strokeWeight: 4,
                strokeColor: '#FF6B3D',
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
            });
            polyline.setMap(mapRef.current);
            mapRef.current.setBounds(new window.kakao.maps.LatLngBounds(startLatLng, endLatLng));
        } catch (err) {
            alert(err);
        }
    };

    const filteredHouses = houseList.filter(h => {
        const target = `${h.region} ${h.buildingName} ${h.articleName}`.toLowerCase();
        return target.includes(searchText.toLowerCase());
    });

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
            <MapSidebar
                currentConfig={currentConfig}
                start={start}
                end={end}
                setStart={setStart}
                setEnd={setEnd}
                handleRouteSearch={handleRouteSearch}
                filters={filters}
                setFilters={setFilters}
                searchText={searchText}
                setSearchText={setSearchText}
                applyFilter={applyFilter}
                toggleFilter={toggleFilter}
                filteredHouses={filteredHouses}
                selectedHouse={selectedHouse}
                handleResultClick={handleResultClick}
            />
            <div style={{ flex: 1, position: "relative" }}>
                <div id="map" style={{ width: "100%", height: "100vh" }}></div>
                <AnimatePresence>
                    {selectedHouse && (
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ position: "absolute", top: 0, left: 0, height: "100%", width: 400, backgroundColor: "#fff", zIndex: 10, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
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
