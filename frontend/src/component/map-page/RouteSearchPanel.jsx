import { useState } from "react";
import useDirections from "../hooks/useDirections.js";

export default function RouteSearchPanel({ mapRef, baseUrl }) {
    const { searchRoute, info, clear } = useDirections({ mapRef, baseUrl });
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSearch() {
        try {
            setLoading(true);
            await searchRoute({ start, end });
        } catch (e) {
            alert(e.message || "길찾기 실패");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: 12, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 12 }}>
            <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="출발지"
                   style={{ width: "100%", border: "1px solid #ccc", padding: 6, marginBottom: 6 }} />
            <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="도착지"
                   style={{ width: "100%", border: "1px solid #ccc", padding: 6, marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onSearch} disabled={loading}
                        style={{ flex: 1, background: "#FF6B3D", color: "#fff", padding: 10, border: "none", borderRadius: 6, fontWeight: 700 }}>
                    {loading ? "검색 중..." : "길찾기"}
                </button>
                <button onClick={clear}
                        style={{ width: 100, background: "#eee", padding: 10, border: "none", borderRadius: 6 }}>
                    초기화
                </button>
            </div>
            {info && (
                <div style={{ marginTop: 10, fontSize: 14, color: "#444" }}>
                    <div>거리: {info.distance}</div>
                    <div>시간: {info.duration}</div>
                </div>
            )}
        </div>
    );
}