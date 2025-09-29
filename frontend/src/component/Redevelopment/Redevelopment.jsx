import React, { useEffect, useState } from 'react';
import LocationSelector from "./LocationSelector.jsx";
import StatsBox from "./StatsBox.jsx";
import DealList from "./DealList.jsx";

/**
 * [역할/흐름]
 * - 시군구/법정동/월 선택에 따라 거래/통계를 로드하고, 카카오맵에 해당 월의 "정확 좌표"만 마커로 표시한다.
 * - 월 변경 시 이전 마커는 즉시 제거되고, 비동기 겹침을 막기 위해 드로우 시퀀스 토큰(drawSeq)으로
 *   이전 그리기 작업을 무효화한다(남는 마커 방지).
 * - 위치정보가 없는 거래는 DealList에서 '위치정보 없음' 배지로 비활성화하여 선택을 유도하지 않는다.
 */
const Redevelopment = () => {
    // ---------- 데이터/선택 상태 ----------
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
    const [stats, setStats] = useState(null);
    const [deals, setDeals] = useState([]);

    // 월/선택 거래
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDealId, setSelectedDealId] = useState(null);

    // ---------- 지도/마커/윈도우 ----------
    const [map, setMap] = useState(null);
    const [dealMarkers, setDealMarkers] = useState([]);
    const infoWindowRef = React.useRef(null);
    const activeMarkerRef = React.useRef(null);
    const markerMapRef = React.useRef(new Map()); // dealId -> marker

    // 마커 이미지
    const [defaultMarkerImage, setDefaultMarkerImage] = useState(null);   // 일반(빨강)
    const [selectedMarkerImage, setSelectedMarkerImage] = useState(null); // 선택(별)
    const [approxMarkerImage, setApproxMarkerImage] = useState(null);     // (현재 미사용)

    // 주소→좌표 캐시
    const geocodeCacheRef = React.useRef(new Map());

    // 거래별 위치 상태(리스트 비활성/배지용): { [dealId]: { has:boolean, approx:boolean } }
    const [locationStatus, setLocationStatus] = useState({});

    // ✅ 현재 진행 중인 "그리기 세션" 식별자(월 변경 시 증가시켜 과거 작업 무효화)
    const drawSeqRef = React.useRef(0);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;

    // ---------- 초기 로딩: 시군구 + Kakao SDK ----------
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

                // 마커 아이콘
                const kakao = window.kakao;
                setDefaultMarkerImage(new kakao.maps.MarkerImage(
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                    new kakao.maps.Size(24, 35)
                ));
                setApproxMarkerImage(new kakao.maps.MarkerImage(
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png",
                    new kakao.maps.Size(24, 35)
                ));
                setSelectedMarkerImage(new kakao.maps.MarkerImage(
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                    new kakao.maps.Size(24, 35)
                ));

                // 지도 빈 곳 클릭 → 선택 해제 + 인포윈도우 닫기 + 마커 아이콘 원복
                kakao.maps.event.addListener(mapInstance, 'click', () => {
                    const iw = infoWindowRef.current;
                    if (iw) iw.close();
                    activeMarkerRef.current = null;
                    setSelectedDealId(null);
                    updateMarkerIcons();
                });
            });
        };
        document.head.appendChild(script);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- 드롭다운 변경 ----------
    const handleCityChange = e => {
        const district = e.target.value;
        setSelectedDistrict(district);
        setSelectedNeighborhood('');
        setDeals([]);
        setStats(null);
        setSelectedMonth('');
        setSelectedDealId(null);
        setLocationStatus({});
        clearMarkers();

        if (!district) return;
        fetch(`${baseUrl}/api/deals/district/${district}/neighborhood`)
            .then(res => res.json())
            .then(setNeighborhoods)
            .catch(err => console.error('법정동 데이터 가져오기 실패', err));
    };

    const handleNeighborhoodChange = e => {
        const neighborhood = e.target.value;
        setSelectedNeighborhood(neighborhood);
        setSelectedMonth('');
        setSelectedDealId(null);
        setLocationStatus({});
        clearMarkers();

        if (!selectedDistrict || !neighborhood) return;

        fetch(`${baseUrl}/api/deals/district/${selectedDistrict}/neighborhood/${neighborhood}/stats`)
            .then(res => res.json())
            .then(setStats)
            .catch(err => console.error('통계 데이터 로딩 실패', err));

        fetch(`${baseUrl}/api/deals/district/${selectedDistrict}/neighborhood/${neighborhood}`)
            .then(res => res.json())
            .then(data => {
                setDeals(data);
                searchAddress(`${selectedDistrict} ${neighborhood}`, { isCenter: true });
                // 월 초기화는 DealList에서 최신 월을 선택해 onMonthChange를 호출 (↓ handleMonthChange)하도록 함
            })
            .catch(err => console.error('거래 내역 로딩 실패', err));
    };

    // ---------- 주소 → 좌표 (동 중심 이동) ----------
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
            const data = await res.json();
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

    // ---------- 거래 ID → 좌표 ----------
    const fetchDealLocation = async (dealId) => {
        try {
            const res = await fetch(`${baseUrl}/api/deals/${dealId}/location`);
            if (res.status === 404) return { notFound: true };
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json(); // { latitude, longitude, approx? }
        } catch (e) {
            console.error('좌표 조회 실패:', e);
            return { error: true };
        }
    };

    // ---------- 인포윈도우 ----------
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

        let iw = infoWindowRef.current;
        if (!iw) {
            iw = new kakao.maps.InfoWindow({ removable: true });
            infoWindowRef.current = iw;
        }

        // 동일 마커 토글
        if (activeMarkerRef.current === marker) {
            iw.close();
            activeMarkerRef.current = null;
            setSelectedDealId(null);
            updateMarkerIcons();
            return;
        }

        iw.setContent(content);
        iw.open(map, marker);
        activeMarkerRef.current = marker;
    };

    // ---------- 기존 마커/윈도우 정리 ----------
    const clearMarkers = () => {
        dealMarkers.forEach(m => m.setMap(null));
        setDealMarkers([]);
        markerMapRef.current.clear();

        if (infoWindowRef.current) infoWindowRef.current.close();
        activeMarkerRef.current = null;
    };

    // ---------- 마커 아이콘 갱신 ----------
    const updateMarkerIcons = (selectedId = null) => {
        markerMapRef.current.forEach((marker, dealId) => {
            if (!marker) return;
            const image = (selectedId && dealId === selectedId) ? selectedMarkerImage : defaultMarkerImage;
            if (image) marker.setImage(image);
        });
    };

    // ---------- 월 거래만(정확 좌표만) 마커로 그리기 + 드로우 시퀀스 검증 ----------
    const drawDealMarkers = async (dealList, district, neighborhood, seq) => {
        if (!map) return;

        // 혹시 남은 것 있으면 비우고 시작(이중 안전)
        clearMarkers();

        const kakao = window.kakao;
        const markers = [];

        for (const deal of dealList) {
            // 🔐 시퀀스 확인: 월이 바뀌었다면 즉시 중단
            if (seq !== drawSeqRef.current) return;

            const geo = await fetchDealLocation(deal.id);

            // 🔐 비동기 후에도 시퀀스 재확인(중간에 월 바뀌면 무효)
            if (seq !== drawSeqRef.current) return;

            if (!geo || geo.error || geo.notFound || geo.approx) continue; // 정확 좌표만 표기

            const pos = new kakao.maps.LatLng(geo.latitude, geo.longitude);
            const title = [district, neighborhood, deal.jibun, deal.aptName].filter(Boolean).join(' ');

            const marker = new kakao.maps.Marker({
                map,
                position: pos,
                title,
                image: defaultMarkerImage || undefined,
            });
            marker.__deal = deal;

            kakao.maps.event.addListener(marker, 'click', () => {
                // 시퀀스가 바뀌었다면 클릭 무시(이전 마커)
                if (seq !== drawSeqRef.current) return;

                const isSame = selectedDealId === deal.id;
                if (isSame) {
                    openInfo(marker, deal, title);
                    return;
                }
                setSelectedDealId(deal.id);
                openInfo(marker, deal, title);
                map.panTo(pos);
                updateMarkerIcons(deal.id);
            });

            markers.push(marker);
            markerMapRef.current.set(deal.id, marker);
        }

        // 🔐 마지막에도 시퀀스 확인 후 상태 반영
        if (seq !== drawSeqRef.current) {
            // 혹시 만들어둔 마커는 지도에서 제거
            markers.forEach(m => m.setMap(null));
            return;
        }

        setDealMarkers(markers);
        updateMarkerIcons(selectedDealId);
    };

    // ---------- 리스트 선택 → 지도 동기화(위치 없는 거래는 차단) ----------
    const handleSelectDeal = async (deal) => {
        const st = locationStatus[deal.id];
        if (!st?.has) return; // 위치 없음/근사 좌표는 선택 불가

        setSelectedDealId(deal.id);

        const geo = await fetchDealLocation(deal.id);
        if (!geo || geo.error) return;

        const kakao = window.kakao;
        const pos = new kakao.maps.LatLng(geo.latitude, geo.longitude);
        map.panTo(pos);

        const marker = markerMapRef.current.get(deal.id);
        const title = [deal.district, deal.neighborhood, deal.jibun, deal.aptName].filter(Boolean).join(' ');
        if (marker) openInfo(marker, deal, title);
        updateMarkerIcons(deal.id);
    };

    // ---------- 월 변경: 시퀀스 증가 → 위치상태 계산 → 해당 월만 마커 ----------
    const handleMonthChange = async (month) => {
        setSelectedMonth(month);
        setSelectedDealId(null);
        setLocationStatus({});
        clearMarkers();

        // ✅ 새로운 그리기 세션 시작(이전 draw 무효화)
        const seq = ++drawSeqRef.current;

        if (!month) return;

        const [y, m] = month.split('-').map(Number);
        const monthDeals = deals.filter(d => d.dealYear === y && d.dealMonth === m);

        // 위치 상태 미리 계산 (DealList 비활성/배지용)
        const entries = await Promise.all(
            monthDeals.map(async (d) => {
                const geo = await fetchDealLocation(d.id);
                const has = !!(geo && !geo.error && !geo.notFound && !geo.approx && geo.latitude && geo.longitude);
                const approx = !!(geo && geo.approx);
                return [d.id, { has, approx }];
            })
        );

        // 🔐 월이 바뀌었으면 결과 반영하지 않음
        if (seq !== drawSeqRef.current) return;

        const statusObj = Object.fromEntries(entries);
        setLocationStatus(statusObj);

        // 정확 좌표만 그리기
        const drawable = monthDeals.filter(d => statusObj[d.id]?.has);
        await drawDealMarkers(drawable, selectedDistrict, selectedNeighborhood, seq);
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
                    selectedDealId={selectedDealId}
                    selectedMonth={selectedMonth}
                    onMonthChange={handleMonthChange}
                    /** 위치 없는 거래 비활성/배지 표시용 상태 내려줌 */
                    locationStatus={locationStatus}
                />
            </div>
            <div id="map" style={{ flex: 1, height: '100%' }} />
        </div>
    );
};

export default Redevelopment;
