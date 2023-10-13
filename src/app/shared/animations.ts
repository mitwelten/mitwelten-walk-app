import { trigger, style, transition, animate, state } from '@angular/animations';

export const slideUpDownAnimation = trigger('slideUpDown', [
  transition(':enter', [
    style({ bottom: '-33%', opacity: 0 }),
    animate('1s ease-in-out', style({ bottom: '0%', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('1s ease-in-out', style({ opacity: 0 }))
  ])
]);

export const hotspotCrossfadeAnimation = trigger('hotspotCrossfade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('1s ease-in-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('1s ease-in-out', style({ opacity: 0 }))
  ])
]);

export const swipeAnimation = trigger('swipeAnimation', [
  state('left', style({ transform: 'translateX(-100%)' })),
  state('right', style({ transform: 'translateX(100%)' })),
  state('center', style({ transform: 'translateX(0)' })),
  transition('* => *', animate('300ms ease-in-out'))
])
