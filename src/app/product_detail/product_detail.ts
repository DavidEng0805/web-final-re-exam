import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // <- Needed for *ngIf and currency pipe
import { CartService, Product } from '../services/cart.service';
import { RoundHundredsPipe } from '../custom_pipe/round-hundreds-pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,            // Use standalone if not in NgModule
  imports: [CommonModule, RoundHundredsPipe],      // <- Important
  templateUrl: './product_detail.html',
  styleUrls: ['./product_detail.css']
})
export class ProductDetailComponent {
  @Input() product?: Product;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private cartService: CartService) {}

  addToCart(product: Product) {
    if (product) {
      this.cartService.addToCart(product);
      alert(`${product.title} added to cart!`);
    }
  }

  close() {
    this.closeModal.emit();
  }
}
