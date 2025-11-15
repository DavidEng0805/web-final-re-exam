import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Home } from './home/home';
import { About } from './about/about';

@Component({ template: '<h2>Products Page</h2>' })
class ProductsComponent {}

@Component({ template: '<h2>404 Not Found</h2>' })
class NotFoundComponent {}

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'products', component: ProductsComponent },
  { path: 'about', component: About },
  { path: '**', component: NotFoundComponent } // catch-all
];
