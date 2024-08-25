import { Component, Input } from "@angular/core";

@Component({
  selector: "app-error",
  standalone: true,
  imports: [],
  template: `
    <div class="alert alert-danger" role="alert">
      {{ error?.message }}
    </div>
  `,
  styles: ``,
})
export class ErrorComponent {
  @Input()
  error: Error | null = null;
}
