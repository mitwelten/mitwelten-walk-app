import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services';
import { WalkPath } from 'src/app/shared/walk-path.type';

@Component({
  selector: 'app-choose-path',
  templateUrl: './choose-path.component.html',
  styleUrls: ['./choose-path.component.css']
})
export class ChoosePathComponent implements OnInit {

  walks: WalkPath[] = [];
  addMode = false;

  public pathForm = new FormGroup({
    title:        new FormControl<string>('', { validators: [Validators.required], nonNullable: true}),
    description:  new FormControl<string|null>(null, { validators: [Validators.required], nonNullable: false}),
    path:         new FormControl<string|null>(null,  { validators: [], nonNullable: false}),
  });

  constructor(
    private dataService: DataService,
    public dialogRef: MatDialogRef<ChoosePathComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.dataService.getWalk().subscribe((walks: WalkPath[]) => {
      this.walks = walks;
    })
  }

  select(walk_id: number) {
    this.dataService.getWalk(walk_id).subscribe(walk => console.dir(walk));
  }

  submit() {
    console.log(this.pathForm.value)
  }
}
