import React from "react";

const HouseDetailPanel = ({ house, onClose, roomType = "one" }) => {
    if (!house) return null;

    // 원룸과 투룸의 공통 필드
    const commonFields = [
        { label: '지역', value: house.region },
        { label: '방 타입', value: house.articleName },
        { label: '지불 유형', value: house.tradeTypeName },
        { label: '건물 이름', value: house.buildingName },
        { label: '매물 층', value: house.floorInfo },
        { label: '전체 면적', value: house.area1 },
        { label: '사용 면적', value: house.area2 },
        { label: '위도', value: house.latitude },
        { label: '경도', value: house.longitude },
        { label: '방향', value: house.direction },
        { label: '등록 날짜', value: house.articleConfirmYmd },
        { label: '월세', value: house.rentPrc },
        { label: '보증금', value: house.dealOrWarrantPrc },
        { label: '태그 리스트', value: house.tagList },
        { label: '상세 설명', value: house.articleFeatureDesc },
        { label: '엘리베이터 수', value: house.elevatorCount },
        { label: '동일 주소 매물수', value: house.sameAddrCnt },
        { label: '동일 주소 최소가', value: house.sameAddrMinPrc },
        { label: '공인중개사', value: house.realtorName },
        { label: '매물등록사이트 ID', value: house.cpid },
        { label: '매물등록사이트 이름', value: house.cpName },
        { label: 'PC URL', value: house.cpPcArticleUrl },
    ];

    // 원룸 전용 필드
    const oneRoomFields = [
        { label: '동일 주소 최고가', value: house.sameAddrMaxPrc },
        { label: '모바일 URL', value: house.cpMobileArticleUrl }
    ];

    // roomType에 따라 필드 결정
    const fields = roomType === "one" 
        ? [...commonFields, ...oneRoomFields]
        : commonFields;

    // 타이틀 결정
    const title = roomType === "one" ? "원룸 상세 정보" : "투룸 상세 정보";

    return (
        <div className="w-[400px] h-full overflow-y-auto bg-white border-r border-gray-200 shadow-md p-5">
            {/* 상단 타이틀 + 닫기 버튼 */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-xl font-bold text-orange-500">
                    {title}
                </h3>
                <button
                    onClick={onClose}
                    className="text-2xl font-bold text-gray-500 hover:text-orange-500 focus:outline-none transition-colors duration-200"
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>

            {/* 상세 정보 필드 출력 */}
            <div className="space-y-3">
                {fields.map(({ label, value }, index) => (
                    <div key={index} className="border-b pb-2">
                        <span className="font-medium text-gray-800">{label}:</span>{" "}
                        <span className="text-gray-600">
                            {value !== null && value !== undefined && value !== ""
                                ? value
                                : "-"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HouseDetailPanel; 