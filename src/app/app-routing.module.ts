import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StackFadeComponent } from './components/stack-fade/stack-fade.component';
import { InfoComponent } from './components/info/info.component';
import { MapComponent } from './components/map/map.component';
import { OverviewComponent } from './components/overview/overview.component';
import { WalkComponent } from './components/walk/walk.component';

const routes: Routes = [
  { path: 'info', component: InfoComponent },
  { path: 'map', component: MapComponent },
  { path: 'walk', component: WalkComponent },
  { path: 'community', component: WalkComponent },
  { path: 'stack-fade', component: StackFadeComponent },
  { path: '', component: OverviewComponent, children: [] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
