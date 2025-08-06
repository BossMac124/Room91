import React from "react";
import MapSearchFilter from "./MapSearchFilter.jsx";
import MapHouseList from "./MapHouseList.jsx";

const MapSidebar = ({ currentConfig, start, end, setStart, setEnd, handleRouteSearch, filters, setFilters, searchText, setSearchText, applyFilter, toggleFilter, filteredHouses, selectedHouse, handleResultClick }) => (
  <div style={{ width: 320, borderRight: "1px solid #eee", padding: 15, background: "#fff", zIndex: 20, display: "flex", flexDirection: "column", height: "100vh" }}>
    <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>{currentConfig.title} 매물 지도</div>
    <MapSearchFilter
      start={start}
      end={end}
      setStart={setStart}
      setEnd={setEnd}
      handleRouteSearch={handleRouteSearch}
      filters={filters}
      setFilters={setFilters}
      searchText={searchText}
      setSearchText={setSearchText}
      applyFilter={applyFilter}
      currentConfig={currentConfig}
      toggleFilter={toggleFilter}
    />
    <MapHouseList
      filteredHouses={filteredHouses}
      selectedHouse={selectedHouse}
      handleResultClick={handleResultClick}
    />
  </div>
);

export default MapSidebar;