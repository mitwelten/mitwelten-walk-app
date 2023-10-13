import { trigger, style, transition, animate, state } from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOut', [
  transition(':enter', [
    style({ bottom: '-33%', opacity: 0 }),
    animate('1s 1s ease-in-out', style({ bottom: '0%', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('1s ease-in-out', style({ opacity: 0 }))
  ])
]);

export const hotspotAppearAnimation = trigger('hotspotAppear', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('1s ease-in-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('1s ease-in-out', style({ opacity: 0 }))
  ])
]);

export const slideAnimation = trigger('slideAnimation', [
  state('left', style({ transform: 'translateX(-100%)' })),
  state('right', style({ transform: 'translateX(100%)' })),
  state('center', style({ transform: 'translateX(0)' })),
  transition('* => *', animate('300ms ease-in-out'))
])
