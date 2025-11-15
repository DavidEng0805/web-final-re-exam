import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  category?: string;
}

export interface CartItem extends Product {
  qty: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];
  cartChanges = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromLocalStorage();
  }

  /** Get all items */
  getCart(): CartItem[] {
    return this.cart;
  }

  /** Add product to cart */
  addToCart(product: Product) {
    const existing = this.cart.find((item) => item.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...product, qty: 1 });
    }
    this.saveCart();
  }

  /** Change quantity of an item */
  changeQty(productId: number, delta: number) {
    const item = this.cart.find((i) => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(productId);
    } else {
      this.saveCart();
    }
  }

  /** Remove a product completely */
  remove(productId: number) {
    this.cart = this.cart.filter((i) => i.id !== productId);
    this.saveCart();
  }

  /** 🧹 Clear all items in cart */
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  /** Get total price in USD */
  getTotalUSD(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  /** Get total number of items */
  getTotalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  /** Save cart to localStorage and notify subscribers */
  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartChanges.next(this.cart);
  }

  /** Load cart from localStorage */
  private loadCartFromLocalStorage() {
    const stored = localStorage.getItem('cart');
    this.cart = stored ? JSON.parse(stored) : [];
    this.cartChanges.next(this.cart);
  }
}
