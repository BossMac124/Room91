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
    const [centerMarker, setCenterMarker] = useState(null); // 동 중심 마커
    const [dealMarkers, setDealMarkers] = useState([]);     // 거래별 마커 목록
    const [infoWindow, setInfoWindow] = useState(null);     // 단일 인포윈도우 재사용
    const geocodeCacheRef = React.useRef(new Map());        // 주소→좌표 캐시
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;

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
                // 1) 동 중심 이동 + 중심 마커
                searchAddress(`${selectedDistrict} ${neighborhood}`, { isCenter: true });
                // 2) 거래별 마커 찍기
                drawDealMarkers(data, selectedDistrict, neighborhood);
            })
            .catch(err => console.error('거래 내역 로딩 실패', err));
    };

    const searchAddress = async (address, options = {}) => {
        try {
            // 캐시에 있으면 API 호출 스킵
            if (geocodeCacheRef.current.has(address)) {
                return geocodeCacheRef.current.get(address);
            }
            const res = await fetch(`${baseUrl}/api/deals/geocoding?address=${encodeURIComponent(address)}`);

            // 404 등 실패 시, 에러 메시지 꺼내서 처리
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || '주소 검색 실패');
            }

            const data = await res.json(); // { latitude, longitude }
            const { latitude, longitude } = data;
            geocodeCacheRef.current.set(address, { latitude, longitude });

            if (latitude && longitude && options.isCenter) {
                const pos = new window.kakao.maps.LatLng(latitude, longitude);
                map.setCenter(pos);
                if (centerMarker) centerMarker.setMap(null);
                const newMarker = new window.kakao.maps.Marker({ map, position: pos, title: address });
                setCenterMarker(newMarker);
                }
            return { latitude, longitude };
        } catch (error) {
            console.error('주소 검색 실패:', error.message); // 사용자에게 경고창 띄우는 것도 가능
            return null;
        }
    };

    // 거래별 마커 그리기
    const drawDealMarkers = async (dealList, district, neighborhood) => {
        if (!map) return;
        // 기존 거래 마커 제거
        dealMarkers.forEach(m => m.setMap(null));
        setDealMarkers([]);

        const kakao = window.kakao;
        const markers = [];

        for (const deal of dealList) {
            // 주소 조합 규칙: 시군구 + 법정동 + 지번 (+ 아파트명 옵션)
            const addr = [district, neighborhood, deal.jibun, deal.aptName]
                .filter(Boolean)
                .join(' ');

            const geo = await searchAddress(addr);
            if (!geo) continue;

            const pos = new kakao.maps.LatLng(geo.latitude, geo.longitude);
            const marker = new kakao.maps.Marker({ map, position: pos, title: addr });
            marker.__deal = deal; // 클릭 시 참조하려고 붙여둠

            kakao.maps.event.addListener(marker, 'click', () => {
                openInfo(marker, deal, addr);
                map.setCenter(pos);
                map.setLevel(4);
            });

            markers.push(marker);
            // (선택) 너무 많으면 50~100개 등으로 제한
            // if (markers.length >= 100) break;
        }
        setDealMarkers(markers);
    };

    // 단일 인포윈도우 재사용
    const openInfo = (marker, deal, address) => {
        const kakao = window.kakao;
        const content = `
    <div style="padding:8px;max-width:220px;">
      <div style="font-weight:600;margin-bottom:4px;">${deal.dataType || ''} ${deal.houseType || ''}</div>
      <div>거래일: ${deal.dealYear}-${String(deal.dealMonth).padStart(2,'0')}-${String(deal.dealDay).padStart(2,'0')}</div>
      <div>금액: ${Number(deal.dealAmount).toLocaleString('ko-KR')}만원</div>
      <div style="color:#666;margin-top:4px;">${address}</div>
    </div>
  `;
        if (!infoWindow) {
            const iw = new kakao.maps.InfoWindow({ removable: true });
            setInfoWindow(iw);
            iw.setContent(content);
            iw.open(map, marker);
        } else {
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        }
    };

    // 리스트에서 항목 클릭 시 → 해당 거래 마커로 이동
    const handleSelectDeal = async (deal) => {
        const addr = [deal.district, deal.neighborhood, deal.jibun, deal.aptName]
            .filter(Boolean)
            .join(' ');
        const geo = await searchAddress(addr); // 캐시 덕분에 대부분 API 호출 안 함
        if (!geo) return;
        const kakao = window.kakao;
        const pos = new kakao.maps.LatLng(geo.latitude, geo.longitude);
        map.setCenter(pos);
        map.setLevel(4);
        // 해당 마커 찾아서 인포윈도우 오픈
        const target = dealMarkers.find(m => m.__deal === deal);
        if (target) openInfo(target, deal, addr);
    };


    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '400px', padding: '20px', overflowY: 'auto', borderRight: '1px solid #ccc', boxSizing: 'border-box' }}>
                <h2>재개발 거래 조회</h2>
                <LocationSelector
                    districts={districts}
                    neighborhoods={neighborhoods}
                    selectedDistrict={selectedDistrict}
                    selectedNeighborhood={selectedNeighborhood}
                    onDistrictChange={handleCityChange}
                    onNeighborhoodChange={handleNeighborhoodChange}
                />
                <StatsBox stats={stats} />
                <DealList
                   deals={deals}
                   selectedNeighborhood={selectedNeighborhood}
                   onSelectDeal={handleSelectDeal}
                />
            </div>
            <div id="map" style={{ flex: 1, height: '100%' }}></div>
        </div>
    );
};

export default Redevelopment;
