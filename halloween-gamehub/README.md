# Ööõuduste mängupesa

Halloweeni mängukeskus: Kuldvillak, telefonidest mängitav Kahooti-laadne viktoriin ja kuus peomängu.

## Käivitamine arvutis ja telefonides

Veebilehte ei pea internetti üles laadima. Kohalik Kahoot töötab mängujuhi arvutis ning samasse usaldatud Wi-Fi-võrku ühendatud telefonides.

1. Paigalda projektis sõltuvused üks kord:

   ```sh
   cd halloween-gamehub
   npm install
   ```

2. Käivita mäng ühe käsuga:

   ```sh
   npm run play
   ```

3. Leia Windowsis arvuti kohalik IPv4-aadress käsuga `ipconfig` (kasuta aktiivse Wi-Fi-ühenduse aadressi).
4. Ühenda telefonid sama Wi-Fi-võrguga ja ava telefonis `http://ARVUTI-IP:5173`, asendades `ARVUTI-IP` arvuti IPv4-aadressiga.
5. Vali ühes seadmes **Viktoriin → Olen mängujuht** ja loo mängutuba. Teistes telefonides ava sama aadress, vali **Viktoriin → Liitun mänguga** ning sisesta ekraanil olev kuuekohaline kood.

Mängu lõpetamiseks vajuta terminalis `Ctrl+C`. Kui Windows küsib, kas Node.js-i võrguühendus lubada, luba see **ainult privaatvõrkudes**. Kui telefon ei saa lehele või mänguga ühendust, kontrolli, et `npm run play` töötab ja seadmed on samas Wi-Fi-võrgus. Mõni külalisvõrk blokeerib seadmetevahelise side; siis proovi tavalist koduvõrku.

Mängujuhi arvuti ja mänguterminal peavad mängu ajal töötama. Mäng on nähtav ainult samas kohtvõrgus ega tööta internetist liituvatele mängijatele. Ära suuna mänguserveri porti (`5174`) ruuterist avalikku internetti ega ava seda ebausaldatud võrkudele.

## Mänguküsimused

- Ava **Minu mängud → Halloweeni viktoriin**, et lisada viktoriini küsimus, neli vastusevarianti ja märkida õige vastus.
- Muuda või kustuta viktoriiniküsimusi sealsamas. Need küsimused on Kuldvillaku küsimustest eraldi.
- Küsimused ja mängureeglid salvestatakse selles brauseris kohalikult. Viktoriini alustamisel saadetakse aktiivse mängujuhi küsimused kohaliku võrgu mängijatele.
- Avalehelt vali üks mäng; mäng avaneb eraldi vaates. Nupuga **Avalehele** saad mänguvalikusse tagasi.
- Päises saad YouTube’i muusika eraldi käivitada ja peatada. Mäng ei esita heli automaatselt.

## Heli ja kujunduse varad

Muusika kasutab YouTube’i ametlikku mängijat. Selle esitamiseks on vaja internetiühendust; mängud ja kohtvõrgu viktoriin töötavad endiselt kohalikult.

- Muusika: [Top Halloween Songs of All Time](https://www.youtube.com/watch?v=Wi0eZkjF5-4), Timeless Music.
- Hero-taust: [Motz house in the fog](https://commons.wikimedia.org/wiki/File:Motz_house_in_the_fog,_corner_of_Weber_and_Young,_Kitchener,_Ontario,_November_2022.jpg), foto autor Julius177, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Fail asub kohapeal `public/images/motz-house-fog.jpg`.

## Tootmisehituse kontroll

```sh
npm run build
```
