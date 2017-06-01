import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  initialized: boolean = false;

  navigationLinks: Array<any> = [
    {
      route: 'home',
      label: 'Home'
    },
    {
      route: 'cmake-preview',
      label: 'CMake Preview'
    },
    {
      route: 'solution',
      label: 'Solution'
    }
  ];

  ngOnInit(): void {
    this.initialized = true;
  }
}
