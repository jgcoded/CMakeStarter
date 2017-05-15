import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styles: [`
button {
  margin-top: 2em;
}
`]
})
export class HomeComponent {

  constructor(private router: Router) {}

  gotoCMakePreview(): void {
    this.router.navigate(['/cmake-preview']);
  }
}