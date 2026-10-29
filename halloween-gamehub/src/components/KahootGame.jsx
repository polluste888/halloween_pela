import React, { useEffect, useRef, useState } from 'react';

const QUESTION_SECONDS = 20;

function getGameServerUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:5174`;
}

function QuizButton({ children, className = '', ...props }) {
  return <button className={`spooky-button ${className}`} {...props}>{children}</button>;
}

export default function KahootGame({ kData, rules }) {
  const [mode, setMode] = useState(() => new URLSearchParams(window.location.search).has('room') ? 'player-join' : 'choose');
  const [roomCode, setRoomCode] = useState(() => new URLSearchParams(window.location.search).get('room')?.replace(/\D/g, '').slice(0, 6) ?? '');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hostRoom, setHostRoom] = useState('');
  const [players, setPlayers] = useState([]);
  const [hostGame, setHostGame] = useState({ status: 'lobby', index: 0, answeredCount: 0, secondsLeft: QUESTION_SECONDS });
  const [playerGame, setPlayerGame] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const socketRef = useRef(null);
  const roleRef = useRef(null);
  const playerIdRef = useRef(null);
  const playerGameRef = useRef(null);
  const intentionallyLeavingRef = useRef(false);

  useEffect(() => () => {
    intentionallyLeavingRef.current = true;
    socketRef.current?.close();
  }, []);

  const sendMessage = (message) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      setError('Ühendus mänguserveriga katkes. Kontrolli, et arvuti mänguserver töötab.');
    }
  };

  const connectToServer = (onReady, onFailed) => {
    let socket;
    try {
      socket = new WebSocket(getGameServerUrl());
    } catch (connectionError) {
      onFailed(`Mänguserveriga ei saanud ühendust: ${connectionError.message}`);
      return;
    }

    socketRef.current = socket;
    socket.addEventListener('open', onReady, { once: true });
    socket.addEventListener('message', (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        setError('Mänguserver saatis vigase vastuse.');
        return;
      }

      if (message.type === 'error') {
        setError(message.message);
        setBusy(false);
        if (socketRef.current === socket) {
          socketRef.current = null;
          socket.close();
        }
        return;
      }

      if (message.type === 'room_created') {
        roleRef.current = 'host';
        playerIdRef.current = message.playerId;
        setHostRoom(message.code);
        setRoomCode(message.code);
        setMode('host');
        setBusy(false);
        return;
      }

      if (message.type === 'joined') {
        roleRef.current = 'player';
        playerIdRef.current = message.playerId;
        setRoomCode(message.code);
        setName(message.name);
        setMode('player');
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      if (message.type === 'room_state') {
        setPlayers(message.players ?? []);
        if (roleRef.current === 'host') {
          setHostGame(message.game);
        } else {
          const previousGame = playerGameRef.current;
          playerGameRef.current = message.game;
          if (previousGame?.status !== message.game.status || previousGame?.index !== message.game.index) {
            setSelectedAnswer(null);
          }
          setPlayerGame(message.game);
        }
        return;
      }

      if (message.type === 'room_closed') {
        if (!intentionallyLeavingRef.current) setError('Mängujuht lõpetas mängutoa.');
        setMode('choose');
        roleRef.current = null;
        playerIdRef.current = null;
        playerGameRef.current = null;
        setPlayerGame(null);
        setPlayers([]);
        socketRef.current = null;
        socket.close();
      }
    });

    socket.addEventListener('error', () => {
      const currentRole = roleRef.current;
      onFailed('Mänguserveriga ei saanud ühendust. Käivita arvutis `npm run server` ning veendu, et telefon ja arvuti on samas Wi-Fi-võrgus.');
      setBusy(false);
      if (socketRef.current === socket) socketRef.current = null;
      if (currentRole) setError('Ühendus mänguserveriga katkes. Käivita server uuesti ja loo uus mängutuba.');
    }, { once: true });

    socket.addEventListener('close', () => {
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      if (!intentionallyLeavingRef.current && roleRef.current) {
        setError('Ühendus mänguserveriga katkes.');
        roleRef.current = null;
        setMode('choose');
      }
    });
  };

  const startHostRoom = (event) => {
    event.preventDefault();
    if (!kData.length) {
      setError('Lisa enne mängujuhi märkmikus viktoriiniküsimusi.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    intentionallyLeavingRef.current = false;
    connectToServer(
      () => sendMessage({ type: 'room:create', name: name.trim() || 'Mängujuht', questions: kData }),
      (message) => {
        setError(message);
        setBusy(false);
      },
    );
  };

  const joinRoom = (event) => {
    event.preventDefault();
    const cleanCode = roomCode.replace(/\D/g, '').slice(0, 6);
    const cleanName = name.trim().slice(0, 24);
    if (cleanCode.length !== 6 || !cleanName) {
      setError('Sisesta kuuekohaline mängukood ja oma nimi.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    intentionallyLeavingRef.current = false;
    connectToServer(
      () => sendMessage({ type: 'room:join', code: cleanCode, name: cleanName }),
      (message) => {
        setError(message);
        setBusy(false);
      },
    );
  };

  const beginQuestion = () => sendMessage({ type: 'host:start' });
  const revealAnswer = () => sendMessage({ type: 'host:reveal' });

  const copyJoinLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', hostRoom);
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice('Liitumislink kopeeriti lõikelauale.');
    } catch {
      setNotice(`Jaga mängijatega aadressi ${url.toString()}`);
    }
  };

  const leaveRoom = () => {
    intentionallyLeavingRef.current = true;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({ type: 'room:leave' });
      socketRef.current.close();
    }
    socketRef.current = null;
    roleRef.current = null;
    playerIdRef.current = null;
    playerGameRef.current = null;
    setPlayers([]);
    setPlayerGame(null);
    setHostRoom('');
    setSelectedAnswer(null);
    setError('');
    setNotice('');
    setMode('choose');
    window.history.replaceState(null, '', window.location.pathname);
  };

  const startAgain = () => sendMessage({ type: 'host:restart' });

  const sharedSetupNotice = (
    <div role="status" className="mb-5 rounded-xl border border-spooky-orange/40 bg-black/30 p-4 text-left text-sm text-purple-100/80">
      <strong className="text-spooky-orange">Kohalik Wi-Fi-mäng.</strong>
      <p className="mt-1">Mänguserver töötab mängujuhi arvutis. Kõik seadmed peavad olema samas usaldatud Wi-Fi-võrgus. Käivitamise juhend on README failis.</p>
    </div>
  );

  if (!kData.length) {
    return (
      <section className="grave-card mx-auto max-w-3xl p-8 text-center">
        <p className="eyebrow">Mänguküsimused</p>
        <h2 className="font-creepster text-4xl text-spooky-orange">Halloweeni Kahoot</h2>
        <p className="mt-3 text-purple-100/70">Lisa enne viktoriiniküsimused mängujuhi märkmikus.</p>
      </section>
    );
  }

  if (mode === 'choose') {
    return (
      <section className="grave-card mx-auto max-w-3xl p-6 text-center sm:p-8">
        <p className="eyebrow">Mängi koos telefonidega</p>
        <h2 className="mb-2 font-creepster text-4xl text-spooky-orange">Halloweeni Kahoot</h2>
        <p className="mb-6 text-purple-100/65">Mängujuht loob toa oma arvutis. Teised avavad telefonis sama Wi-Fi-aadressi ja liituvad koodiga.</p>
        {sharedSetupNotice}
        <div className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => { setError(''); setMode('host-setup'); }} className="game-card p-6 text-left">
            <span className="text-3xl">🎃</span>
            <span className="mt-3 block text-lg font-bold text-spooky-orange">Olen mängujuht</span>
            <span className="mt-1 block text-sm text-purple-100/60">Loo mängutuba ja näita liitumiskoodi.</span>
          </button>
          <button type="button" onClick={() => { setError(''); setMode('player-join'); }} className="game-card p-6 text-left">
            <span className="text-3xl">📱</span>
            <span className="mt-3 block text-lg font-bold text-spooky-orange">Liitun mänguga</span>
            <span className="mt-1 block text-sm text-purple-100/60">Sisesta mängujuhi jagatud kood.</span>
          </button>
        </div>
        <p className="grave-card mt-5 p-4 text-left text-sm text-purple-100/60">{rules}</p>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      </section>
    );
  }

  if (mode === 'host-setup') {
    return (
      <section className="grave-card mx-auto max-w-xl p-6 sm:p-8">
        <button type="button" onClick={() => { setError(''); setMode('choose'); }} className="mb-5 text-sm text-purple-200/60 hover:text-spooky-orange">← Tagasi</button>
        <p className="eyebrow">Uue toa loomine</p>
        <h2 className="mb-5 font-creepster text-4xl text-spooky-orange">Mängujuht</h2>
        {sharedSetupNotice}
        <form onSubmit={startHostRoom} className="space-y-4">
          <label className="block text-left text-sm text-purple-100/80">
            Sinu nimi
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} placeholder="Mängujuht" className="spooky-input mt-1 w-full" />
          </label>
          <QuizButton type="submit" disabled={busy} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? 'Loon mängutuba...' : 'Loo mängutuba'}
          </QuizButton>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      </section>
    );
  }

  if (mode === 'player-join') {
    return (
      <section className="grave-card mx-auto max-w-xl p-6 sm:p-8">
        <button type="button" onClick={() => { setError(''); setMode('choose'); }} className="mb-5 text-sm text-purple-200/60 hover:text-spooky-orange">← Tagasi</button>
        <p className="eyebrow">Liitu telefonist</p>
        <h2 className="mb-5 font-creepster text-4xl text-spooky-orange">Sisene mängu</h2>
        {sharedSetupNotice}
        <form onSubmit={joinRoom} className="space-y-4">
          <label className="block text-left text-sm text-purple-100/80">
            Kuuekohaline mängukood
            <input inputMode="numeric" autoComplete="one-time-code" value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="spooky-input mt-1 w-full text-center text-3xl tracking-[0.3em]" />
          </label>
          <label className="block text-left text-sm text-purple-100/80">
            Mängijanimi
            <input autoComplete="nickname" value={name} onChange={(event) => setName(event.target.value)} maxLength={24} placeholder="Sinu nimi" className="spooky-input mt-1 w-full" />
          </label>
          <QuizButton type="submit" disabled={busy} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? 'Liitun...' : 'Liitu mänguga'}
          </QuizButton>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      </section>
    );
  }

  if (mode === 'host') {
    const question = hostGame.question;
    const leaderboard = [...players].sort((left, right) => right.score - left.score);
    return (
      <section className="grave-card mx-auto max-w-4xl p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Jaga koodi mängijatega</p>
            <h2 className="font-creepster text-4xl text-spooky-orange">Mängutuba {hostRoom}</h2>
            <p className="mt-1 text-sm text-purple-100/60">Kõik seadmed peavad olema samas Wi-Fi-võrgus. Mängujuhi arvuti peab avatuks jääma.</p>
          </div>
          <div className="flex gap-2">
            <QuizButton type="button" onClick={copyJoinLink}>Kopeeri liitumislink</QuizButton>
            <button type="button" onClick={leaveRoom} className="spooky-button spooky-button-muted">Lahku</button>
          </div>
        </div>
        {notice && <p role="status" className="mt-3 text-sm text-spooky-slime">{notice}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_260px]">
          <div className="rounded-xl border border-spooky-purple/40 bg-black/20 p-5 text-center sm:p-7">
            {hostGame.status === 'lobby' && (
              <>
                <p className="text-sm text-purple-100/60">Mängijad saavad liituda koodi järgi</p>
                <p className="my-4 font-mono text-6xl font-black tracking-[0.25em] text-spooky-orange">{hostRoom}</p>
                <p className="mb-5 text-sm text-purple-100/70">{players.length} mängijat ühendatud</p>
                <QuizButton type="button" onClick={beginQuestion} className="px-8 py-3 text-lg">Alusta viktoriini →</QuizButton>
              </>
            )}
            {hostGame.status === 'question' && question && (
              <>
                <p className="eyebrow">Küsimus {hostGame.index + 1} / {kData.length}</p>
                <div className="my-2 text-4xl font-black text-spooky-orange">{hostGame.secondsLeft}s</div>
                <h3 className="my-4 text-2xl font-bold">{question.q}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.opts.map((option, index) => (
                    <div key={`${index}-${option}`} className={`rounded-lg p-3 font-semibold text-white ${['bg-red-700', 'bg-blue-700', 'bg-yellow-600', 'bg-green-700'][index]}`}>
                      {['▲', '◆', '●', '■'][index]} {option}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-purple-100/65">{hostGame.answeredCount} / {players.length} vastust laekunud</p>
                <QuizButton type="button" onClick={revealAnswer} className="mt-4">Näita vastust</QuizButton>
              </>
            )}
            {hostGame.status === 'results' && question && (
              <>
                <p className="eyebrow">Küsimus {hostGame.index + 1} — vastus</p>
                <h3 className="my-4 text-2xl font-bold">{question.q}</h3>
                <p className="prompt-card text-xl font-bold text-spooky-slime">{question.opts[hostGame.correctIndex]}</p>
                <p className="mt-4 text-sm text-purple-100/65">{hostGame.answeredCount} / {players.length} mängijat vastas</p>
                <QuizButton type="button" onClick={() => sendMessage({ type: 'host:next' })} className="mt-5">
                  {hostGame.index + 1 < kData.length ? 'Järgmine küsimus →' : 'Vaata tulemusi →'}
                </QuizButton>
              </>
            )}
            {hostGame.status === 'finished' && (
              <>
                <p className="eyebrow">Mäng läbi</p>
                <h3 className="my-3 font-creepster text-4xl text-spooky-orange">Õudne tubli töö!</h3>
                <QuizButton type="button" onClick={startAgain}>Mängi uuesti</QuizButton>
              </>
            )}
          </div>

          <aside className="rounded-xl border border-spooky-purple/40 bg-black/20 p-4">
            <h3 className="font-bold text-spooky-orange">🏆 Mängijad ({players.length})</h3>
            {leaderboard.length ? (
              <ol className="mt-3 space-y-2">
                {leaderboard.map((player, index) => (
                  <li key={player.id} className="flex justify-between gap-2 text-sm">
                    <span className="truncate">{index + 1}. {player.name}</span>
                    <span className="font-bold text-spooky-slime">{player.score} p</span>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-sm text-purple-100/50">Ootame mängijaid...</p>}
          </aside>
        </div>
      </section>
    );
  }

  const activeQuestion = playerGame?.status === 'question' ? playerGame.question : null;
  const resultQuestion = playerGame?.status === 'results' ? playerGame.question : null;
  const myScore = players.find((player) => player.id === playerIdRef.current)?.score ?? 0;

  const submitAnswer = (optionIndex) => {
    if (selectedAnswer !== null || !playerGame) return;
    setSelectedAnswer(optionIndex);
    sendMessage({ type: 'player:answer', index: playerGame.index, optionIndex });
  };

  return (
    <section className="grave-card mx-auto max-w-2xl p-5 text-center sm:p-8">
      <p className="eyebrow">Mängutuba {roomCode}</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
      {playerGame?.status === 'lobby' && (
        <>
          <div className="my-5 text-5xl">👻</div>
          <h2 className="font-creepster text-4xl text-spooky-orange">Oled mängus, {name}!</h2>
          <p className="mt-2 text-purple-100/65">Vaata põhiekraani. Mäng algab kohe!</p>
          <p className="mt-5 text-sm text-purple-100/50">{players.length} mängijat ühendatud</p>
        </>
      )}
      {!playerGame && (
        <>
          <div className="my-5 animate-pulse text-5xl">🔮</div>
          <h2 className="font-creepster text-4xl text-spooky-orange">Ootan mängujuhti...</h2>
          <p className="mt-2 text-purple-100/65">Mänguga liitutud — küsimused ilmuvad siia.</p>
        </>
      )}
      {activeQuestion && (
        <>
          <p className="mt-3 text-sm font-bold text-spooky-orange">Küsimus {playerGame.index + 1} / {kData.length}</p>
          <h2 className="my-4 text-2xl font-bold">{activeQuestion.q}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeQuestion.opts.map((option, index) => (
              <button
                type="button"
                key={`${index}-${option}`}
                disabled={selectedAnswer !== null}
                onClick={() => submitAnswer(index)}
                className={`min-h-16 rounded-xl p-4 text-left font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${['bg-red-700', 'bg-blue-700', 'bg-yellow-600', 'bg-green-700'][index]} ${selectedAnswer === index ? 'ring-4 ring-white' : 'hover:brightness-125'}`}
              >
                {['▲', '◆', '●', '■'][index]} {option}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-4 text-purple-100/60">{selectedAnswer === null ? `${playerGame.secondsLeft} sekundit vastamiseks` : 'Vastus saadetud! Oota tulemusi.'}</p>
          <p className="mt-2 text-sm text-spooky-slime">Sinu punktid: {myScore}</p>
        </>
      )}
      {resultQuestion && (
        <>
          <p className="mt-3 text-sm font-bold text-spooky-orange">Õige vastus</p>
          <h2 className="my-4 text-2xl font-bold">{resultQuestion.q}</h2>
          <p className="prompt-card text-xl font-bold text-spooky-slime">{resultQuestion.opts[playerGame.correctIndex]}</p>
          <p className="mt-4 font-bold text-spooky-orange">Sinu punktid: {myScore}</p>
          <p className="mt-2 text-sm text-purple-100/60">Oota, kuni mängujuht alustab järgmist küsimust.</p>
        </>
      )}
      {playerGame?.status === 'finished' && (
        <>
          <div className="my-5 text-5xl">🏆</div>
          <h2 className="font-creepster text-4xl text-spooky-orange">Mäng läbi!</h2>
          <p className="mt-3 text-xl font-bold">Sinu tulemus: {myScore} punkti</p>
        </>
      )}
      <button type="button" onClick={leaveRoom} className="spooky-button spooky-button-muted mt-6">Lahku mängust</button>
    </section>
  );
}
