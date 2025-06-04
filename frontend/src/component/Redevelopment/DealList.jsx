import React from 'react';
import { formatDealAmount } from "./StatsBox.jsx";

const DealList = ({ deals, selectedNeighborhood }) => {
    if (deals.length === 0 && selectedNeighborhood) {
        return <p>거래 내역이 없습니다.</p>;
    }

    return deals.map((deal, idx) => (
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
    ));
};

export default DealList;
