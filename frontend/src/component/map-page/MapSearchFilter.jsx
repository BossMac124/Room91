import React from "react";

const MapSearchFilter = ({ start, end, setStart, setEnd, handleRouteSearch, filters, setFilters, searchText, setSearchText, applyFilter, currentConfig, toggleFilter }) => (
  <>
    <input value={start} onChange={(e) => setStart(e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: "6px", marginBottom: "6px" }} placeholder="출발지" />
    <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: "6px", marginBottom: "10px" }} placeholder="도착지" />
    <button onClick={handleRouteSearch} style={{ width: "100%", marginBottom: "16px", background: "#FF6B3D", color: "white", padding: "10px", border: "none", borderRadius: "4px", fontWeight: 600 }}>길찾기</button>
    <div style={{ padding: "12px", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", borderRadius: "8px", marginBottom: "16px" }}>
      <input type="text" placeholder="주소 및 키워드를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: "6px", marginTop: "10px", marginBottom: "10px" }} />
      <button onClick={applyFilter} style={{ width: "100%", background: "#FF6B3D", color: "white", padding: "10px", border: "none", borderRadius: "4px", fontWeight: 600 }}>검색</button>
    </div>
  </>
);

export default MapSearchFilter;