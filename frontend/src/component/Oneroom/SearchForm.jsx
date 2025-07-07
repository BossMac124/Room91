import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
    const [address, setAddress] = useState('');
    const [filters, setFilters] = useState({
        tradeTypes: ['B1', 'B2'],
        rentPrcMin: '',
        rentPrcMax: '',
        dealPrcMin: '',
        dealPrcMax: ''
    });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!address) return alert('주소를 입력하세요');

        // 주소를 위도, 경도로 변환하는 예시 geocode (실제 API로 대체)
        fetch(`${baseUrl}/api/geocode?address=${encodeURIComponent(address)}`)
            .then(res => res.json())
            .then(data => {
                if (data.lat && data.lng) {
                    onSearch(data.lat, data.lng, filters);
                }
            })
            .catch(() => alert('주소 변환 실패'));
    };

    const updateFilter = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const toggleTradeType = (code) => {
        setFilters((prev) => {
            const newTypes = prev.tradeTypes.includes(code)
                ? prev.tradeTypes.filter(t => t !== code)
                : [...prev.tradeTypes, code];
            return { ...prev, tradeTypes: newTypes };
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <div>
                <label className="block text-sm font-medium mb-1">주소 검색</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="서울시 강남구 ..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">거래 유형</label>
                <div className="flex gap-3">
                    {['B1', 'B2', 'B3'].map(code => (
                        <label key={code} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.tradeTypes.includes(code)}
                                onChange={() => toggleTradeType(code)}
                            />
                            <span className="ml-1 text-sm">
                {code === 'B1' ? '전세' : code === 'B2' ? '월세' : '단기'}
              </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number"
                    className="border px-2 py-1 rounded"
                    placeholder="월세 최소"
                    value={filters.rentPrcMin}
                    onChange={(e) => updateFilter('rentPrcMin', e.target.value)}
                />
                <input
                    type="number"
                    className="border px-2 py-1 rounded"
                    placeholder="월세 최대"
                    value={filters.rentPrcMax}
                    onChange={(e) => updateFilter('rentPrcMax', e.target.value)}
                />
                <input
                    type="number"
                    className="border px-2 py-1 rounded"
                    placeholder="보증금 최소"
                    value={filters.dealPrcMin}
                    onChange={(e) => updateFilter('dealPrcMin', e.target.value)}
                />
                <input
                    type="number"
                    className="border px-2 py-1 rounded"
                    placeholder="보증금 최대"
                    value={filters.dealPrcMax}
                    onChange={(e) => updateFilter('dealPrcMax', e.target.value)}
                />
            </div>

            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded">
                검색
            </button>
        </form>
    );
};

export default SearchForm;
