import React, { useState } from 'react';

const aliasWords = ['Kõrvitsalatern', 'Ämblikuvõrk', 'Luud', 'Krahv Dracula', 'Surnuaed', 'Nõiakatel', 'Nahkhiir', 'Kummitus'];
const witchTasks = [
  'Tee 5 sekundit parimat vampiiri naeru!',
  'Kõnni nagu zombi ruumi teise otsa!',
  'Ütle kolm korda kiiresti „kõrvitsakomm“!',
  'Ulu nagu libahunt täiskuu poole!',
];
const mimePrompts = ['Nõid lendab luuaga', 'Zombi ärkab hauast', 'Vampiir otsib peeglist oma peegelpilti', 'Kummitus hõljub läbi seina', 'Muumia harutab sidemeid'];
const guesses = [
  { answer: 'Vampiir', clues: ['Ma väldin päevavalgust.', 'Mu lemmikjook on punane.', 'Väidetavalt ei näe ma peeglist oma nägu.'] },
  { answer: 'Kõrvitsalatern', clues: ['Mind kohtab sügisel.', 'Mu sees põleb väike tuli.', 'Minu näole lõigatakse tavaliselt naeratus.'] },
  { answer: 'Nahkhiir', clues: ['Olen aktiivne öösel.', 'Ripun puhates pea alaspidi.', 'Lendan, aga ma pole lind.'] },
  { answer: 'Nõid', clues: ['Mul võib olla terav kübar.', 'Mu lemmiktransport on luud.', 'Segan katlas võlujooke.'] },
];
function GameCard({ icon, title, description, rule, children }) {
  return (
    <article className="game-card flex flex-col p-5">
      <div>
        <span className="mb-3 block text-3xl" aria-hidden="true">{icon}</span>
        <h3 className="text-xl font-bold text-spooky-orange">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-purple-100/65">{description}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-purple-200/70 hover:text-spooky-orange">Juhend ja reeglid</summary>
          <p className="mt-2 rounded-lg border border-spooky-purple/40 bg-black/20 p-3 text-sm leading-relaxed text-purple-100/75">{rule}</p>
        </details>
      </div>
      <div className="mt-auto pt-5">{children}</div>
    </article>
  );
}

export default function PartyGames({ rules }) {
  const [witchTask, setWitchTask] = useState('');
  const [aliasWord, setAliasWord] = useState('');
  const [mimePrompt, setMimePrompt] = useState('');
  const [guessRound, setGuessRound] = useState(null);
  const [clueIndex, setClueIndex] = useState(0);
  const [showGuessAnswer, setShowGuessAnswer] = useState(false);

  const drawWitchTask = () => setWitchTask(witchTasks[Math.floor(Math.random() * witchTasks.length)]);
  const drawAliasWord = () => setAliasWord(aliasWords[Math.floor(Math.random() * aliasWords.length)]);
  const drawMimePrompt = () => setMimePrompt(mimePrompts[Math.floor(Math.random() * mimePrompts.length)]);
  const drawGuess = () => {
    setGuessRound(guesses[Math.floor(Math.random() * guesses.length)]);
    setClueIndex(0);
    setShowGuessAnswer(false);
  };
  return (
    <section>
      <div className="mb-5">
        <p className="eyebrow">Neli mängu igaks seltskonnaks</p>
        <h2 className="font-creepster text-4xl text-spooky-orange">Peomängud</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <GameCard icon="🧪" title="Nõiajoogi katel" description="Tõmba juhuslik Halloweeni-teemaline ülesanne." rule={rules.cauldron}>
          <button type="button" onClick={drawWitchTask} className="spooky-button w-full">Tõmba ülesanne</button>
          {witchTask && <p aria-live="polite" className="prompt-card mt-3">{witchTask}</p>}
        </GameCard>

        <GameCard icon="🧟" title="Surnuaia Alias" description="Seleta sõna oma tiimile seda ennast nimetamata." rule={rules.alias}>
          <button type="button" onClick={drawAliasWord} className="spooky-button w-full">Uus sõna</button>
          {aliasWord && <p aria-live="polite" className="prompt-card mt-3 text-2xl font-bold text-spooky-slime">{aliasWord}</p>}
        </GameCard>

        <GameCard icon="👻" title="Kummituse pantomiim" description="Esita tegelast või tegevust ilma rääkimata." rule={rules.mime}>
          <button type="button" onClick={drawMimePrompt} className="spooky-button w-full">Tõmba pantomiim</button>
          {mimePrompt && <p aria-live="polite" className="prompt-card mt-3">{mimePrompt}</p>}
        </GameCard>

        <GameCard icon="🔮" title="Koletise äraarvamine" description="Loe vihjeid ükshaaval ja lase tiimidel ära arvata." rule={rules.guess}>
          <button type="button" onClick={drawGuess} className="spooky-button w-full">{guessRound ? 'Uus mõistatus' : 'Alusta mõistatust'}</button>
          {guessRound && (
            <div className="prompt-card mt-3">
              <p>Vihje {clueIndex + 1}/{guessRound.clues.length}: {guessRound.clues[clueIndex]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {clueIndex < guessRound.clues.length - 1 && <button type="button" className="text-sm text-spooky-orange hover:underline" onClick={() => setClueIndex((index) => index + 1)}>Järgmine vihje</button>}
                <button type="button" className="text-sm text-spooky-slime hover:underline" onClick={() => setShowGuessAnswer(true)}>Näita vastust</button>
              </div>
              {showGuessAnswer && <p className="mt-2 font-bold text-spooky-slime">Vastus: {guessRound.answer}</p>}
            </div>
          )}
        </GameCard>

      </div>
    </section>
  );
}
