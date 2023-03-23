import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackFadeComponent } from './stack-fade.component';

describe('StackFadeComponent', () => {
  let component: StackFadeComponent;
  let fixture: ComponentFixture<StackFadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StackFadeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackFadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
