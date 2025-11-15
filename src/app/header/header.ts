import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  title = 'BaychaStore';
  searchTerm = '';

  constructor(private router: Router) {}

  onSearch() {
    console.log('Searching for:', this.searchTerm);
  }

  goHome() {
    console.log('Navigate to home');
  }

  openCart() {
    console.log('Open cart');
  }

  goToAbout() {
    this.router.navigate(['/about']);
  }
}
