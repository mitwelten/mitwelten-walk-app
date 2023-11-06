import { MatSlideToggle, MatSlideToggleChange } from "@angular/material/slide-toggle";

/**
  * Programmatically toggle the state of a MatSlideToggle
  * while also triggering the change event.
  */
export function onMenuSlideToggle(slideToggle: MatSlideToggle) {
  slideToggle.checked = !slideToggle.checked;
  slideToggle.change.next(new MatSlideToggleChange(slideToggle, slideToggle.checked));
}
