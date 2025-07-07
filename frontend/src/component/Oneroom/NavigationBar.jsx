import React from 'react';

const NavigationBar = ({ selected, onSelect }) => {
    return (
        <nav className="bg-orange-500 text-white px-5 py-3 shadow flex justify-between items-center">
            <div className="font-bold text-lg flex items-center">
                <span className="ml-2">부동산 매물 지도</span>
            </div>
            <div>
                <button
                    className={`px-4 py-2 rounded mr-2 font-medium ${selected === 'one' ? 'bg-orange-700' : 'bg-white text-orange-600'}`}
                    onClick={() => onSelect('one')}
                >
                    원룸
                </button>
                <button
                    className={`px-4 py-2 rounded font-medium ${selected === 'two' ? 'bg-orange-700' : 'bg-white text-orange-600'}`}
                    onClick={() => onSelect('two')}
                >
                    투룸
                </button>
            </div>
        </nav>
    );
};

export default NavigationBar;