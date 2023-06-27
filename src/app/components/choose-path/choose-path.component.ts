import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services';
import { WalkPath } from 'src/app/shared/walk-path.type';
import { FeatureCollection, Feature, LineString } from 'geojson';
import { Observer, PartialObserver } from 'rxjs';

@Component({
  selector: 'app-choose-path',
  templateUrl: './choose-path.component.html',
  styleUrls: ['./choose-path.component.css']
})
export class ChoosePathComponent implements OnInit {

  walks: WalkPath[] = [];
  addMode = false;

  public pathForm = new FormGroup({
    walk_id:     new FormControl<number|null>(null, { validators: []}),
    title:       new FormControl<string|null>(null, { validators: [Validators.required]}),
    description: new FormControl<string|null>(null, { validators: [Validators.required]}),
    path:        new FormControl<string|null>(null, { validators: [pathValidator, Validators.required], updateOn: 'change'}),
  });

  updateObserver: PartialObserver<number> = {
    next: (v) => {
      this.list();
      this.addMode = false;
    },
    error: (e) => console.error(e)
  }

  constructor(
    private dataService: DataService,
    public dialogRef: MatDialogRef<ChoosePathComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.dataService.getWalk().subscribe((walks: WalkPath[]) => {
      this.walks = walks;
    });
  }

  select(walk_id: number) {
    this.dataService.getWalk(walk_id).subscribe(walk => console.dir(walk));
  }

  edit(walk_id: number) {
    this.dataService.getWalk(walk_id).subscribe(walks => {
      if (walks.length) {
        this.addMode = true;
        const walk = walks[0];
        const fc: FeatureCollection = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: walk.path!,
                type: "LineString"
              }
            }
          ]
        };
        this.pathForm.patchValue({
          walk_id: walk.walk_id,
          title: walk.title,
          description: walk.description,
          path: JSON.stringify(fc),
        });
      }
    });
  }

  remove(walk_id: number) {
    this.dataService.deleteWalk(walk_id).subscribe(this.updateObserver)
  }

  submit() {
    this.dataService.putWalk(this.mapFormToWalkPath(this.pathForm.value)).subscribe(this.updateObserver);
  }

  private mapFormToWalkPath(formValue: typeof this.pathForm.value): Partial<WalkPath> {
    const transformed: WalkPath = {};
    if (formValue.walk_id != null) transformed.walk_id = formValue.walk_id;
    if (formValue.title != null) transformed.title = formValue.title;
    if (formValue.description != null) transformed.description = formValue.description;
    if (formValue.path != null) {
      const fc: FeatureCollection = JSON.parse(formValue.path);
      if (isFeatureCollection(fc) && fc.features[0].geometry.type === 'LineString') {
        transformed.path = fc.features[0].geometry.coordinates;
      }
    }
    return transformed;
  }
}

function pathValidator(control: AbstractControl) {
  if (control.value === null) return null;
  try {
    if (!isFeatureCollection(JSON.parse(control.value))) throw new Error('invalid GeoJSON');
    else return null;
  } catch (error) {
    return { invalidGeoJSON: true };
  }
}

function isFeatureCollection(obj: any): obj is FeatureCollection {
  return 'type' in obj
    && obj.type === 'FeatureCollection'
    && 'features' in obj
    && 'length' in obj.features
    && obj.features.length > 0
    && obj.features.filter((f: any) => isFeature(f)).length > 0;
}

function isFeature(obj: any): obj is Feature<LineString> {
  return 'type' in obj
    && obj.type === 'Feature'
    && 'geometry' in obj
    && 'type' in obj.geometry
    && obj.geometry.type  === 'LineString'
    && 'coordinates' in obj.geometry
    && 'length' in obj.geometry.coordinates
    && obj.geometry.coordinates.filter((c: any) => {
      return 'length' in c
        && c.length === 2
        && typeof c[0] === 'number'
        && typeof c[1] === 'number'
    }).length >= 2;
}
