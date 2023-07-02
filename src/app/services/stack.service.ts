import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { MatDialog } from '@angular/material/dialog';
import { ChooseStackComponent } from '../components/choose-stack/choose-stack.component';
import { ReplaySubject, map, tap } from 'rxjs';
import { ImageStack } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class StackService {

  selected_id?: number;
  stacks: { [key: string | number]: ImageStack } = {};
  stack: ReplaySubject<ImageStack> = new ReplaySubject<ImageStack>();

  constructor(
    private dataService: DataService,
    public dialog: MatDialog
  ) {
    this.init();
  }

  // open dialog
  public chooseStack() {
    const dialogRef = this.dialog.open<ChooseStackComponent, any, ImageStack>(ChooseStackComponent);
    dialogRef.afterClosed().subscribe(v => {
      if (v !== undefined) {
        this.stack.next(v);
      }
    })
  }

  init() {
    this.loadStacksMeta().subscribe(stacks => {
        const defaultStack = ("42" in stacks) ? "42" : Object.keys(stacks)[0];
        this.loadStack(defaultStack);
    });
  }

  // load stack records
  loadStacksMeta() {
    return this.dataService.getImageStacks().pipe(
      map(records => {
        const stacks: { [key: string]: ImageStack } = {};
        records.forEach(s => {
          const stack_id = s.stack_id ?? this.extract_id(s.path!);
          stacks[stack_id] = Object.assign({}, s, { stack_id });
        });
        return stacks;
      }),
      tap(stacks => {
        this.stacks = stacks;
      })
    );
  }

  // load stack image URLs and return with stack record
  loadStack(stack_id: string) {
    if (Object.keys(this.stacks).length) {
      this.dataService.getImageStack(stack_id).subscribe(stack => {
        if (stack_id in this.stacks) {
          // combine image urls with meta record
          this.stack.next(Object.assign(this.stacks[stack_id], { images: stack }));
        }
        else throw new Error(`No stack records with ID ${stack_id}`);
      });
    } else {
      throw new Error('No stack records loaded');
    }
  }

  private extract_id(path: string) {
    return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
  }

}
