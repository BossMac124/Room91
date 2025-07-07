import React from 'react';

const DirectionPanel = ({ start, end, result, onSearch }) => {
    return (
        <div className="space-y-3 mb-4">
            <input
                type="text"
                value={start}
                placeholder="출발지"
                className="w-full border px-3 py-2 rounded"
                readOnly
            />
            <input
                type="text"
                value={end}
                placeholder="도착지"
                className="w-full border px-3 py-2 rounded"
                readOnly
            />
            <button onClick={onSearch} className="w-full bg-orange-500 text-white py-2 rounded">
                길찾기
            </button>
            <div className="text-sm bg-white border rounded p-3 shadow">
                {result ? (
                    <>
                        <p>거리: {result.distance}</p>
                        <p>시간: {result.duration}</p>
                    </>
                ) : (
                    <p>여기에 길찾기 결과가 표시됩니다.</p>
                )}
            </div>
        </div>
    );
};

export default DirectionPanel;
