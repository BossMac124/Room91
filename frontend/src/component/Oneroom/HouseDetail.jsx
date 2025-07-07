import React from 'react';

const HouseDetail = ({ house, onClose }) => {
    if (!house) return null;

    const fields = [
        { label: '지역', value: house.region },
        { label: '방 타입', value: house.articleName },
        { label: '지불 유형', value: house.tradeTypeName },
        { label: '건물이름', value: house.buildingName },
        { label: '매물 층', value: house.floorInfo },
        { label: '전체 면적', value: house.area1 },
        { label: '사용 면적', value: house.area2 },
        { label: '방향', value: house.direction },
        { label: '월세', value: house.rentPrc },
        { label: '보증금', value: house.dealOrWarrantPrc },
        { label: '상세 설명', value: house.articleFeatureDesc },
        { label: '공인중개사', value: house.realtorName },
        { label: '등록일', value: house.articleConfirmYmd }
    ];

    return (
        <div className="p-4 bg-white border rounded shadow max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-orange-600">매물 상세 정보</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-orange-500 text-xl">×</button>
            </div>
            <div className="space-y-2 text-sm">
                {fields.map((f, i) => (
                    <div key={i} className="flex justify-between">
                        <span className="font-medium text-gray-700">{f.label}</span>
                        <span>{f.value || '-'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HouseDetail;
