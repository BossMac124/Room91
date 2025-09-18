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
    const [dealMarkers, setDealMarkers] = useState([]);     // 거래별 마커 목록

    // 인포윈도우/활성 마커는 ref로 관리: 이벤트 콜백에서 최신값 보장
    const infoWindowRef = React.useRef(null);
    const activeMarkerRef = React.useRef(null);

    // 주소→좌표 캐시
    const geocodeCacheRef = React.useRef(new Map());

    // 마커 아이콘 이미지
    const [defaultMarkerImage, setDefaultMarkerImage] = useState(null);
    const [approxMarkerImage, setApproxMarkerImage] = useState(null);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;

    useEffect(() => {
        // 시군구 목록
        fetch(`${baseUrl}/api/deals/district`)
            .then(res => res.json())
            .then(setDistricts)
            .catch(err => console.error('시군구 데이터 가져오기 실패', err));

        // Kakao SDK 로드
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

                // 마커 아이콘 정의 (SDK 로드 후)
                const kakao = window.kakao;
                setDefaultMarkerImage(new kakao.maps.MarkerImage(
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                    new kakao.maps.Size(24, 35)
                ));
                setApproxMarkerImage(new kakao.maps.MarkerImage(
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png",
                    new kakao.maps.Size(24, 35)
                ));

                // 지도 빈 곳 클릭 시 열린 인포윈도우 닫기
                kakao.maps.event.addListener(mapInstance, 'click', () => {
                    const iw = infoWindowRef.current;
                    if (iw) iw.close();
                    activeMarkerRef.current = null;
                });
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
                console.log("📦 deals data", data);
                setDeals(data);
                // 1) 동 중심으로 카메라만 이동 (중심 마커는 만들지 않음)
                searchAddress(`${selectedDistrict} ${neighborhood}`, { isCenter: true });
                // 2) 거래별 마커 찍기
                drawDealMarkers(data, selectedDistrict, neighborhood);
            })
            .catch(err => console.error('거래 내역 로딩 실패', err));
    };

    // 주소 문자열 → 좌표 조회 (동 중심 이동용)
    const searchAddress = async (address, options = {}) => {
        try {
            if (geocodeCacheRef.current.has(address)) {
                const cached = geocodeCacheRef.current.get(address);
                if (options.isCenter && cached?.latitude && cached?.longitude && map) {
                    const pos = new window.kakao.maps.LatLng(cached.latitude, cached.longitude);
                    map.setCenter(pos);
                }
                return cached;
            }
            const res = await fetch(`${baseUrl}/api/deals/geocoding?address=${encodeURIComponent(address)}`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || '주소 검색 실패');
            }
            const data = await res.json(); // { latitude, longitude }
            const { latitude, longitude } = data;
            geocodeCacheRef.current.set(address, { latitude, longitude });

            if (latitude && longitude && options.isCenter && map) {
                const pos = new window.kakao.maps.LatLng(latitude, longitude);
                map.setCenter(pos);
            }
            return { latitude, longitude };
        } catch (error) {
            console.error('주소 검색 실패:', error.message);
            return null;
        }
    };

    // 거래 ID → 좌표 조회 (정확/폴백 포함)
    const fetchDealLocation = async (dealId) => {
        try {
            const res = await fetch(`${baseUrl}/api/deals/${dealId}/location`);
            if (res.status === 404) {
                // 좌표 자체가 없음(정확/근사 모두 실패)
                return { notFound: true };
            }
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
                }
            return await res.json(); // { latitude, longitude, approx? }
            } catch (e) {
            console.error('좌표 조회 실패:', e);
            return { error: true };
            }
        };

    // 단일 인포윈도우 토글 열기/닫기
    const openInfo = (marker, deal, address) => {
        const kakao = window.kakao;
        const content = `
      <div style="padding:8px;max-width:240px;">
        <div style="font-weight:600;margin-bottom:4px;">${deal.houseType || ''}</div>
        <div>거래일: ${deal.dealYear}-${String(deal.dealMonth).padStart(2,'0')}-${String(deal.dealDay).padStart(2,'0')}</div>
        <div>금액: ${Number(deal.dealAmount).toLocaleString('ko-KR')}만원</div>
        <div style="color:#666;margin-top:4px;">${address}</div>
      </div>
    `;

        // 인포윈도우 인스턴스 준비
        let iw = infoWindowRef.current;
        if (!iw) {
            iw = new kakao.maps.InfoWindow({ removable: true });
            infoWindowRef.current = iw;
        }

        // 같은 마커 재클릭 → 닫기
        if (activeMarkerRef.current === marker) {
            iw.close();
            activeMarkerRef.current = null;
            return;
        }

        // 다른 마커 → 내용 갱신 후 열기
        iw.setContent(content);
        iw.open(map, marker);
        activeMarkerRef.current = marker;
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
            const geo = await fetchDealLocation(deal.id);
            if (!geo || geo.error || geo.notFound || geo.approx) continue; // 표시 제외

            const pos = new kakao.maps.LatLng(geo.latitude, geo.longitude);
            const title = [district, neighborhood, deal.jibun, deal.aptName].filter(Boolean).join(' ');

            // 이미지는 초기화 전일 수 있으니 존재할 때만 옵션으로 전달
            const image = geo.approx ? approxMarkerImage : defaultMarkerImage;
            const markerOptions = { map, position: pos, title };
            if (image) markerOptions.image = image;

            const marker = new kakao.maps.Marker(markerOptions);
            marker.__deal = deal;

            kakao.maps.event.addListener(marker, 'click', () => {
                openInfo(marker, deal, title);
                // 부드럽게 이동
                map.panTo(pos);
                // 이동 종료 후 줌 보정(선택)
                const once = kakao.maps.event.addListener(map, 'idle', function () {
                    kakao.maps.event.removeListener(map, 'idle', once);
                    if (map.getLevel() > 4) map.setLevel(4);
                });
            });

            markers.push(marker);
            // 필요 시 개수 제한:
            // if (markers.length >= 100) break;
        }
        setDealMarkers(markers);
    };

    // 리스트에서 항목 클릭 → 해당 거래 마커로 이동 & 토글
    const handleSelectDeal = async (deal) => {
        const geo = await fetchDealLocation(deal.id);
        if (!geo || geo.error) return;
        // 404 or 근사 좌표는 표시/이동하지 않고 안내
        if (geo.notFound || geo.approx) {
            alert('이 매물은 정확한 좌표가 없어 지도에 표시하지 않습니다.');
            return;
        }
        const kakao = window.kakao;
        const pos = new kakao.maps.LatLng(geo.latitude, geo.longitude);

        map.panTo(pos);
        const once = kakao.maps.event.addListener(map, 'idle', function () {
            kakao.maps.event.removeListener(map, 'idle', once);
            if (map.getLevel() > 4) map.setLevel(4);
        });

        const target = dealMarkers.find(m => m.__deal === deal);
        const title = [deal.district, deal.neighborhood, deal.jibun, deal.aptName].filter(Boolean).join(' ');
        if (target) openInfo(target, deal, title); // 같은 항목 재클릭 시 닫힘
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
