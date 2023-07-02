import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DataService } from 'src/app/services';
import { StackService } from 'src/app/services/stack.service';
import { ImageStack } from 'src/app/shared';

@Component({
  selector: 'app-choose-stack',
  templateUrl: './choose-stack.component.html',
  styleUrls: ['./choose-stack.component.css']
})
export class ChooseStackComponent implements OnInit, OnDestroy {

  stacks: ImageStack[] = [];
  private destroy = new Subject();

  constructor(
    private dataService: DataService,
    public stackService: StackService
  ) {

  }

  ngOnInit(): void {
    // show previously loaded records
    this.stacks = Object.entries(this.stackService.stacks).map(([i,s]) => s);
    // refresh the list
    this.stackService.loadStacksMeta().pipe(takeUntil(this.destroy)).subscribe(stacks => {
      this.stacks = Object.entries(stacks).map(([i,s]) => s);
    });
  }

  ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }

  select(stack_id: number) {
    this.stackService.loadStack(String(stack_id));
  }

}
