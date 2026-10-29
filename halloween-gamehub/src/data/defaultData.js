export const DEFAULT_J_DATA = [
  {
    id: 'cat-1',
    cat: "Õudusfilmid",
    items: [
      { id: 'q-1-100', pts: 100, q: "Kes oli filmis 'Scream' mõrvar?", a: "Ghostface" },
      { id: 'q-1-200', pts: 200, q: "Mis aastal ilmus esimest korda 'Halloween' film?", a: "1978" },
      { id: 'q-1-300', pts: 300, q: "Mis on filmi 'The Shining' hotelli nimi?", a: "Overlook Hotel" },
      { id: 'q-1-400', pts: 400, q: "Kes lavastas 1960. aasta filmi „Psycho”?", a: "Alfred Hitchcock" },
      { id: 'q-1-500', pts: 500, q: "Mis numbrituba otsitakse filmis „The Shining”?", a: "Tuba 237" },
    ]
  },
  {
    id: 'cat-2',
    cat: "Monstrumid",
    items: [
      { id: 'q-2-100', pts: 100, q: "Kuidas saab vampiiri hävitada?", a: "Puidust vaia või päikesega" },
      { id: 'q-2-200', pts: 200, q: "Kes loodi laboratooriumis elava laiba osadest?", a: "Frankensteini koletis" },
      { id: 'q-2-300', pts: 300, q: "Mis loomaks muutub Libahunt täiskuu ajal?", a: "Hundiks" },
      { id: 'q-2-400', pts: 400, q: "Mis metallist kuuli peetakse libahundi vastu tõhusaks?", a: "Hõbedast" },
      { id: 'q-2-500', pts: 500, q: "Mis nime kannab Bram Stokeri loos Dracula koduloss?", a: "Dracula loss (Castle Dracula)" },
    ]
  },
  {
    id: 'cat-3',
    cat: "Traditsioonid",
    items: [
      { id: 'q-3-100', pts: 100, q: "Kust riigist on pärit Halloweeni algupära?", a: "Iirimaalt (Keldi saagid)" },
      { id: 'q-3-200', pts: 200, q: "Mida tähendab eesti keeles 'Trick or Treat'?", a: "Komm või pomm" },
      { id: 'q-3-300', pts: 300, q: "Mis köögiviljast tehti algselt Jack-o'-Lanternit?", a: "Naerist" },
      { id: 'q-3-400', pts: 400, q: "Mis nime kannab keldi püha, millega Halloweeni algupära seostatakse?", a: "Samhain" },
      { id: 'q-3-500', pts: 500, q: "Millise kristliku püha eelõhtust tuleb nimi Halloween?", a: "Kõigi pühakute päevast" },
    ]
  },
  {
    id: 'cat-4',
    cat: "Õudsed paigad",
    items: [
      { id: 'q-4-100', pts: 100, q: "Millises lossis elas Bram Stokeri kuulus vampiir?", a: "Dracula lossis" },
      { id: 'q-4-200', pts: 200, q: "Mis nime kannab Stephen Kingi romaani „The Shining” kummituslik hotell?", a: "Overlook Hotel" },
      { id: 'q-4-300', pts: 300, q: "Millises USA linnas asub kuulus nõiaprotsesside muuseum?", a: "Salemis" },
      { id: 'q-4-400', pts: 400, q: "Mis Šotimaa järvega seostatakse legendi koletis Nessiest?", a: "Loch Ness" },
      { id: 'q-4-500', pts: 500, q: "Mis mahajäetud Pennsylvania vangla oli filmi „12 Monkeys” võttepaik ja on tuntud kummituslugude poolest?", a: "Eastern State Penitentiary" },
    ]
  },
  {
    id: 'cat-5',
    cat: "Halloweeni maailm",
    items: [
      { id: 'q-5-100', pts: 100, q: "Mis värvi kassiga seostatakse sageli ebausku ja Halloweeni?", a: "Mustaga" },
      { id: 'q-5-200', pts: 200, q: "Mis on Halloweeni kuupäev?", a: "31. oktoober" },
      { id: 'q-5-300', pts: 300, q: "Millise nimega tuntakse kõrvitsasse lõigatud laternat?", a: "Jack-o'-Lantern" },
      { id: 'q-5-400', pts: 400, q: "Mis perekonnanime kannab õuduskomöödia „The Addams Family” perekond?", a: "Addams" },
      { id: 'q-5-500', pts: 500, q: "Mis 1939. aasta fantaasiafilmis kohtab Dorothy Lääne kurja nõida?", a: "Võlur Oz" },
    ]
  }
];

export const DEFAULT_TEAMS = [];

export const DEFAULT_GAME_RULES = {
  jeopardy: 'Valige teema ja punktisumma. Vastake kordamööda; mängujuht paljastab vastuse ning jagab õigesti vastanud tiimile punktid.',
  kahoot: 'Mängijad vastavad oma telefonis enne taimeri lõppu. Iga õige vastus annab 100 punkti; vastusevariandid ja õiged vastused avatakse pärast küsimuse lõppu.',
  skull: 'Andke pehme mängukolju ringis edasi. Kui taimer heliseb, saab kolju hoidnud mängija kokkulepitud naljaka ülesande.',
  cauldron: 'Tõmmake katlast üks ülesanne ja tehke see ära. Ülesande võib vahele jätta, kui see kellelegi ei sobi.',
  alias: 'Seletage sõna oma tiimile seda sõna ennast kasutamata. Arvake ära enne, kui aeg otsa saab.',
  mime: 'Esitage loositud Halloweeni tegelast või tegevust häält tegemata. Tiim proovib ära arvata.',
  guess: 'Üks mängija loeb vihjed ükshaaval ette. Tiimid võivad pärast iga vihjet arvata; varasem õige vastus annab rohkem punkte.',
  story: 'Iga mängija lisab kordamööda ühe lause. Lugu peab jätkuma eelmise lausest ja sisaldama loositud õudset sõna.',
};
