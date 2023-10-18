import { Component } from '@angular/core';

@Component({
  selector: 'app-instructions',
  template: `
<p>
  Installieren Sie die WalkApp auf Ihrem Home-Screen.
</p>

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
  <em>Wir wünschen Ihnen viel Spass!</em>
</p>
  `,
  styles: [
  ]
})
export class InstructionsComponent {

}
