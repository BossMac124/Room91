import React, { useEffect, useState } from 'react';

const Redevelopment = () => {
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
    const [stats, setStats] = useState(null);
    const [deals, setDeals] = useState([]);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        fetch('/api/deals/district')
            .then(res => res.json())
            .then(setDistricts)
            .catch(err => console.error('시군구 데이터 가져오기 실패', err));

        const script = document.createElement('script');
        script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=d6d23793f0ca98625a72a1157e4c9fe7";
        script.onload = () => {
            const kakao = window.kakao;
            const container = document.getElementById('map');
            const options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 5
            };
            const mapInstance = new kakao.maps.Map(container, options);
            setMap(mapInstance);
        };
        document.head.appendChild(script);
    }, []);

    const handleCityChange = e => {
        const district = e.target.value;
        setSelectedDistrict(district);
        setSelectedNeighborhood('');
        setDeals([]);
        setStats(null);

        fetch(`/api/deals/district/${district}/neighborhood`)
            .then(res => res.json())
            .then(setNeighborhoods)
            .catch(err => console.error('법정동 데이터 가져오기 실패', err));
    };

    const handleNeighborhoodChange = e => {
        const neighborhood = e.target.value;
        setSelectedNeighborhood(neighborhood);

        if (!selectedDistrict || !neighborhood) return;

        fetch(`/api/deals/district/${selectedDistrict}/neighborhood/${neighborhood}/stats`)
            .then(res => res.json())
            .then(setStats)
            .catch(err => console.error('통계 데이터 로딩 실패', err));

        fetch(`/api/deals/district/${selectedDistrict}/neighborhood/${neighborhood}`)
            .then(res => res.json())
            .then(data => {
                setDeals(data);
                searchAddress(`${selectedDistrict} ${neighborhood}`);
            })
            .catch(err => console.error('거래 내역 로딩 실패', err));
    };

    // ✅ 수정된 searchAddress 함수 (백엔드 API 사용)
    const searchAddress = async (address) => {
        try {
            const res = await fetch(`/api/geocodeMap?address=${encodeURIComponent(address)}`);
            const data = await res.json();

            if (data.lat && data.lng) {
                const moveLatLng = new window.kakao.maps.LatLng(data.lat, data.lng);
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
            console.error('주소 검색 실패:', error);
        }
    };

    const formatDealAmount = amount => `${(amount / 10000).toLocaleString('ko-KR')}억원`;

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '400px', padding: '20px', overflowY: 'auto', borderRight: '1px solid #ccc', boxSizing: 'border-box' }}>
                <h2>📍 재개발 지역 조회</h2>
                <select value={selectedDistrict} onChange={handleCityChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                    <option value="">시군구 선택</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select value={selectedNeighborhood} onChange={handleNeighborhoodChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                    <option value="">법정동 선택</option>
                    {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                <div>
                    {stats && (
                        <div style={{ border: '2px solid #007bff', backgroundColor: '#f0f8ff', padding: '10px', marginBottom: '10px' }}>
                            <strong>📊 거래 금액 통계</strong><br />
                            최소금액: {formatDealAmount(stats.min)}<br />
                            최대금액: {formatDealAmount(stats.max)}<br />
                            평균금액: {formatDealAmount(stats.avg)}
                        </div>
                    )}

                    {deals.length === 0 && selectedNeighborhood && <p>거래 내역이 없습니다.</p>}

                    {deals.map((deal, idx) => (
                        <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                            <strong>{deal.dataType === '단독' || deal.dataType === '연립' ? deal.houseType : deal.dataType}</strong><br />
                            날짜: {deal.dealYear}-{deal.dealMonth}-{deal.dealDay}<br />
                            거래금액: {formatDealAmount(deal.dealAmount)}<br />
                            시군구: {deal.district}<br />
                            법정동: {deal.neighborhood}<br />
                            {deal.dataType === '토지' && <>
                                거래면적: {deal.dealArea} ㎡<br />
                                지목: {deal.jimok}<br />
                                용도지역: {deal.landUse}<br />
                                거래구분: {deal.dealingGbn}<br />
                            </>}
                            {deal.dataType === '단독' && <>
                                대지면적: {deal.plottageArea} ㎡<br />
                                자료구분: {deal.dataType}<br />
                            </>}
                            {deal.dataType === '연립' && <>
                                층수: {deal.floor}<br />
                                전용면적: {deal.excluUseAr} ㎡<br />
                                자료구분: {deal.dataType}<br />
                            </>}
                        </div>
                    ))}
                </div>
            </div>
            <div id="map" style={{ flex: 1, height: '100%' }}></div>
        </div>
    );
};

export default Redevelopment;
