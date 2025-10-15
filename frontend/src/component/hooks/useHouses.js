import { useCallback, useEffect, useState } from "react";

export function useHouses({ baseUrl, endpoint, center, filters }) {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHouses = useCallback(
        async (signal) => {
            if (!center) return;
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("lat", center.lat);
                params.append("lng", center.lng);

                // ✅ 줌 레벨에 따라 동적으로 받은 radius 적용
                params.append("radius", filters?.radius ?? 3);

                if (filters?.jeonse) params.append("tradeTypes", "전세");
                if (filters?.monthly) params.append("tradeTypes", "월세");
                if (filters?.short) params.append("tradeTypes", "단기임대");
                if (filters?.minRent !== "") params.append("rentPrcMin", filters.minRent);
                if (filters?.maxRent !== "") params.append("rentPrcMax", filters.maxRent);
                if (filters?.minDeposit !== "") params.append("dealPrcMin", filters.minDeposit);
                if (filters?.maxDeposit !== "") params.append("dealPrcMax", filters.maxDeposit);

                const res = await fetch(`${baseUrl}${endpoint}?${params.toString()}`, { signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const body = await res.json();
                // 배열로 정규화
                const list =
                    Array.isArray(body)
                        ? body
                        : Array.isArray(body?.data)
                            ? body.data
                            : Array.isArray(body?.data?.content)
                                ? body.data.content
                                : [];
                setHouses(list);
            } catch (e) {
                if (e.name !== "AbortError") console.error("useHouses fetch error:", e);
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [baseUrl, endpoint, center?.lat, center?.lng, JSON.stringify(filters)]
    );

    // center나 필터(radius 포함) 변경 시 자동 조회
    useEffect(() => {
        const controller = new AbortController();
        fetchHouses(controller.signal);
        return () => controller.abort();
    }, [fetchHouses]);

    return { houses, loading, refetch: () => fetchHouses(), setHouses };
}
