import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StackFadeComponent } from './components/stack-fade/stack-fade.component';
import { InfoComponent } from './components/info/info.component';

const routes: Routes = [
  { path: 'info', component: InfoComponent },
  { path: 'walk', component: StackFadeComponent },
  { path: '', children: [] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
