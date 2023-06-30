import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { MatDialog } from '@angular/material/dialog';
import { ChooseStackComponent } from '../components/choose-stack/choose-stack.component';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { ImageStack, ImageData } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class StackService {

  selected_id?: number;
  stacks: { [key: string | number]: ImageStack } = {};
  stacks$: ReplaySubject<{ [key: string | number]: ImageStack }> = new ReplaySubject<{ [key: string]: ImageStack }>();
  stack: ReplaySubject<ImageStack> = new ReplaySubject<ImageStack>();

  constructor(
    private dataService: DataService,
    public dialog: MatDialog
  ) { }

  // open dialog
  public chooseStack() {
    const dialogRef = this.dialog.open<ChooseStackComponent, any, ImageStack>(ChooseStackComponent);
    dialogRef.afterClosed().subscribe(v => {
      if (v !== undefined) {
        this.stack.next(v);
      }
    })
  }

  // load stack records
  loadStacksMeta(): void {
    this.dataService.getImageStacks().subscribe(stacks => {
      stacks.forEach(s => {
        const stack_id = s.stack_id ?? this.extract_id(s.path!);
        this.stacks[stack_id] = Object.assign({}, s, { stack_id });
      });
      this.stacks$.next(this.stacks);
    })
  }

  // load stack image URLs into stack records
  loadStack(stack_id: number) {
    if (Object.keys(this.stacks).length) {
      this.dataService.getImageStack(stack_id).subscribe(stack => {
        if (stack_id in this.stacks) {
          this.stacks[stack_id].images = stack;
          this.stack.next(this.stacks[stack_id]);
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
