import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services';
import { StackService } from 'src/app/services/stack.service';
import { ImageStack } from 'src/app/shared';

@Component({
  selector: 'app-choose-stack',
  templateUrl: './choose-stack.component.html',
  styleUrls: ['./choose-stack.component.css']
})
export class ChooseStackComponent implements OnInit {

  stacks: ImageStack[] = [];

  constructor(
    private dataService: DataService,
    public stackService: StackService
  ) {

  }

  ngOnInit(): void {
    this.stackService.stacks$.subscribe(stacks => {
      this.stacks = Object.entries(stacks).map(([i,s]) => s);
    })
    this.stackService.loadStacksMeta();
    /* this.dataService.getImageStacks().subscribe(stacks => {
      this.stacks = stacks;
    }) */
  }

  select(stack_id: number) {
    this.stackService.loadStack(stack_id);
    /* this.dataService.getImageStack(stack_id).subscribe(stack => {
      console.dir(stack);
    }); */
  }

}
