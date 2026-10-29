import React, { useState } from 'react';

const ruleFields = [
  ['jeopardy', 'Kuldvillak'],
  ['kahoot', 'Halloweeni viktoriin'],
  ['cauldron', 'Nõiajoogi katel'],
  ['alias', 'Surnuaia Alias'],
  ['mime', 'Kummituse pantomiim'],
  ['guess', 'Koletise äraarvamine'],
];

export default function SettingsPanel({
  jData,
  onUpdateJData,
  quizQuestions,
  onUpdateQuizQuestions,
  rules,
  onUpdateRules,
}) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(jData[0]?.id ?? '');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [points, setPoints] = useState(100);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('0');
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizError, setQuizError] = useState('');

  const resetQuestionForm = () => {
    setQuestion('');
    setAnswer('');
    setPoints(100);
    setEditingId(null);
  };

  const addCategory = (event) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    const category = { id: `cat-${Date.now()}`, cat: name, items: [] };
    onUpdateJData([...jData, category]);
    setSelectedCategory(category.id);
    setCategoryName('');
    setError('');
  };

  const saveQuestion = (event) => {
    event.preventDefault();
    if (!selectedCategory || !question.trim() || !answer.trim()) {
      setError('Vali teema ning sisesta nii küsimus kui ka vastus.');
      return;
    }

    const item = {
      id: editingId ?? `q-${Date.now()}`,
      pts: Number(points),
      q: question.trim(),
      a: answer.trim(),
    };
    onUpdateJData(jData.map((category) => {
      if (category.id !== selectedCategory) return category;
      const items = editingId
        ? category.items.map((existing) => existing.id === editingId ? item : existing)
        : [...category.items, item];
      return { ...category, items };
    }));
    resetQuestionForm();
    setError('');
  };

  const editQuestion = (categoryId, item) => {
    setSelectedCategory(categoryId);
    setEditingId(item.id);
    setQuestion(item.q);
    setAnswer(item.a);
    setPoints(item.pts);
    setError('');
  };

  const deleteQuestion = (categoryId, itemId) => {
    onUpdateJData(jData.map((category) => category.id === categoryId
      ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
      : category));
    if (editingId === itemId) resetQuestionForm();
  };

  const deleteCategory = (categoryId) => {
    const remaining = jData.filter((category) => category.id !== categoryId);
    onUpdateJData(remaining);
    if (selectedCategory === categoryId) {
      setSelectedCategory(remaining[0]?.id ?? '');
      resetQuestionForm();
    }
  };

  const resetQuizForm = () => {
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setCorrectOption('0');
    setEditingQuizId(null);
  };

  const saveQuizQuestion = (event) => {
    event.preventDefault();
    const trimmedQuestion = quizQuestion.trim();
    const trimmedOptions = quizOptions.map((option) => option.trim());
    if (!trimmedQuestion || trimmedOptions.some((option) => !option)) {
      setQuizError('Sisesta küsimus ja kõik neli vastusevarianti.');
      return;
    }
    if (new Set(trimmedOptions.map((option) => option.toLocaleLowerCase())).size !== trimmedOptions.length) {
      setQuizError('Kõik neli vastusevarianti peavad olema erinevad.');
      return;
    }

    const updatedQuestion = {
      id: editingQuizId ?? `quiz-${Date.now()}`,
      q: trimmedQuestion,
      opts: trimmedOptions,
      correct: Number(correctOption),
    };
    onUpdateQuizQuestions(editingQuizId
      ? quizQuestions.map((item) => item.id === editingQuizId ? updatedQuestion : item)
      : [...quizQuestions, updatedQuestion]);
    resetQuizForm();
    setQuizError('');
  };

  const editQuizQuestion = (item) => {
    setEditingQuizId(item.id);
    setQuizQuestion(item.q);
    setQuizOptions([...item.opts]);
    setCorrectOption(String(item.correct));
    setQuizError('');
  };

  const deleteQuizQuestion = (itemId) => {
    onUpdateQuizQuestions(quizQuestions.filter((item) => item.id !== itemId));
    if (editingQuizId === itemId) resetQuizForm();
  };

  return (
    <section className="space-y-6">
      <div className="grave-card p-6 sm:p-8">
        <p className="eyebrow">Mängujuhi märkmik</p>
        <h2 className="font-creepster text-4xl text-spooky-orange">Sinu küsimused ja reeglid</h2>
        <p className="mt-2 text-purple-200/75">Muudatused salvestuvad automaatselt sellesse seadmesse.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="grave-card p-5 sm:p-6">
          <h3 className="section-title">📜 Küsimuste kogu</h3>
          <form onSubmit={addCategory} className="mb-5 flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="new-category">Uue teema nimi</label>
            <input id="new-category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Uue teema nimi" className="spooky-input min-w-0 flex-1" />
            <button className="spooky-button" type="submit">+ Lisa teema</button>
          </form>

          <form onSubmit={saveQuestion} className="space-y-3 rounded-xl border border-spooky-purple/50 bg-black/20 p-4">
            <label className="block text-sm text-purple-100/80" htmlFor="question-category">Teema</label>
            <div className="flex gap-2">
              <select id="question-category" value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); resetQuestionForm(); }} className="spooky-input min-w-0 flex-1">
                {!jData.length && <option value="">Lisa enne teema</option>}
                {jData.map((category) => <option key={category.id} value={category.id}>{category.cat}</option>)}
              </select>
              {jData.find((category) => category.id === selectedCategory) && (
                <button type="button" className="spooky-button spooky-button-muted" onClick={() => deleteCategory(selectedCategory)}>Kustuta teema</button>
              )}
            </div>
            <label className="block text-sm text-purple-100/80" htmlFor="question-text">Küsimus</label>
            <textarea id="question-text" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Sisesta küsimus..." rows={2} className="spooky-input w-full resize-y" />
            <label className="block text-sm text-purple-100/80" htmlFor="answer-text">Õige vastus</label>
            <textarea id="answer-text" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Sisesta vastus..." rows={2} className="spooky-input w-full resize-y" />
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm text-purple-100/80">
                Punktid
                <input type="number" min="1" step="1" value={points} onChange={(event) => setPoints(event.target.value)} className="spooky-input mt-1 block w-28" />
              </label>
              <button type="submit" disabled={!jData.length} className="spooky-button disabled:cursor-not-allowed disabled:opacity-50">
                {editingId ? 'Salvesta muudatus' : 'Lisa küsimus'}
              </button>
              {editingId && <button type="button" onClick={resetQuestionForm} className="spooky-button spooky-button-muted">Tühista</button>}
            </div>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          </form>

          <div className="mt-5 space-y-4">
            {jData.map((category) => (
              <details key={category.id} className="rounded-xl border border-white/10 bg-black/20 p-4" open={category.id === selectedCategory}>
                <summary className="cursor-pointer font-bold text-spooky-orange">{category.cat} <span className="text-xs text-purple-200/60">({category.items.length})</span></summary>
                <ul className="mt-3 space-y-3">
                  {category.items.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 border-t border-white/10 pt-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.q} <span className="text-xs text-spooky-orange">· {item.pts} p</span></p>
                        <p className="text-sm text-purple-200/65">Vastus: {item.a}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => editQuestion(category.id, item)} className="text-sm text-spooky-orange hover:underline">Muuda</button>
                        <button type="button" onClick={() => deleteQuestion(category.id, item.id)} className="text-sm text-red-300 hover:underline">Kustuta</button>
                      </div>
                    </li>
                  ))}
                  {!category.items.length && <li className="text-sm text-purple-200/60">Selles teemas pole veel küsimusi.</li>}
                </ul>
              </details>
            ))}
          </div>
        </section>

        <section className="grave-card p-5 sm:p-6">
          <h3 className="section-title">🕯️ Mängude reeglid</h3>
          <p className="mb-4 text-sm text-purple-200/70">Kirjuta oma seltskonnale sobivad juhised. Need kuvatakse vastava mängu juures.</p>
          <div className="space-y-4">
            {ruleFields.map(([id, title]) => (
              <label key={id} className="block">
                <span className="mb-1 block text-sm font-bold text-spooky-orange">{title}</span>
                <textarea
                  value={rules[id] ?? ''}
                  onChange={(event) => onUpdateRules({ ...rules, [id]: event.target.value })}
                  rows={3}
                  className="spooky-input w-full resize-y"
                  aria-label={`${title} reeglid`}
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      <section className="grave-card p-5 sm:p-6">
        <p className="eyebrow">Telefonimängu küsimused</p>
        <h3 className="section-title">🔮 Halloweeni viktoriin</h3>
        <p className="mb-5 text-sm text-purple-200/70">
          Need küsimused ja vastusevariandid on Kuldvillakust eraldi. Õige vastus märgitakse enne mängu algust ega ilmu mängijate telefonis enne tulemuste näitamist.
        </p>

        <form onSubmit={saveQuizQuestion} className="mb-6 space-y-4 rounded-xl border border-spooky-purple/50 bg-black/20 p-4">
          <label className="block text-sm text-purple-100/80" htmlFor="quiz-question">Küsimus</label>
          <textarea
            id="quiz-question"
            value={quizQuestion}
            onChange={(event) => setQuizQuestion(event.target.value)}
            placeholder="Sisesta viktoriiniküsimus..."
            rows={2}
            className="spooky-input w-full resize-y"
          />
          <fieldset>
            <legend className="mb-2 text-sm text-purple-100/80">Vastusevariandid — märgi õige vastus</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {quizOptions.map((option, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-quiz-option"
                    value={index}
                    checked={correctOption === String(index)}
                    onChange={(event) => setCorrectOption(event.target.value)}
                    aria-label={`Märgi vastusevariant ${index + 1} õigeks`}
                    className="accent-orange-500"
                  />
                  <input
                    value={option}
                    onChange={(event) => setQuizOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                    placeholder={`Vastusevariant ${index + 1}`}
                    aria-label={`Viktoriini vastusevariant ${index + 1}`}
                    className="spooky-input min-w-0 flex-1"
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="spooky-button">{editingQuizId ? 'Salvesta küsimuse muudatused' : 'Lisa viktoriiniküsimus'}</button>
            {editingQuizId && <button type="button" onClick={resetQuizForm} className="spooky-button spooky-button-muted">Tühista</button>}
          </div>
          {quizError && <p role="alert" className="text-sm text-red-300">{quizError}</p>}
        </form>

        <div className="space-y-3">
          {quizQuestions.map((item, index) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold">{index + 1}. {item.q}</h4>
                  <ul className="mt-2 grid gap-1 text-sm text-purple-100/65 sm:grid-cols-2">
                    {item.opts.map((option, optionIndex) => (
                      <li key={`${item.id}-${optionIndex}`} className={optionIndex === item.correct ? 'font-bold text-spooky-slime' : ''}>
                        {optionIndex === item.correct ? '✓ ' : ''}{option}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => editQuizQuestion(item)} className="text-sm text-spooky-orange hover:underline">Muuda</button>
                  <button type="button" onClick={() => deleteQuizQuestion(item.id)} className="text-sm text-red-300 hover:underline">Kustuta</button>
                </div>
              </div>
            </article>
          ))}
          {!quizQuestions.length && <p className="text-sm text-purple-200/60">Viktoriini küsimusi veel pole. Lisa esimene küsimus ülal.</p>}
        </div>
      </section>
    </section>
  );
}
