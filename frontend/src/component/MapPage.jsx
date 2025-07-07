// src/pages/MapPage.jsx
import React, { useState } from 'react';
import NavigationBar from './Oneroom/NavigationBar';
import SearchForm from './Oneroom/SearchForm';
import DirectionPanel from './Oneroom/DirectionPanel';
import HouseList from './Oneroom/HouseList';
import HouseDetail from './Oneroom/HouseDetail';
import MapContainer from './Oneroom/MapContainer';

const MapPage = () => {
    const [selectedType, setSelectedType] = useState('one');
    const [houseList, setHouseList] = useState([]);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [directionResult, setDirectionResult] = useState(null);
    const [searchedAddress, setSearchedAddress] = useState('');
    const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const handleSearch = (lat, lng, filters) => {
        const { tradeTypes, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax } = filters;
        const params = new URLSearchParams({
            lat, lng, radius: 3, rentPrcMin, rentPrcMax, dealPrcMin, dealPrcMax
        });
        tradeTypes.forEach(code => params.append('tradeTypeCodes', code));

        fetch(`${baseUrl}/api/house${selectedType === 'two' ? '/two' : ''}?${params}`)
            .then(res => res.json())
            .then(data => {
                setHouseList(data);
                setMapCenter({ lat, lng });
            })
            .catch(() => alert('매물 조회 실패'));

        setDirectionResult(null);
        setSelectedHouse(null);
    };

    const handleDirection = () => {
        if (!searchedAddress || !selectedHouse) {
            alert('출발지와 도착지를 모두 지정하세요.');
            return;
        }
        const params = new URLSearchParams({
            originLat: '', originLng: '',
            destLat: selectedHouse.latitude,
            destLng: selectedHouse.longitude
        });

        fetch(`${baseUrl}/api/house/direction?${params}`)
            .then(res => res.json())
            .then(data => setDirectionResult(data))
            .catch(() => alert('길찾기 실패'));
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-['Noto_Sans_KR']">
            {/* 지도 배경 */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={mapCenter}
                    markers={houseList.map(h => ({
                        lat: h.latitude,
                        lng: h.longitude,
                        name: h.buildingName
                    }))}
                    selected={selectedHouse}
                />
            </div>

            {/* 상단 바 */}
            <div className="absolute top-0 left-0 w-full z-20">
                <NavigationBar selected={selectedType} onSelect={setSelectedType} />
            </div>

            {/* 왼쪽 사이드바 */}
            <aside className="absolute top-[60px] left-0 w-[360px] h-[calc(100%-60px)] bg-white border-r border-[#eee] p-4 z-10 overflow-y-auto space-y-4">
                <SearchForm
                    onSearch={(lat, lng, filters) => {
                        setSearchedAddress('출발지');
                        handleSearch(lat, lng, filters);
                    }}
                />
                <DirectionPanel
                    start={searchedAddress}
                    end={selectedHouse?.buildingName || ''}
                    result={directionResult}
                    onSearch={handleDirection}
                />
                <HouseList items={houseList} onSelect={setSelectedHouse} />
            </aside>

            {/* 상세 정보 */}
            {selectedHouse && (
                <section className="absolute top-[80px] right-4 z-20 bg-white p-4 shadow-lg rounded-lg max-w-[400px]">
                    <HouseDetail
                        house={selectedHouse}
                        onClose={() => setSelectedHouse(null)}
                    />
                </section>
            )}
        </div>
    );
};

export default MapPage;
