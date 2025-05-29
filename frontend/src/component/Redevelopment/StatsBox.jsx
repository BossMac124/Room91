import React from 'react';

// 거래 금액 통계
const formatDealAmount = amount => `${(amount / 10000).toLocaleString('ko-KR')}억원`;

const StatsBox = ({ stats }) => {
    if (!stats) return null;

    return (
        <div style={{ border: '2px solid #007bff', backgroundColor: '#f0f8ff', padding: '10px', marginBottom: '10px' }}>
            <strong>📊 거래 금액 통계</strong><br />
            최소금액: {formatDealAmount(stats.min)}<br />
            최대금액: {formatDealAmount(stats.max)}<br />
            평균금액: {formatDealAmount(stats.avg)}
        </div>
    );
};

export default StatsBox;
