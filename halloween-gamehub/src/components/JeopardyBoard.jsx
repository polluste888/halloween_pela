import React from 'react';

const pointValues = [100, 200, 300, 400, 500];

export default function JeopardyBoard({ jData, completedQuestions, onSelectQuestion }) {
  if (!jData || jData.length === 0) {
    return (
      <div className="text-center py-12 bg-spooky-card border border-spooky-purple rounded-xl">
        <p className="text-xl text-spooky-orange">Kuldvillaku teemasid pole sisestatud!</p>
      </div>
    );
  }

  return (
    <div className="jeopardy-board">
      <div 
        className="jeopardy-grid grid"
        style={{ gridTemplateColumns: `repeat(${jData.length}, minmax(0, 1fr))` }}
      >
        {jData.map((category) => (
          <div 
            key={category.id} 
            className="jeopardy-category bg-gradient-to-b from-purple-900 to-spooky-purple border-2 border-spooky-orange p-4 rounded-xl text-center shadow-lg flex items-center justify-center min-h-[80px]"
          >
            <h3 className="font-bold text-lg md:text-xl text-white uppercase tracking-wider line-clamp-2">
              {category.cat}
            </h3>
          </div>
        ))}

        {pointValues.map((points) => (
          React.Children.toArray(
            jData.map((category) => {
              const item = category.items.find((question) => Number(question.pts) === points);
              if (!item) {
                return (
                  <button
                    key={`${category.id}-${points}`}
                    type="button"
                    disabled
                    className="jeopardy-tile jeopardy-tile-empty"
                    aria-label={`${category.cat}: ${points} punkti, lisa küsimus mängujuhi märkmikus`}
                    title="Lisa selle punktitaseme küsimus mängujuhi märkmikus"
                  >
                    <span>{points}</span>
                    <small>Lisa küsimus</small>
                  </button>
                );
              }

              const isDone = completedQuestions.includes(item.id);

              return (
                <button
                  disabled={isDone}
                  onClick={() => onSelectQuestion(category.cat, item)}
                  className={`jeopardy-tile ${
                    isDone
                      ? 'bg-black/40 border-gray-800 text-gray-700 cursor-not-allowed opacity-30'
                      : 'bg-gradient-to-br from-purple-950 to-slate-900 border-spooky-purple text-spooky-orange hover:border-spooky-orange hover:bg-spooky-orange hover:text-black hover:scale-105 cursor-pointer'
                  }`}
                >
                  {isDone ? '✓' : item.pts}
                </button>
              );
            })
          )
        ))}
      </div>
    </div>
  );
}
