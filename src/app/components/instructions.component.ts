import { Component } from '@angular/core';

@Component({
  selector: 'app-instructions',
  template: `
<p>
  Für eine optimierte Bildschirmdarstellung installieren Sie die WalkApp bitte auf Ihrem Home-Screen (progressive Web-App). Eine Benutzung direkt im Browser ist möglich, aber die folgenden Einstellungen verbessern Ihr Ergebnis.
</p>

<ul>
  <li>öffnen Sie walk.mitwelten.org in Ihrem Browser</li>
  <li>klicken sie im Menu am unteren Bildschirmrand auf
    <mat-icon inline="true" class="material-symbols-outlined">ios_share</mat-icon>, um ein neues Menu zu öffnen</li>
  <li>scrollen Sie im Menu nach unten und wählen Sie “zum Home-Bildschirm hinzufügen” </li>
  <li>es erscheint ein neues Mitwelten-Icon (rosarot mit einer Spirale) unter Ihren Apps</li>
  <li>öffnen Sie die WalkApp mit diesem Icon </li>
</ul>

<p>
  Erlauben Sie der WalkApp bitte den Zugriff auf Ihre Positionsdaten (es werden keine persönlichen Daten erfasst).
</p>

<p>
  Aktivieren Sie bitte den Ton.
</p>

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
  Um später wieder zu dieser Anleitung zu gelangen, bitten wir sie das Zahnrad-Icon
  <mat-icon inline="true" color="accent" class="material-symbols-outlined">settings</mat-icon> im Hauptmenü anzuklicken.
</p>

<p>
  <em>Wir wünschen Ihnen viel Spass!</em>
</p>
  `,
  styles: [
    `mat-icon.mat-icon.mat-icon-inline { line-height: 1; }`
  ]
})
export class InstructionsComponent {

}
