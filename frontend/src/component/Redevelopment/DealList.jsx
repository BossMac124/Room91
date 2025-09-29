import React, { useState, useEffect, useRef } from 'react';
import { formatDealAmount } from "./StatsBox.jsx";

/**
 * [역할]
 * - 월별 그룹 + 리스트 렌더링
 * - 위치정보 없으면 지도 이동 비활성 + 배지
 * - 마커↔카드 선택 동기화: selectedDealId 변경 시 스크롤 + 플래시
 * - ✅ 카드 클릭 시 상세 모달 오픈: 모든 필드 표시(빈값 숨김/정보없음 토글)
 */

const groupDealsByMonth = (deals) => {
    return deals.reduce((acc, deal) => {
        const monthKey = `${deal.dealYear}-${String(deal.dealMonth).padStart(2, '0')}`;
        (acc[monthKey] ||= []).push(deal);
        return acc;
    }, {});
};

// 공통 헬퍼: 값이 비었는가?
const isEmpty = (v) =>
    v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || (typeof v === 'number' && Number.isNaN(v));

/** 층수 포맷: -1 → '지하', 그 외는 원래 값 그대로(문구 요구사항에 맞춤) */
const formatFloorValue = (floor) => {
    if (isEmpty(floor)) return null;
    const n = Number(floor);
    if (n === -1) return '지하';
    return String(floor);
};

// 개별 필드 한 줄
const InfoRow = ({ label, value, showEmpty }) => {
    const empty = isEmpty(value);
    if (empty && !showEmpty) return null; // 기본은 빈값 숨김
    return (
        <div style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
            <div style={{ minWidth: 110, color: '#666' }}>{label}</div>
            <div style={{ fontWeight: 600, color: empty ? '#9aa1a9' : '#111' }}>
                {empty ? '정보 없음' : value}
            </div>
        </div>
    );
};

// 상세 모달
const DealDetailModal = ({ open, deal, onClose }) => {
    const [showEmpty, setShowEmpty] = useState(false); // ✅ 빈 항목도 표시 토글(기본: 숨김)
    useEffect(() => setShowEmpty(false), [deal]); // 새 항목 열 때 초기화
    if (!open || !deal) return null;

    const closeOnBg = (e) => {
        if (e.target.dataset?.modalbg) onClose?.();
    };

    // 파생 표시값들
    const y = deal.dealYear, m = deal.dealMonth, d = deal.dealDay;
    const dealDate = !isEmpty(y) && !isEmpty(m) && !isEmpty(d)
        ? `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        : null;

    const money = !isEmpty(deal.dealAmount) ? `${formatDealAmount(deal.dealAmount)}` : null;

    return (
        <div
            data-modalbg
            onClick={closeOnBg}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}
            aria-modal="true"
            role="dialog"
        >
            <div
                style={{
                    width: 'min(760px, 92vw)',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                    padding: 20,
                }}
            >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>
                        {deal.aptName || deal.houseType || deal.dataType || '거래 상세'}
                    </h3>
                    <button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:18, cursor:'pointer' }} aria-label="닫기">✕</button>
                </div>

                {/* 상단 요약 */}
                <div style={{ fontSize: 14, color:'#666', marginBottom: 12 }}>
                    {[deal.district, deal.neighborhood, deal.jibun].filter(Boolean).join(' ')}
                    {dealDate ? ` | ${dealDate}` : ''}
                </div>

                {/* ✅ 빈 항목 표시 토글 */}
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13, color:'#555', marginBottom: 8 }}>
                    <input type="checkbox" checked={showEmpty} onChange={e => setShowEmpty(e.target.checked)} />
                    빈 항목도 표시(정보 없음)
                </label>

                {/* 필드 전부 출력 (빈값은 기본 숨김, 토글 시 '정보 없음') */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <InfoRow label="거래일" value={dealDate} showEmpty={showEmpty} />
                    <InfoRow label="시군구" value={deal.district} showEmpty={showEmpty} />
                    <InfoRow label="법정동" value={deal.neighborhood} showEmpty={showEmpty} />
                    <InfoRow label="지번" value={deal.jibun} showEmpty={showEmpty} />
                    <InfoRow label="아파트/건물명" value={deal.aptName} showEmpty={showEmpty} />
                    <InfoRow label="주택유형" value={deal.houseType} showEmpty={showEmpty} />
                    <InfoRow label="자료구분" value={deal.dataType} showEmpty={showEmpty} />
                    <InfoRow label="거래 금액" value={money} showEmpty={showEmpty} />
                    <InfoRow label="층수" value={formatFloorValue(deal.floor)} showEmpty={showEmpty} />
                    <InfoRow label="전용면적(㎡)" value={deal.excluUseAr} showEmpty={showEmpty} />
                    <InfoRow label="대지면적(㎡)" value={deal.plottageArea} showEmpty={showEmpty} />
                    <InfoRow label="거래면적(㎡)" value={deal.dealArea} showEmpty={showEmpty} />
                    <InfoRow label="지목" value={deal.jimok} showEmpty={showEmpty} />
                    <InfoRow label="용도지역" value={deal.landUse} showEmpty={showEmpty} />
                    <InfoRow label="지분거래유형" value={deal.shareDealingType} showEmpty={showEmpty} />
                    <InfoRow label="거래구분" value={deal.dealingGbn} showEmpty={showEmpty} />
                </div>

                <div style={{ marginTop: 18, textAlign:'right' }}>
                    <button
                        onClick={onClose}
                        style={{ padding:'8px 14px', borderRadius: 8, border:'1px solid #ddd', background:'#f6f7f9', cursor:'pointer' }}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

const DealList = ({
                      deals,
                      selectedNeighborhood,
                      onSelectDeal,
                      selectedDealId,
                      selectedMonth,
                      onMonthChange,
                      locationStatus = {},
                  }) => {
    const [groupedDeals, setGroupedDeals] = useState({});
    const [monthList, setMonthList] = useState([]);

    // 카드 DOM refs (자동 스크롤용)
    const itemRefs = useRef(new Map());
    // 플래시 애니메이션 대상 id
    const [flashId, setFlashId] = useState(null);
    // 상세 모달 상태
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailDeal, setDetailDeal] = useState(null);

    useEffect(() => {
        const grouped = groupDealsByMonth(deals);
        setGroupedDeals(grouped);

        const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        setMonthList(months);

        if (months.length > 0) {
            if (!selectedMonth) onMonthChange?.(months[0]);
            else if (!months.includes(selectedMonth)) onMonthChange?.(months[0]);
        }
    }, [deals]);

    // 선택 카드로 스크롤 + 플래시
    useEffect(() => {
        if (!selectedDealId) return;
        const el = itemRefs.current.get(selectedDealId);
        if (el?.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setFlashId(selectedDealId);
            const t = setTimeout(() => setFlashId(null), 900);
            return () => clearTimeout(t);
        }
    }, [selectedDealId, selectedMonth]);

    if (deals.length === 0 && selectedNeighborhood) {
        return <p>거래 내역이 없습니다.</p>;
    }

    const monthDeals = selectedMonth ? (groupedDeals[selectedMonth] || []) : [];

    // 카드 클릭: 상세 열기 + (좌표 있으면) 지도 선택/이동
    const handleCardClick = (deal, hasLocation) => {
        setDetailDeal(deal);
        setDetailOpen(true);
        if (hasLocation) onSelectDeal?.(deal);
    };

    return (
        <div>
            {/* 카드 플래시 하이라이트 CSS */}
            <style>{`
        @keyframes flashHighlight {
          0%   { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.0); }
          25%  { box-shadow: 0 0 0 6px rgba(30, 144, 255, 0.25); }
          50%  { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.0); }
          75%  { box-shadow: 0 0 0 6px rgba(30, 144, 255, 0.25); }
          100% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.0); }
        }
        .deal-card.flash-card { animation: flashHighlight 0.9s ease-out both; }
      `}</style>

            {monthList.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="monthSelect">📅 월 선택: </label>
                    <select
                        id="monthSelect"
                        value={selectedMonth || ''}
                        onChange={e => onMonthChange?.(e.target.value)}
                    >
                        {monthList.map(month => (
                            <option key={month} value={month}>
                                {month.replace('-', '년 ')}월
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedMonth && (
                <div key={selectedMonth}>
                    <h3>📅 {selectedMonth.replace('-', '년 ')}월 거래</h3>

                    {monthDeals.map((deal) => {
                        const isSelected = selectedDealId === deal.id;
                        const st = locationStatus[deal.id];
                        const hasLocation = st?.has === true;
                        const isDisabledMap = !hasLocation; // 지도 이동만 비활성
                        const shouldFlash = flashId === deal.id;

                        return (
                            <div
                                key={deal.id}
                                ref={(el) => {
                                    if (el) itemRefs.current.set(deal.id, el);
                                    else itemRefs.current.delete(deal.id);
                                }}
                                onClick={() => handleCardClick(deal, hasLocation)}
                                aria-selected={isSelected}
                                title={
                                    isDisabledMap
                                        ? '위치정보가 없어 지도 이동은 불가합니다. (상세만 열림)'
                                        : '상세 열기 및 지도로 이동'
                                }
                                className={`deal-card${shouldFlash ? ' flash-card' : ''}`}
                                style={{
                                    position: 'relative',
                                    border: isSelected ? '2px solid #1e90ff' : '1px solid #ccc',
                                    background: isSelected ? '#eaf4ff' : '#fff',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    opacity: isDisabledMap ? 0.85 : 1,
                                    transition: 'all .15s ease',
                                }}
                            >
                                {/* 위치정보 배지 */}
                                {isDisabledMap && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: 8, right: 8,
                                            fontSize: 12,
                                            padding: '2px 6px',
                                            borderRadius: 6,
                                            background: '#eee',
                                            color: '#666',
                                            border: '1px solid #ddd'
                                        }}
                                    >
                    위치정보 없음
                  </span>
                                )}

                                <strong>
                                    {(deal.dataType === '단독' || deal.dataType === '연립') ? deal.houseType : deal.dataType}
                                </strong><br />
                                날짜: {deal.dealYear}-{deal.dealMonth}-{deal.dealDay}<br />
                                거래금액: {formatDealAmount(deal.dealAmount)}<br />

                                {deal.dataType === '토지'}
                                {deal.dataType === '단독'}
                                {deal.dataType === '연립'}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 상세 모달 */}
            <DealDetailModal
                open={detailOpen}
                deal={detailDeal}
                onClose={() => setDetailOpen(false)}
            />
        </div>
    );
};

export default DealList;
