import React from "react";

/**
 * props
 * - filters, toggleFilter, setFilters, applyFilter
 * - center: {lat, lng} | null  // 지도 준비 여부 판단용
 */
const MapFilterBar = ({ filters, toggleFilter, setFilters, applyFilter, center }) => {
    const isJeonseOnly = filters.jeonse && !filters.monthly && !filters.short;
    const handleApply = () => {
        if (!center) return;     // 준비 전엔 조용히 무시
        applyFilter();
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                borderRadius: 8,
                padding: "12px 24px",
                position: "absolute",
                top: 20,
                right: 40,
                zIndex: 30,
                gap: 12,
            }}
        >
            {/* 첫 줄: 거래유형 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>거래유형</span>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={!!filters.jeonse} onChange={() => toggleFilter("jeonse")} />
                    <span>전세</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={!!filters.monthly} onChange={() => toggleFilter("monthly")} />
                    <span>월세</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={!!filters.short} onChange={() => toggleFilter("short")} />
                    <span>단기임대</span>
                </label>
            </div>

            {/* 둘째 줄: 월세/보증금 + 검색 */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>월세</span>
                    <input
                        type="number"
                        placeholder="최소"
                        value={filters.minRent ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, minRent: e.target.value }))}
                        style={{ width: 72 }}
                        disabled={isJeonseOnly}   // ✅ 전세만 선택 시 비활성화
                    />
                    <span>~</span>
                    <input
                        type="number"
                        placeholder="최대"
                        value={filters.maxRent ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, maxRent: e.target.value }))}
                        style={{ width: 72 }}
                        disabled={isJeonseOnly}   // ✅ 전세만 선택 시 비활성화
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>보증금</span>
                    <input
                        type="number"
                        placeholder="최소"
                        value={filters.minDeposit ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, minDeposit: e.target.value }))}
                        style={{ width: 88 }}
                    />
                    <span>~</span>
                    <input
                        type="number"
                        placeholder="최대"
                        value={filters.maxDeposit ?? ""}
                        onChange={(e) => setFilters((f) => ({ ...f, maxDeposit: e.target.value }))}
                        style={{ width: 88 }}
                    />
                </div>

                <button
                    onClick={handleApply}
                    disabled={!center}                // 지도 준비 전 비활성화
                    style={{
                        background: !center ? "#ddd" : "#FF6B3D",
                        color: "white",
                        padding: "8px 18px",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: 600,
                        cursor: !center ? "not-allowed" : "pointer",
                    }}
                >
                    검색
                </button>
            </div>
        </div>
    );
};

export default MapFilterBar;
