import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductService {
  async fetchProducts(): Promise<any[]> {
    const res = await fetch('https://dummyjson.com/products');
    const data = await res.json();
    return data.products; // returns an array
  }
}
