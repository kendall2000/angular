import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CameraComponent } from './camera/camera.component';
import {  MetricsComponent } from './Metrics/metrics.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' }, // Redirige a la cámara por defecto
  { path: 'camera', component: CameraComponent }, // Ruta para CameraComponent
  { path: 'metrics', component: MetricsComponent } // Ruta para MetricsComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
