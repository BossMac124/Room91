import { useCallback, useEffect, useState } from "react";

export function useHouses({ baseUrl, endpoint, center, filters }) {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHouses = useCallback(async () => {
        if (!center) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("lat", center.lat);
            params.append("lng", center.lng);
            params.append("radius", 3);

            if (filters?.jeonse) params.append("tradeTypes", "전세");
            if (filters?.monthly) params.append("tradeTypes", "월세");
            if (filters?.short) params.append("tradeTypes", "단기임대");
            if (filters?.minRent !== "") params.append("rentPrcMin", filters.minRent);
            if (filters?.maxRent !== "") params.append("rentPrcMax", filters.maxRent);
            if (filters?.minDeposit !== "") params.append("dealPrcMin", filters.minDeposit);
            if (filters?.maxDeposit !== "") params.append("dealPrcMax", filters.maxDeposit);

            const res = await fetch(`${baseUrl}${endpoint}?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setHouses(data);
        } catch (e) {
            console.error("useHouses fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, endpoint, center, filters]);

    // center 변경 시 자동 조회
    useEffect(() => {
        fetchHouses();
    }, [fetchHouses]);

    return { houses, loading, refetch: fetchHouses, setHouses };
}