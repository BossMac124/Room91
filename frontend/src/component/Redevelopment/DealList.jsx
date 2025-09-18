import React, { useState, useEffect } from 'react';
import { formatDealAmount } from "./StatsBox.jsx";

// 월별로 그룹화하는 함수
const groupDealsByMonth = (deals) => {
    return deals.reduce((acc, deal) => {
        const monthKey = `${deal.dealYear}-${String(deal.dealMonth).padStart(2, '0')}`;
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(deal);
        return acc;
    }, {});
};

const DealList = ({ deals, selectedNeighborhood, onSelectDeal }) => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [groupedDeals, setGroupedDeals] = useState({});
    const [monthList, setMonthList] = useState([]);

    useEffect(() => {
        const grouped = groupDealsByMonth(deals);
        setGroupedDeals(grouped);

        const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // 최신순
        setMonthList(months);
        setSelectedMonth(months[0] || ''); // 기본값: 가장 최근 월
    }, [deals]);

    if (deals.length === 0 && selectedNeighborhood) {
        return <p>거래 내역이 없습니다.</p>;
    }

    return (
        <div>
            {monthList.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="monthSelect">📅 월 선택: </label>
                    <select
                        id="monthSelect"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
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
                    {groupedDeals[selectedMonth]?.map((deal, idx) => (
                        <div
                                  key={idx}
                                  style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}
                                  onClick={() => onSelectDeal?.(deal)}
                                  title="지도로 이동"
                        >
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
            )}
        </div>
    );
};

export default DealList;
