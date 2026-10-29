import React, { useEffect, useState } from 'react';
import HomeDashboard from './components/HomeDashboard';
import JeopardyBoard from './components/JeopardyBoard';
import QuestionModal from './components/QuestionModal';
import KahootGame from './components/KahootGame';
import PartyGames from './components/PartyGames';
import SettingsPanel from './components/SettingsPanel';
import TeamBar from './components/TeamBar';
import { DEFAULT_GAME_RULES, DEFAULT_J_DATA, DEFAULT_TEAMS } from './data/defaultData';

function readStoredData(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function readJeopardyData() {
  const savedData = readStoredData('halloween_jdata_v2', DEFAULT_J_DATA);
  const migrationKey = 'halloween_jeopardy_categories_100_500_v3';
  if (localStorage.getItem(migrationKey)) return savedData;

  const upgradedData = savedData.map((category) => {
    const defaults = DEFAULT_J_DATA.find((item) => item.id === category.id);
    if (!defaults) return category;

    const existingPoints = new Set(category.items.map((item) => Number(item.pts)));
    const extraQuestions = defaults.items.filter((item) => (
      item.pts >= 400 && !existingPoints.has(item.pts)
    ));
    return { ...category, items: [...category.items, ...extraQuestions] };
  });
  const existingCategoryIds = new Set(upgradedData.map((category) => category.id));
  const missingCategories = DEFAULT_J_DATA.filter((category) => !existingCategoryIds.has(category.id));
  upgradedData.push(...missingCategories);

  localStorage.setItem('halloween_jdata_v2', JSON.stringify(upgradedData));
  localStorage.setItem(migrationKey, 'true');
  return upgradedData;
}

function readStoredTeams() {
  const teams = readStoredData('halloween_teams_v2', DEFAULT_TEAMS);
  const defaultTeamNames = new Set(['vampiirid', 'nõiad']);
  return teams.filter((team) => !defaultTeamNames.has(team.name.trim().toLocaleLowerCase('et-EE')));
}

function makeQuizQuestions(data) {
  const answers = [...new Set(data.flatMap((category) => category.items.map((item) => item.a)))];
  return data.flatMap((category) => category.items.map((item) => {
    const options = [item.a, ...answers.filter((answer) => answer !== item.a).slice(0, 3)];
    while (options.length < 4) options.push(`Muu vastus ${options.length}`);
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }
    return { id: `quiz-${item.id}`, q: item.q, opts: options, correct: options.indexOf(item.a) };
  }));
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => (
    new URLSearchParams(window.location.search).has('room') ? 'kahoot' : 'home'
  ));
  const [jData, setJData] = useState(readJeopardyData);
  const [quizQuestions, setQuizQuestions] = useState(() => {
    const saved = localStorage.getItem('halloween_kahoot_questions_v1');
    return saved ? JSON.parse(saved) : makeQuizQuestions(readStoredData('halloween_jdata_v2', DEFAULT_J_DATA));
  });
  const [teams, setTeams] = useState(readStoredTeams);
  const [rules, setRules] = useState(() => ({
    ...DEFAULT_GAME_RULES,
    ...readStoredData('halloween_rules_v1', {}),
  }));
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [activeQ, setActiveQ] = useState(null);
  const [youtubePlayerOpen, setYoutubePlayerOpen] = useState(false);
  const screenTitles = {
    kuldvillak: 'Kuldvillak',
    kahoot: 'Halloweeni viktoriin',
    party: 'Peomängud',
    settings: 'Mängujuhi märkmik',
  };
  const currentTitle = screenTitles[activeTab];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const returnHome = () => {
    setActiveTab('home');
    setActiveQ(null);
  };
  useEffect(() => {
    localStorage.setItem('halloween_jdata_v2', JSON.stringify(jData));
  }, [jData]);

  useEffect(() => {
    localStorage.setItem('halloween_kahoot_questions_v1', JSON.stringify(quizQuestions));
  }, [quizQuestions]);

  useEffect(() => {
    localStorage.setItem('halloween_teams_v2', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('halloween_rules_v1', JSON.stringify(rules));
  }, [rules]);

  const handleAddTeam = (name) => {
    setTeams((current) => [...current, { id: `t-${Date.now()}`, name, emoji: '👻', score: 0 }]);
  };

  const handleDeleteTeam = (teamId) => {
    setTeams((current) => current.filter((team) => team.id !== teamId));
  };

  const handleChangeTeamEmoji = (teamId, emoji) => {
    setTeams((current) => current.map((team) => team.id === teamId ? { ...team, emoji } : team));
  };

  const handleChangeScore = (teamId, delta) => {
    setTeams((current) => current.map((team) => team.id === teamId
      ? { ...team, score: team.score + delta }
      : team));
  };

  const handleAwardPoints = (teamId, points, questionId) => {
    if (teamId) handleChangeScore(teamId, points);
    setCompletedQuestions((current) => [...current, questionId]);
    setActiveQ(null);
  };

  return (
    <div className={`app-shell mx-auto min-h-screen max-w-7xl px-4 pb-12 sm:px-6 ${activeTab === 'kuldvillak' ? 'app-shell-jeopardy' : ''}`}>
      <div className="haunting-atmosphere" aria-hidden="true">
        <span className="blood-moon" />
        <span className="lightning-glow" />
        <span className="drifting-fog fog-low" />
        <span className="drifting-fog fog-high" />
        <svg className="flying-bat bat-one" viewBox="0 0 64 32">
          <path d="M32 14 26 8 20 11 11 5 13 15 3 12 10 23 19 25 26 20 32 27 38 20 45 25 54 23 61 12 51 15 53 5 44 11 38 8Z" />
        </svg>
        <svg className="flying-bat bat-two" viewBox="0 0 64 32">
          <path d="M32 14 26 8 20 11 11 5 13 15 3 12 10 23 19 25 26 20 32 27 38 20 45 25 54 23 61 12 51 15 53 5 44 11 38 8Z" />
        </svg>
        <span className="ember ember-one" />
        <span className="ember ember-two" />
        <span className="ember ember-three" />
      </div>
      <header className={`page-header ${activeTab === 'home' ? 'home-header' : 'game-header'} ${activeTab === 'kuldvillak' ? 'jeopardy-header' : ''}`}>
        {activeTab === 'home' ? (
          <>
            <span className="block text-3xl sm:text-5xl" aria-hidden="true">🕸️ 🎃 🕸️</span>
            <h1 className="mt-2 font-creepster text-4xl text-spooky-orange drop-shadow-[0_0_18px_rgba(255,102,0,0.5)] sm:text-6xl">
              Halloweeni Mängupesa
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-purple-200/60 sm:text-sm">Halloweeni mänguõhtu algab siit</p>
          </>
        ) : (
          <div className="game-topbar">
            <button type="button" onClick={returnHome} className="spooky-button spooky-button-muted">
              ← Avalehele
            </button>
            <h1 className="font-creepster text-3xl text-spooky-orange sm:text-4xl">{currentTitle}</h1>
            <span aria-hidden="true" className="game-topbar-spacer" />
          </div>
        )}
        <div className={`youtube-music ${youtubePlayerOpen ? 'youtube-music-open' : ''}`}>
          <button
            type="button"
            onClick={() => setYoutubePlayerOpen((open) => !open)}
            aria-expanded={youtubePlayerOpen}
            className={`sound-button ${youtubePlayerOpen ? 'sound-button-active' : ''}`}
          >
            {youtubePlayerOpen ? '⏹ Peata muusika' : '♫ Esita Halloweeni muusikat'}
          </button>
          {youtubePlayerOpen && (
            <div className="youtube-player">
              <iframe
                src="https://www.youtube-nocookie.com/embed/Wi0eZkjF5-4?autoplay=1&controls=1&rel=0"
                title="Top Halloween Songs of All Time — Timeless Music"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <a
                href="https://www.youtube.com/watch?v=Wi0eZkjF5-4"
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-link"
              >
                Ava video YouTube’is
              </a>
            </div>
          )}
        </div>
      </header>

      <main className={`${activeTab === 'home' ? 'home-main' : 'game-main'} ${activeTab === 'kuldvillak' ? 'jeopardy-main' : ''}`}>
        {activeTab === 'home' && <HomeDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'kuldvillak' && (
          <div className="jeopardy-layout">
            <TeamBar
              teams={teams}
              onAddTeam={handleAddTeam}
              onDeleteTeam={handleDeleteTeam}
              onChangeTeamEmoji={handleChangeTeamEmoji}
              onChangeScore={handleChangeScore}
            />
            <div className="grave-card jeopardy-board-panel p-5 sm:p-7">
              <p className="jeopardy-instructions text-sm text-purple-100/70">{rules.jeopardy}</p>
              <JeopardyBoard
                jData={jData}
                completedQuestions={completedQuestions}
                onSelectQuestion={(category, item) => setActiveQ({ cat: category, item })}
              />
            </div>
          </div>
        )}
        {activeTab === 'kahoot' && (
          <div className="space-y-4">
            <p className="grave-card p-4 text-sm text-purple-100/70">{rules.kahoot}</p>
            <KahootGame key={JSON.stringify(quizQuestions)} kData={quizQuestions} rules={rules.kahoot} />
          </div>
        )}
        {activeTab === 'party' && <PartyGames rules={rules} />}
        {activeTab === 'settings' && (
          <SettingsPanel
            jData={jData}
            onUpdateJData={setJData}
            quizQuestions={quizQuestions}
            onUpdateQuizQuestions={setQuizQuestions}
            rules={rules}
            onUpdateRules={setRules}
          />
        )}
      </main>

      <QuestionModal
        key={activeQ?.item.id ?? 'closed'}
        activeQ={activeQ}
        teams={teams}
        onAwardPoints={handleAwardPoints}
        onClose={() => setActiveQ(null)}
      />
      {activeTab === 'home' && (
        <footer className="mt-12 text-center text-xs tracking-wide text-purple-200/40">Tee üks samm lähemale... kui julged.</footer>
      )}
    </div>
  );
}
