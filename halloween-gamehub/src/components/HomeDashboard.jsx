import React from 'react';

export default function HomeDashboard({ setActiveTab }) {
  const games = [
    { id: 'kuldvillak', icon: '🏆', title: 'Kuldvillak', tag: 'Tiimide lahing', desc: 'Valige kategooria ja punktisumma. Õige vastus toob tiimile punktid.' },
    { id: 'kahoot', icon: '🔮', title: 'Halloweeni viktoriin', tag: 'Mängi telefonist', desc: 'Kutsu mängijad telefonidega samasse ruumi ja mängige reaalajas.' },
    { id: 'party', icon: '🎲', title: 'Peomängud', tag: 'neli väljakutset', desc: 'Pantomiim, Alias, mõistatused ja muud õudsed seltskonnamängud.' },
    { id: 'settings', icon: '📜', title: 'Mängujuhi märkmik', tag: 'Sinu reeglid', desc: 'Lisa oma küsimusi, vastuseid, teemasid ja mängureegleid.' },
  ];

  return (
    <div className="space-y-8">
      <div className="hero-card overflow-hidden p-8 text-center sm:p-12">
        <div className="hero-content">
          <p className="hero-stamp"><span aria-hidden="true">✦</span> Halloweeni eri <span aria-hidden="true">✦</span></p>
          <p className="eyebrow">Tule sisse, kui julged</p>
          <h2 className="font-creepster text-4xl text-spooky-orange sm:text-5xl">Tere tulemast mängupessa</h2>
          <p className="mx-auto mt-3 max-w-xl text-purple-100/75">Kogu oma tiim kokku, vali mäng ja muuda reegleid enda seltskonna järgi. Küünlad on valmis — kas sina oled?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => setActiveTab('kuldvillak')} className="spooky-button hero-cta"><span aria-hidden="true">🕯</span> Alusta mängu</button>
            <button onClick={() => setActiveTab('settings')} className="spooky-button spooky-button-muted"><span aria-hidden="true">✍</span> Lisa oma küsimused</button>
          </div>
          <div className="hero-promises">
            <span><i aria-hidden="true">☠</i> Mängi oma reeglitega</span>
            <span><i aria-hidden="true">☾</i> Telefoniviktoriin</span>
            <span><i aria-hidden="true">♟</i> Tiimide punktid</span>
          </div>
        </div>
      </div>

      <div>
        <div className="game-shelf-heading">
          <div>
            <p className="eyebrow">Neli ust. Üks pikk öö.</p>
            <h2 className="mb-4 font-creepster text-3xl text-purple-100">Vali oma mäng</h2>
          </div>
          <span className="shelf-candle" aria-hidden="true">🕯️</span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {games.map((g) => (
          <article key={g.id} className={`game-card game-card-${g.id} flex flex-col p-5`}>
            <div>
              <div className="game-card-heading">
                <span className="game-card-icon" aria-hidden="true">{g.icon}</span>
                <span className="game-card-tag">{g.tag}</span>
              </div>
              <h3 className="text-xl font-bold text-spooky-orange">{g.title}</h3>
              <p className="mt-2 min-h-12 text-sm text-purple-100/60">{g.desc}</p>
            </div>
            <button
              onClick={() => setActiveTab(g.id)}
              className="spooky-button card-cta mt-5 w-full"
            >
              <span>Ava mäng</span><span aria-hidden="true">⟶</span>
            </button>
          </article>
        ))}
        </div>
      </div>
    </div>
  );
}
