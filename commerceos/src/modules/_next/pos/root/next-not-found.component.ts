import { Component } from '@angular/core';

@Component({
  selector: 'cos-next-not-found',
  template: `
    <h1>404</h1>
    <a [routerLink]="['builder', '926812f0-b209-4cde-b606-a2dc1909778c']">
      <h3>Showcase</h3>
    </a>
    <a [routerLink]="['builder', '9098de97-d8e1-451b-b3a3-1cea44776523']">
      <h3>Builder</h3>
    </a>
    <a [routerLink]="['terminal/list']">
      <h3>Terminals</h3>
    </a>
  `
})
export class CosNextNotFoundComponent {}
