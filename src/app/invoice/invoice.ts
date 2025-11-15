import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

interface CartItem {
  title: string;
  qty: number;
  price: number;
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule], // <-- required for pipes
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css']
})
export class InvoiceComponent {
  title = 'ROYAL STORE';
  currentDate = new Date();
  cart: CartItem[] = [
    { title: 'Product 1', qty: 2, price: 10 },
    { title: 'Product 2', qty: 1, price: 25 }
  ];

  get totalUSD(): number {
    return this.cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  get totalKHR(): number {
    return Math.round(this.totalUSD * 4100);
  }

  printInvoice(): void {
    console.log('Printing invoice...');
  }

  closeInvoice(): void {
    console.log('Closing invoice...');
  }
}
