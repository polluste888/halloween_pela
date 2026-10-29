import React, { useState } from 'react';

const teamEmojis = ['👻', '🎃', '🦇', '🧛', '🧙', '🧟', '🕷️', '💀', '🐈‍⬛', '🕸️'];

export default function TeamBar({ teams, onAddTeam, onDeleteTeam, onChangeTeamEmoji, onChangeScore }) {
  const [newTeamName, setNewTeamName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      onAddTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  return (
    <div className="team-score-panel bg-spooky-card border border-spooky-purple rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-spooky-orange">Tiimid:</span>
        {teams.length === 0 && <span className="text-sm text-purple-100/55">Lisa mängu alustamiseks esimene tiim.</span>}
        {teams.map((t) => (
          <div key={t.id} className="team-score-chip bg-purple-950/80 border border-spooky-orange/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <label className="team-identity">
              <span className="sr-only">Tiimi {t.name} tähis</span>
              <select
                className="team-emoji-select"
                value={t.emoji ?? '👻'}
                onChange={(event) => onChangeTeamEmoji(t.id, event.target.value)}
                aria-label={`Vali tiimi ${t.name} emoji`}
              >
                {teamEmojis.map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
              </select>
              <span className="team-name">{t.name}</span>
            </label>
            <span className="font-bold text-spooky-slime ml-1">{t.score} pt</span>
            <div className="flex gap-1 ml-2">
              <button aria-label={`Lisa tiimile ${t.name} 100 punkti`} onClick={() => onChangeScore(t.id, 100)} className="score-control score-control-add">+</button>
              <button aria-label={`Võta tiimilt ${t.name} 100 punkti maha`} onClick={() => onChangeScore(t.id, -100)} className="score-control score-control-remove">−</button>
            </div>
            <button
              type="button"
              onClick={() => onDeleteTeam(t.id)}
              className="team-delete-control"
              aria-label={`Kustuta tiim ${t.name}`}
              title={`Kustuta tiim ${t.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Uus tiim..."
          className="spooky-input team-name-input"
        />
        <button type="submit" className="spooky-button team-add-button">
          + Lisa
        </button>
      </form>
    </div>
  );
}
