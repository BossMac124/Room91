import React from 'react';

const HouseList = ({ items, onSelect }) => {
    if (!items.length) return <p className="text-gray-500">매물 없음</p>;

    return (
        <div className="space-y-3">
            {items.map((h, i) => (
                <div
                    key={i}
                    onClick={() => onSelect(h)}
                    className="p-4 bg-white border rounded shadow cursor-pointer hover:bg-orange-100"
                >
                    <div className="font-bold text-orange-600">{h.buildingName || '-'}</div>
                    <div className="text-sm text-gray-600">
                        방타입: {h.articleName || '-'} / 월세: {h.rentPrc || '-'} / 보증금: {h.dealOrWarrantPrc || '-'} / 방향: {h.direction || '-'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HouseList;