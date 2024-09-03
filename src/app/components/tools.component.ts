import { Component } from '@angular/core';

@Component({
  selector: 'app-tools',
  template: `
<p>Zusätzlich zu dieser WalkApp wurden im Forschungsprojekt MITWELTEN zwei weitere Tools entwickelt, die die
  gesammelten Inhalte auf andere Art und Weise präsentieren. Sie wurden für einen grösseren Bildschirm konzipiert und
  sind nicht location-sensitive. </p>
<mat-card>
  <mat-card-header>
    <mat-card-title>Discover</mat-card-title>
    <mat-card-subtitle><a color="accent" href="https://discover.mitwelten.org/" target="_blank">discover.mitwelten.org</a></mat-card-subtitle>
  </mat-card-header>
  <img mat-card-image src="/assets/mitwelten-discover.png" alt="Mitwelten Discover Screenshot">
<mat-card-content>
  <p>
    <a color="accent" href="https://discover.mitwelten.org/" target="_blank">discover.mitwelten.org</a> ist eine
    kartenbasierte Aufbereitung von Inhalte des Forschungsprojektes MITWELTEN mit unterschiedlichen Infolayern und
    Ansichten sowie  Filterfunktionen.
  </p>
</mat-card-content>
</mat-card>
<mat-card>
<mat-card-header>
  <mat-card-title>Explore</mat-card-title>
  <mat-card-subtitle><a href="https://explore.mitwelten.org/app/" target="_blank">explore.mitwelten.org</a></mat-card-subtitle>
</mat-card-header>
<img mat-card-image src="https://explore.mitwelten.org/public/images/taxond.png" alt="Mitwelten Explore Screenshot">
<mat-card-content>
  <p>
    <a href="https://explore.mitwelten.org/app/" target="_blank">explore.mitwelten.org</a> ermöglicht es, gesammelte
    Datensätze des Forschungsprojektes MITWELTEN abzurufen, unterschiedlich darzustellen und zu vergleichen.
  </p>
</mat-card-content>
</mat-card>
  `,
  styles: [`
mat-card { margin-bottom: 24px; }
p { margin: revert; }
mat-card-header { padding-bottom: 16px; }
a { color: #ff4081; }
  `]
})
export class ToolsComponent {

}
