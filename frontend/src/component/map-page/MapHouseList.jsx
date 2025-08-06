import React from "react";

const MapHouseList = ({ filteredHouses, selectedHouse, handleResultClick }) => (
  <div style={{ flex: 1, overflowY: "auto" }}>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {filteredHouses.map((house, idx) => (
        <li
          key={idx}
          onClick={() => handleResultClick(house)}
          style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "8px", borderRadius: "6px", background: selectedHouse?.id === house.id ? "#FFF7ED" : "#fff", cursor: "pointer", fontWeight: 500 }}
        >
          <div style={{ color: "#FF6B3D", fontWeight: 600 }}>{house.articleName || '-'}</div>
          <div style={{ fontSize: "14px", color: "#444" }}>월세: {house.rentPrc || '-'}</div>
          <div style={{ fontSize: "14px", color: "#444" }}>보증금: {house.dealOrWarrantPrc || '-'}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default MapHouseList;