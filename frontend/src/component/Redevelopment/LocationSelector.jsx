import React from 'react';

// 시군구 & 법정동 선택
const LocationSelector = ({ districts, neighborhoods, selectedDistrict, selectedNeighborhood, onDistrictChange, onNeighborhoodChange }) => {
    return (
        <>
            <select value={selectedDistrict} onChange={onDistrictChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                <option value="">시군구 선택</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={selectedNeighborhood} onChange={onNeighborhoodChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
                <option value="">법정동 선택</option>
                {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
        </>
    );
};

export default LocationSelector;
