import { Component } from '@angular/core';

@Component({
  selector: 'app-instructions',
  template: `
<p>
  Die WalkApp funktioniert direkt im Browser unter folgender URL:
  <a href="https://walk.mitwelten.org/" style="color: #ff4081">https://walk.mitwelten.org/</a>.
  Sie ist location-sensitive (GPS-basiert) und kann nur vor Ort in der Reinacher Heide sinnvoll genutzt werden.
  Sie können die Darstellung und das Handling der WalkApp verbessern, indem Sie folgende Einstellungen vornehmen.
</p>

<h4>Einrichtung eines Home-Screen oder Progressive Web-App (PWA)</h4>

<p>
  Je nach Browser oder verwendetem System sieht der Prozess etwas anders aus,
  entspricht in etwa aber folgenden Schritten:
</p>

<ul>
  <li>Öffnen Sie <a href="https://walk.mitwelten.org/" style="color: #ff4081">https://walk.mitwelten.org/</a> in Ihrem Browser.</li>
  <li>Klicken sie im Menu am unteren Bildschirmrand (oder oben im Balken) auf das Symbol
    <mat-icon inline="true" class="material-symbols-outlined">ios_share</mat-icon>, um ein neues Menu zu öffnen.</li>
  <li>Scrollen Sie im Menu nach unten und wählen Sie “<em>Zum Home-Bildschirm</em>” (Alternativ kann die Option PWA erscheinen, die es zu installieren gilt).</li>
  <li>Es erscheint ein neues Mitwelten-Icon (rosarot mit einer Spirale) unter Ihren Apps:
    <div class="screenshot-container">
      <div id="app-icon-crop">
        <img  src="assets/app-launch-icon.webp" alt="App Icon">
      </div>
    </div>
  </li>
  <li>Öffnen Sie die WalkApp mit diesem Icon. Sie werden dann gefragt, ob die WalkApp auf ihre <strong>GPS-Signal</strong> zugreifen darf.
  Bitte erteilen Sie die Erlaubnis (es werden keine persönlichen Daten erfasst).</li>
  <li>
  Falls der vorherige Schritt nicht geklappt hat oder Sie keine Informationen auf dem Mobile erhalten, kann der Prozess auch selbst ausgeführt werden:
  Auf dem iPhone finden Sie unter <em>Einstellungen</em> > <em>Datenschutz & Sicherheit</em> > <em>Ortungsdienste</em>.
  Bitte schalten Sie ein. Scrollen Sie dann zum Browser, den sie verwenden (Safari, Firefox, Chrome, …), und aktivieren sie das Häkchen „<em>Beim Verwenden der App</em>“.
  </li>
</ul>

<h4>Weitere Einstellungen</h4>

<ul>
  <li>Aktivieren Sie bitte den Ton: Schalten Sie das Mobile auf laut und die Lautstärke relativ hoch.</li>
  <li>Optional: Deaktivieren Sie bitte den Schlafmodus und nutzen Sie während des Spaziergangs keine anderen Funktionen ihres Mobiltelefons (respektive bringen Sie die WalkApp nach einer anderen Nutzung des Mobiles wieder in den Vordergrund). Die WalkApp bleibt somit auch aktiviert, wenn Sie den Bildschirm längere Zeit nicht berühren. Beim iPhone finde Sie das unter Einstellung > Anzeige & Helligkeit.  Automatische Sperre auf „Nie“ stellen. </li>
  <li>Diese WalkApp ist eine prototypische Umsetzung des Forschungsprojektes MITWELTEN. Sollten Sie Probleme feststellen, lohnt es sich einen Restart vorzunehmen: WalkApp schliessen und wieder öffnen.</li>
</ul>

<!--
<p>
  Deaktivieren Sie bitte den Schlafmodus und nutzen Sie während des Spaziergangs keine anderen Funktionen ihres
  Mobiltelefons (respektive bringen Sie die WalkApp nach Nutzung anderer Funktionen wieder als aktive App in den
  Vordergrund).
</p>

<p>
  Spazieren Sie anschliessend einfach entlang der Nord-Südachse der Reinacher Heide. Ihr Mobiltelefon versorgt die
  App mit der aktuellen GPS Position, weshalb Ihnen Informationen im örtlichen Kontext Ihres Erlebnisses eingespielt
  werden können. Dies geschieht in Form von Bildern, Texten und Tondokumente. Da sich die Dokumente auf den Ort
  beziehen, kann es bei schnellem Gehen vorkommen, dass neue Informationen die aktuell abgespielten ausblenden. Bitte
  regulieren Sie die Abspielung der Inhalte also mit Ihrer Gehgeschwindigkeit.
</p>

<p>
  Diese WalkApp ist eine prototypische Umsetzung des Forschungsprojektes MITWELTEN. Sollten Sie Probleme feststellen,
  lohnt es sich die App zu schliessen und wieder zu öffnen.
</p>

<p>
  Um später wieder zu dieser Anleitung zu gelangen, bitten wir sie das Zahnrad-Icon
  <mat-icon inline="true" color="accent" class="material-symbols-outlined">settings</mat-icon> im Hauptmenü anzuklicken.
</p>

<p>
  <em>Wir wünschen Ihnen viel Spass!</em>
</p> -->
  `,
  styles: [
    `mat-icon.mat-icon.mat-icon-inline { line-height: 1; }`,
    `.screenshot-container {
      position: relative;
      margin: 0.8em 0;
    }`,
    `#app-icon-crop {
      width: 160px;
      height: 100px;
      overflow: hidden;
      border-radius: 9px;
    }`,
    `#app-icon-crop img {
      object-fit: contain;
      position: relative;
      left: -11px;
      top: -74px;
      width: 400px;
    }`,
  ]
})
export class InstructionsComponent {

}
