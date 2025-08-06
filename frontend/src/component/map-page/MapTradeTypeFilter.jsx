import React from "react";

const MapTradeTypeFilter = ({ filters, toggleFilter }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    borderRadius: 8,
    padding: "8px 16px",
    position: "absolute",
    top: 20,
    right: 40,
    zIndex: 30
  }}>
    <span style={{ fontWeight: 700, marginRight: 12 }}>거래유형</span>
    <label style={{ marginRight: 10 }}>
      <input type="checkbox" checked={filters.jeonse} onChange={() => toggleFilter('jeonse')} /> 전세
    </label>
    <label style={{ marginRight: 10 }}>
      <input type="checkbox" checked={filters.monthly} onChange={() => toggleFilter('monthly')} /> 월세
    </label>
    <label>
      <input type="checkbox" checked={filters.short} onChange={() => toggleFilter('short')} /> 단기임대
    </label>
  </div>
);

export default MapTradeTypeFilter;