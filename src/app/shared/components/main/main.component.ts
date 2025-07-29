import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [
    RouterOutlet
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  host: {
    class: 'min-h-screen text-[#1d1c1b] flex flex-col font-sans relative',
  }
})
export class MainComponent {

}
