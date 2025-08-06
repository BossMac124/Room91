import React from "react";

const MapSearchFilter = ({ start, end, setStart, setEnd, handleRouteSearch, filters, setFilters, searchText, setSearchText, applyFilter, currentConfig, toggleFilter }) => (
  <>
    <input value={start} onChange={(e) => setStart(e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: "6px", marginBottom: "6px" }} placeholder="출발지" />
    <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: "6px", marginBottom: "10px" }} placeholder="도착지" />
    <button onClick={handleRouteSearch} style={{ width: "100%", marginBottom: "16px", background: "#FF6B3D", color: "white", padding: "10px", border: "none", borderRadius: "4px", fontWeight: 600 }}>길찾기</button>
    <div style={{ padding: "12px", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", borderRadius: "8px", marginBottom: "16px" }}>
      <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>거래 유형</div>
      <div style={{ marginBottom: "10px" }}>
        <label><input type="checkbox" checked={filters.jeonse} onChange={() => toggleFilter('jeonse')} /> 전세</label>
        <label style={{ marginLeft: "8px" }}><input type="checkbox" checked={filters.monthly} onChange={() => toggleFilter('monthly')} /> 월세</label>
        <label style={{ marginLeft: "8px" }}><input type="checkbox" checked={filters.short} onChange={() => toggleFilter('short')} /> 단기임대</label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ marginBottom: "4px" }}>월세 범위 (만원)</div>
        <input type="number" placeholder="최소" value={filters.minRent} onChange={e => setFilters({ ...filters, minRent: e.target.value })} style={{ width: "100%", marginBottom: "6px" }} />
        <input type="number" placeholder="최대" value={filters.maxRent} onChange={e => setFilters({ ...filters, maxRent: e.target.value })} style={{ width: "100%" }} />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ marginBottom: "4px" }}>보증금 범위 (만원)</div>
        <input type="number" placeholder="최소" value={filters.minDeposit} onChange={e => setFilters({ ...filters, minDeposit: e.target.value })} style={{ width: "100%", marginBottom: "6px" }} />
        <input type="number" placeholder="최대" value={filters.maxDeposit} onChange={e => setFilters({ ...filters, maxDeposit: e.target.value })} style={{ width: "100%" }} />
      </div>
      <input type="text" placeholder="주소 및 키워드를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: "6px", marginTop: "10px", marginBottom: "10px" }} />
      <button onClick={applyFilter} style={{ width: "100%", background: "#FF6B3D", color: "white", padding: "10px", border: "none", borderRadius: "4px", fontWeight: 600 }}>검색</button>
    </div>
  </>
};

export default MapSearchFilter;