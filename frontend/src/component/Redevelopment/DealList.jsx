import React, { useState, useEffect, useRef } from 'react';
import { formatDealAmount } from "./StatsBox.jsx";

/**
 * [역할]
 * - 거래 목록을 월별로 그룹화해 선택된 월만 렌더링
 * - 위치정보 없는 카드는 '위치정보 없음' 배지 + 클릭 비활성
 * - ✅ selectedDealId 변경 시 해당 카드로 스무스 스크롤 + 플래시 하이라이트
 *
 * [props]
 * - deals
 * - selectedNeighborhood
 * - onSelectDeal(deal)
 * - selectedDealId
 * - selectedMonth (YYYY-MM)
 * - onMonthChange(month)
 * - locationStatus: { [dealId]: { has:boolean, approx:boolean } }  // 선택사항, 기본 {}
 */
const groupDealsByMonth = (deals) => {
    return deals.reduce((acc, deal) => {
        const monthKey = `${deal.dealYear}-${String(deal.dealMonth).padStart(2, '0')}`;
        (acc[monthKey] ||= []).push(deal);
        return acc;
    }, {});
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

    // ✅ 카드 DOM 레퍼런스: deal.id → element
    const itemRefs = useRef(new Map());

    // ✅ 플래시 애니메이션 대상 id (잠깐 켰다가 끔)
    const [flashId, setFlashId] = useState(null);

    // 거래 데이터가 바뀌면 월 그룹/월 목록 재계산
    useEffect(() => {
        const grouped = groupDealsByMonth(deals);
        setGroupedDeals(grouped);

        const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // 최신월 우선
        setMonthList(months);

        // 1) 부모가 아직 month를 정하지 않았으면 최신 월로 초기화
        // 2) 선택된 month가 현재 데이터에 없으면 최신 월로 보정
        if (months.length > 0) {
            if (!selectedMonth) {
                onMonthChange?.(months[0]);
            } else if (!months.includes(selectedMonth)) {
                onMonthChange?.(months[0]);
            }
        }
    }, [deals]); // deals만 의존 (selectedMonth는 부모가 관리)

    // ✅ 선택 카드로 스크롤 + 플래시 하이라이트 트리거
    useEffect(() => {
        if (!selectedDealId) return;
        const el = itemRefs.current.get(selectedDealId);
        if (el?.scrollIntoView) {
            // 스크롤 먼저
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 그리고 하이라이트 애니메이션 트리거
            setFlashId(selectedDealId);
            const t = setTimeout(() => setFlashId(null), 900); // 애니메이션 주기와 맞춤
            return () => clearTimeout(t);
        }
    }, [selectedDealId, selectedMonth]); // 월 바뀐 직후에도 안정적으로 스크롤/플래시

    if (deals.length === 0 && selectedNeighborhood) {
        return <p>거래 내역이 없습니다.</p>;
    }

    const monthDeals = selectedMonth ? (groupedDeals[selectedMonth] || []) : [];

    return (
        <div>
            {/* 🔵 간단한 CSS 주입: 카드 플래시 하이라이트 */}
            <style>{`
        @keyframes flashHighlight {
          0%   { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.0); }
          25%  { box-shadow: 0 0 0 6px rgba(30, 144, 255, 0.25); }
          50%  { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.0); }
          75%  { box-shadow: 0 0 0 6px rgba(30, 144, 255, 0.25); }
          100% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.0); }
        }
        .deal-card.flash-card {
          animation: flashHighlight 0.9s ease-out both;
        }
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

                        // 위치 상태(없으면 기본 false)
                        const st = locationStatus[deal.id];
                        const hasLocation = st?.has === true;
                        const isDisabled = !hasLocation;

                        // 플래시 적용 대상인지
                        const shouldFlash = flashId === deal.id;

                        return (
                            <div
                                key={deal.id}
                                ref={(el) => {
                                    if (el) itemRefs.current.set(deal.id, el);
                                    else itemRefs.current.delete(deal.id);
                                }}
                                onClick={() => {
                                    if (isDisabled) return; // 위치 없으면 클릭 차단
                                    onSelectDeal?.(deal);
                                }}
                                aria-selected={isSelected}
                                aria-disabled={isDisabled}
                                title={isDisabled ? '위치정보가 없어 지도로 이동할 수 없습니다.' : '지도로 이동'}
                                className={`deal-card${shouldFlash ? ' flash-card' : ''}`}
                                style={{
                                    position: 'relative',
                                    border: isSelected ? '2px solid #1e90ff' : '1px solid #ccc',
                                    background: isSelected ? '#eaf4ff' : '#fff',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? 0.6 : 1,
                                    transition: 'all .15s ease',
                                }}
                            >
                                {/* 위치 상태 배지 */}
                                {isDisabled && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            fontSize: 12,
                                            padding: '2px 6px',
                                            borderRadius: 6,
                                            background: '#eee',
                                            color: '#666',
                                            border: '1px solid #ddd',
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
                                시군구: {deal.district}<br />
                                법정동: {deal.neighborhood}<br />

                                {deal.dataType === '토지' && (
                                    <>
                                        거래면적: {deal.dealArea} ㎡<br />
                                        지목: {deal.jimok}<br />
                                        용도지역: {deal.landUse}<br />
                                        거래구분: {deal.dealingGbn}<br />
                                    </>
                                )}

                                {deal.dataType === '단독' && (
                                    <>
                                        대지면적: {deal.plottageArea} ㎡<br />
                                        자료구분: {deal.dataType}<br />
                                    </>
                                )}

                                {deal.dataType === '연립' && (
                                    <>
                                        층수: {deal.floor}<br />
                                        전용면적: {deal.excluUseAr} ㎡<br />
                                        자료구분: {deal.dataType}<br />
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DealList;
