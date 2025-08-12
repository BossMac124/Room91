import React from "react";
import MapHouseList from "./MapHouseList.jsx";

const MapSidebar = ({
                        currentConfig,
                        searchText,
                        setSearchText,
                        applyFilter,
                        filteredHouses,
                        selectedHouse,
                        handleResultClick,
                        showTitle = true,
                    }) => (
    <div
        style={{
            width: 320,
            borderRight: "1px solid #eee",
            padding: 15,
            background: "#fff",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
        }}
    >
        {showTitle && (
            <div
                style={{
                    fontSize: 24,
                    fontWeight: 800,
                    marginBottom: 12,
                }}
            >
                {currentConfig.title} 매물 지도
            </div>
        )}

        {/* 🔎 키워드 검색 */}
        <div
            style={{
                padding: 12,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                borderRadius: 8,
                marginBottom: 12,
            }}
        >
            <input
                type="text"
                placeholder="건물명"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", padding: 8, borderRadius: 6, marginBottom: 8 }}
            />
            <button
                onClick={applyFilter}
                style={{ width: "100%", background: "#FF6B3D", color: "#fff", padding: 10, border: "none", borderRadius: 6, fontWeight: 700 }}
            >
                검색
            </button>
        </div>

        <MapHouseList
            filteredHouses={filteredHouses}
            selectedHouse={selectedHouse}
            handleResultClick={handleResultClick}
        />
    </div>
);

export default MapSidebar;