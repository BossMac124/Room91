import React from "react";

const HouseDetailPanel = ({ house, onClose, roomType = "one" }) => {
    if (!house) return null;

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

    const oneRoomFields = [
        { label: '동일 주소 최고가', value: house.sameAddrMaxPrc },
        { label: '모바일 URL', value: house.cpMobileArticleUrl }
    ];

    const fields = roomType === "one"
        ? [...commonFields, ...oneRoomFields]
        : commonFields;

    const title = roomType === "one" ? "원룸 상세 정보" : "투룸 상세 정보";

    return (
        <div style={{
            width: "400px",
            height: "100%",
            overflowY: "auto",
            backgroundColor: "white",
            borderRight: "1px solid #e5e7eb",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
            padding: "20px"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "12px",
                marginBottom: "16px",
                borderBottom: "1px solid #ddd"
            }}>
                <h3 style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#111827",
                    margin: 0
                }}>{title}</h3>
                <button
                    onClick={onClose}
                    style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#6B7280",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#f97316")}
                    onMouseLeave={(e) => (e.target.style.color = "#6B7280")}
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>

            <div>
                {fields.map(({ label, value }, index) => (
                    <div key={index} style={{
                        borderBottom: "1px solid #ddd",
                        paddingBottom: "8px",
                        marginBottom: "12px"
                    }}>
                        <span style={{
                            fontWeight: 500,
                            color: "#1f2937"
                        }}>{label}:</span>{" "}
                        <span style={{
                            color: "#4b5563"
                        }}>
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
