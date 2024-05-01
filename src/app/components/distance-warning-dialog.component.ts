import { Component } from '@angular/core';

@Component({
  selector: 'app-distance-warning-dialog',
  template: `
    <h1 mat-dialog-title>Ausserhalb des Perimeters</h1>
    <div mat-dialog-content>
      <p>
        Sie befinden sich ausserhalb des Gebietes der Reinacher Heide, für die diese WalkApp entwickelt wurde. Um die
        WalkApp erleben zu können, müssen sie das Naturschutzgebiet vor Ort besuchen. Die Reinacher Heide befindet sich
        in der Gemeinde Reinach, am Fluss “Birs”, unweit von Basel. Sie erreichen sie mit der Tram 10 oder der S-Bahn
        S3, Station Bahnhof Dornach-Arlesheim, Fussweg ca. 10 Minuten.
      </p>
      <img style="width: 100%;" src="assets/pfad_perimeter.webp" alt="Pfad Perimeter">
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Schliessen</button>
    </div>
  `,
})
export class DistanceWarningDialogComponent {

}
