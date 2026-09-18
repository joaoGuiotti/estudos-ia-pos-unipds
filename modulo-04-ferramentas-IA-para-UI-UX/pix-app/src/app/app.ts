import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideArrowLeftRight, LucideLandmark, LucideReceiptText } from '@lucide/angular';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideLandmark, LucideArrowLeftRight, LucideReceiptText],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('pix-app');
}
