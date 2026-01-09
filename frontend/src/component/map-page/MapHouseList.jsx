import React from "react";

const badgeStyle = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "#FFF1E6",
    color: "#FF6B3D",
    border: "1px solid #FFD7C2",
};

function PriceLine({ tradeTypeName, deposit, rent }) {
    if (tradeTypeName === "전세") {
        return <div style={{ fontSize: 14, color: "#444" }}>전세가: {deposit || "-"}</div>;
    }
    if (tradeTypeName === "월세" || tradeTypeName === "단기임대") {
        return (
            <div style={{ fontSize: 14, color: "#444" }}>
                보증금/월세: {(deposit || "-")} / {(rent || "-")}
            </div>
        );
    }
    // 기타/미지정
    return (
        <>
            {deposit && <div style={{ fontSize: 14, color: "#444" }}>보증금: {deposit}</div>}
            {rent && <div style={{ fontSize: 14, color: "#444" }}>월세: {rent}</div>}
        </>
    );
}

const MapHouseList = ({ filteredHouses, selectedHouse, handleResultClick }) => (
    <div style={{ flex: 1, overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredHouses.map((house, idx) => {
                const isSelected = selectedHouse?.id === house.id;
                const tradeType = house.tradeTypeName || "미지정";
                return (
                    <li
                        key={house.id ?? idx}
                        onClick={() => handleResultClick(house)}
                        style={{
                            border: "1px solid #eee",
                            padding: 12,
                            marginBottom: 8,
                            borderRadius: 8,
                            background: isSelected ? "#FFF7ED" : "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <div style={{ color: "#FF6B3D", fontWeight: 700 }}>
                                {house.buildingName || "-"}
                            </div>
                            <span style={badgeStyle}>{tradeType}</span>
                        </div>

                        <PriceLine
                            tradeTypeName={tradeType}
                            deposit={house.dealOrWarrantPrc}
                            rent={house.rentPrc}
                        />

                        {/* 선택: 간단 설명/태그 일부 노출 */}
                        {house.tagList && (
                            <div style={{ marginTop: 6, fontSize: 12, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {Array.isArray(house.tagList) ? house.tagList.join(" · ") : house.tagList}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    </div>
);

export default MapHouseList;