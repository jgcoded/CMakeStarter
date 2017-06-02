import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styles: [`
button {
  margin: 1em 0;
}
`]
})
export class HomeComponent {

  constructor(private router: Router) {}

  gotoCMakePreview(): void {
    this.router.navigate(['/cmake-preview']);
  }
}