import React, { useState } from 'react';

export default function QuestionModal({ activeQ, teams, onAwardPoints, onClose }) {
  const [showAnswer, setShowAnswer] = useState(false);

  if (!activeQ) return null;

  return (
    <div className="question-backdrop fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="question-dialog bg-spooky-card border-2 border-spooky-orange rounded-2xl max-w-2xl w-full p-6 text-center shadow-2xl">
        <span className="question-category text-spooky-purple uppercase font-bold text-sm tracking-widest block mb-2">
          {activeQ.cat} — {activeQ.item.pts} PUNKTI
        </span>
        
        <h2 className="question-text text-2xl md:text-3xl font-bold text-white mb-6 min-h-[100px] flex items-center justify-center">
          {activeQ.item.q}
        </h2>

        {showAnswer ? (
          <div className="answer-reveal bg-green-950/40 border border-spooky-slime/50 p-4 rounded-xl text-spooky-slime font-bold text-xl mb-6">
            Vastus: {activeQ.item.a}
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="spooky-button ritual-button mb-6 px-6 py-2"
          >
            Paljasta Vastus
          </button>
        )}

        <div className="border-t border-purple-900/50 pt-4">
          <p className="text-sm text-gray-400 mb-3">Määra punktid tiimile:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onAwardPoints(team.id, activeQ.item.pts, activeQ.item.id)}
                className="spooky-button team-award-button px-4 py-2"
              >
                + {team.emoji ?? '👻'} {team.name}
              </button>
            ))}
            <button
              onClick={() => onAwardPoints(null, 0, activeQ.item.id)}
              className="ghost-dismiss-button px-4 py-2"
            >
              Mitte keegi
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={onClose} className="modal-close-button text-gray-400 hover:text-white text-sm underline">
            Sulge ilma punkte andmata
          </button>
        </div>
      </div>
    </div>
  );
}
