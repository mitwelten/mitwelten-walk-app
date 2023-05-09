import { Component } from '@angular/core';

@Component({
  selector: 'app-distance-warning-dialog',
  template: `
    <h1 mat-dialog-title>Warning</h1>
    <div mat-dialog-content>You are too fare away from the parcours. Progress tracking is now disabled.</div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
})
export class DistanceWarningDialogComponent {

}
