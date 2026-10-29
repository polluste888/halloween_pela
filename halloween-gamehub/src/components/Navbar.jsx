import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: '🏠 Kodu' },
    { id: 'kuldvillak', label: '🏆 Kuldvillak' },
    { id: 'kahoot', label: '🔮 Viktoriin' },
    { id: 'party', label: '🎲 Peomängud' },
    { id: 'settings', label: '📜 Minu mängud' },
  ];

  return (
    <nav aria-label="Põhinavigatsioon" className="mb-6 flex flex-wrap justify-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 rounded-xl font-bold transition-all border-2 ${
            activeTab === tab.id
              ? 'nav-tab nav-tab-active'
                : 'nav-tab'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
