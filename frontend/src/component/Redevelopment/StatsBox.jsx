import React from 'react';

// 거래 금액 통계
export const formatDealAmount = (amount) => {
    if (amount >= 10000) {
        // 1억 이상이면 억 단위 (단위: 원 → 억) 소수점 한 자리로 반올림
        return `${Number((amount / 10000).toFixed(1)).toLocaleString('ko-KR')}억원`;
    } else {
        // 1억 미만이면 만원 단위 (단위: 원 → 만원)
        return `${amount.toLocaleString('ko-KR')}만원`;
    }
};

const StatsBox = ({ stats }) => {
    if (!stats) return null;

    return (
        <div style={{ border: '2px solid #007bff', backgroundColor: '#f0f8ff', padding: '10px', marginBottom: '10px' }}>
            <strong>📊 3개월 간 거래 금액 통계</strong><br />
            최소금액: {formatDealAmount(stats.min)}<br />
            최대금액: {formatDealAmount(stats.max)}<br />
            평균금액: {formatDealAmount(stats.avg)}
        </div>
    );
};

export default StatsBox;
