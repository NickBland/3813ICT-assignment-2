import { Component } from '@angular/core';
import { ErrorComponent } from "../error/error.component";

@Component({
  selector: 'app-unknown-page',
  standalone: true,
  imports: [ErrorComponent],
  templateUrl: './unknown-page.component.html',
  styleUrl: './unknown-page.component.scss'
})
export class UnknownPageComponent {
  error: Error | null = null;
  constructor() { 
    this.error = new Error("404: Page not found");
  }
}
