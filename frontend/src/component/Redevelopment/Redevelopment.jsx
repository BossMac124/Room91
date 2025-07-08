import React, { useEffect, useState } from 'react';
import LocationSelector from "./LocationSelector.jsx";
import StatsBox from "./StatsBox.jsx";
import DealList from "./DealList.jsx";

const Redevelopment = () => {
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
    const [stats, setStats] = useState(null);
    const [deals, setDeals] = useState([]);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

    useEffect(() => {
        fetch(`${baseUrl}/api/deals/district`)
            .then(res => res.json())
            .then(setDistricts)
            .catch(err => console.error('시군구 데이터 가져오기 실패', err));

        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                    level: 4
                };
                const mapInstance = new window.kakao.maps.Map(container, options);
                setMap(mapInstance);
            });
        };
        document.head.appendChild(script);
    }, []);

    const handleCityChange = e => {
        const district = e.target.value;
        setSelectedDistrict(district);
        setSelectedNeighborhood('');
        setDeals([]);
        setStats(null);

        fetch(`${baseUrl}/api/deals/district/${district}/neighborhood`)
            .then(res => res.json())
            .then(setNeighborhoods)
            .catch(err => console.error('법정동 데이터 가져오기 실패', err));
    };

    const handleNeighborhoodChange = e => {
        const neighborhood = e.target.value;
        setSelectedNeighborhood(neighborhood);

        if (!selectedDistrict || !neighborhood) return;

        fetch(`${baseUrl}/api/deals/district/${selectedDistrict}/neighborhood/${neighborhood}/stats`)
            .then(res => res.json())
            .then(setStats)
            .catch(err => console.error('통계 데이터 로딩 실패', err));

        fetch(`${baseUrl}/api/deals/district/${selectedDistrict}/neighborhood/${neighborhood}`)
            .then(res => res.json())
            .then(data => {
                setDeals(data);
                searchAddress(`${selectedDistrict} ${neighborhood}`);
            })
            .catch(err => console.error('거래 내역 로딩 실패', err));
    };

    const searchAddress = async (address) => {
        try {
            const res = await fetch(`${baseUrl}/api/deals/geocoding?address=${encodeURIComponent(address)}`);

            // 404 등 실패 시, 에러 메시지 꺼내서 처리
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || '주소 검색 실패');
            }

            const data = await res.json();
            const { latitude, longitude } = data;

            if (latitude && longitude) {
                const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
                map.setCenter(moveLatLng);

                if (marker) marker.setMap(null);
                const newMarker = new window.kakao.maps.Marker({
                    map,
                    position: moveLatLng,
                    title: address
                });
                setMarker(newMarker);
            }
        } catch (error) {
            console.error('주소 검색 실패:', error.message); // 사용자에게 경고창 띄우는 것도 가능
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '400px', padding: '20px', overflowY: 'auto', borderRight: '1px solid #ccc', boxSizing: 'border-box' }}>
                <h2>📍 재개발 지역 조회</h2>
                <LocationSelector
                    districts={districts}
                    neighborhoods={neighborhoods}
                    selectedDistrict={selectedDistrict}
                    selectedNeighborhood={selectedNeighborhood}
                    onDistrictChange={handleCityChange}
                    onNeighborhoodChange={handleNeighborhoodChange}
                />
                <StatsBox stats={stats} />
                <DealList deals={deals} selectedNeighborhood={selectedNeighborhood} />
            </div>
            <div id="map" style={{ flex: 1, height: '100%' }}></div>
        </div>
    );
};

export default Redevelopment;
