import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(true); // Dark mode di default
  isDarkMode$ = this.isDarkMode.asObservable();

  toggleTheme() {
    const currentMode = this.isDarkMode.value;
    this.isDarkMode.next(!currentMode);
  }

  setDarkMode(isDarkMode: boolean) {
    this.isDarkMode.next(isDarkMode);
  }
}
