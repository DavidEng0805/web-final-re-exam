import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CutTextPipe } from '../custom_pipe/cut-text-pipe';
import { KhrFormatPipe } from '../custom_pipe/khr-format-pipe';
import { RoundHundredsPipe } from '../custom_pipe/round-hundreds-pipe';
import { CartService, CartItem, Product } from '../services/cart.service';
import { ProductDetailComponent } from '../product_detail/product_detail';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CutTextPipe,
    RoundHundredsPipe,
    CurrencyPipe,
    ProductDetailComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  private slideInterval: any;
  title = 'BaychaStore';

  /** 🖼 Banner Slides */
  slides = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=400&fit=crop&crop=center',
      title: 'Welcome to BaychaStore',
      subtitle: 'Discover your favorite brands at unbeatable prices',
      buttonText: 'Shop Now'
    },
    {
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=400&fit=crop&crop=center',
      title: 'Exclusive Deals Today',
      subtitle: 'Up to 50% off on selected items',
      buttonText: 'View Deals'
    },
    {
      image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1400&h=400&fit=crop&crop=center',
      title: 'New Arrivals Weekly',
      subtitle: 'Fresh products added every week',
      buttonText: 'Explore New'
    }
  ];
  currentSlideIndex = 0;

  /** 🛍 Product Data */
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Make Up', 'Food', 'Furniture'];
  selectedCategory: string | null = null;
  searchTerm = '';

  /** 🛒 Cart Data */
  cart: CartItem[] = [];
  isOpen = false;

  /** 📦 Product Detail */
  selectedProduct: Product | null = null;
  showProductModal = false;

  /** 🧾 Invoice */
  showInvoice = false;
  currentDate: Date = new Date();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  /** 🔄 Initialize Product & Cart */
  async ngOnInit(): Promise<void> {
    await this.loadProducts();

    // Subscribe to cart changes
    this.cartService.cartChanges.subscribe((cart) => {
      this.cart = [...cart];
    });

    // Load initial cart
    this.cart = [...this.cartService.getCart()];

    // Start auto-sliding
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  /** 🔄 Fetch & Map Products */
  private async loadProducts(): Promise<void> {
    try {
      const products = await this.productService.fetchProducts();
      this.products = products.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: this.mapCategory(p.category),
        thumbnail: p.thumbnail || 'https://via.placeholder.com/300x300?text=No+Image',
      }));
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  }

  /** 🖼 Banner Slide Logic */
  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = this.currentSlideIndex === 0 ? this.slides.length - 1 : this.currentSlideIndex - 1;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  /** 🛒 Cart Logic */
  get totalUSD(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get totalKHR(): number {
    // Round to nearest 100
    return Math.round(this.totalUSD * 4100 / 100) * 100;
  }

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  changeQty(productId: number, delta: number): void {
    this.cartService.changeQty(productId, delta);
  }

  remove(productId: number): void {
    this.cartService.remove(productId);
    if (this.cart.length === 0) this.isOpen = false;
  }

  toggleCart(): void {
    this.isOpen = !this.isOpen;
  }

  /** 🧾 Show Invoice / Checkout */
  confirmCheckout(): void {
    if (this.cart.length === 0) {
      alert('🛒 Your cart is empty!');
      return;
    }
    this.showInvoice = true;
    this.isOpen = false;
    this.currentDate = new Date();
  }

  /** 🔍 Product Filtering */
  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(
      (p) =>
        (!this.selectedCategory || p.category === this.selectedCategory) &&
        (!term || p.title.toLowerCase().includes(term))
    );
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  clearCategoryFilter(): void {
    this.selectedCategory = null;
    this.filterProducts();
  }

  /** 🖱 Product Detail View */
  openProductDetail(product: Product): void {
    this.selectedProduct = product;
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
  }

  /** ⬇️ Smooth Scroll */
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (id !== 'products') this.selectedProduct = null;
  }

  /** 🖨 Print Invoice */
  printInvoice(): void {
    const printContent = document.getElementById('invoice');
    if (!printContent) return;

    const newWindow = window.open('', '', 'width=1200,height=800');
    if (!newWindow) return;

    const cloned = printContent.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('button').forEach(btn => btn.remove());

    newWindow.document.write(`
      <html>
        <head>
          <title>${this.title} - Invoice</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6; color: #1f2937; background: white; padding: 30px;
            }

            .invoice-header {
              text-align: center; margin-bottom: 30px; padding: 25px;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              color: white; border-radius: 15px;
              box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
            }

            .invoice-header h2 {
              font-size: 2.2rem; font-weight: 700; margin-bottom: 8px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .invoice-info-grid {
              display: grid; grid-template-columns: 1fr 1fr; gap: 25px;
              margin-bottom: 30px; padding: 20px;
              background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;
            }

            .company-section h3, .invoice-section h3 {
              font-size: 1.1rem; font-weight: 600; color: #6366f1; margin-bottom: 12px;
              border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;
            }

            .company-details p, .invoice-details p {
              color: #6b7280; font-size: 0.9rem; margin: 6px 0;
            }

            .status-paid {
              color: #10b981; font-weight: 600; background: rgba(16, 185, 129, 0.1);
              padding: 3px 8px; border-radius: 6px;
            }

            .table-container {
              margin-bottom: 25px; border-radius: 12px; overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            }

            .invoice-table-modal {
              width: 100%; border-collapse: collapse; background: white; font-size: 0.85rem;
            }

            .invoice-table-modal thead {
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;
            }

            .invoice-table-modal th {
              padding: 14px 8px; text-align: center; font-weight: 600; font-size: 0.8rem;
              text-transform: uppercase; letter-spacing: 0.5px;
            }

            .invoice-table-modal .item-num { width: 50px; }
            .invoice-table-modal .product-col { text-align: left; min-width: 180px; }
            .invoice-table-modal .qty-col { width: 70px; }
            .invoice-table-modal .price-col { width: 120px; }

            .invoice-table-modal td {
              padding: 12px 8px; border-bottom: 1px solid #f3f4f6; color: #374151;
            }

            .product-name { font-weight: 600; color: #1f2937; }
            .quantity-badge {
              background: #6366f1; color: white; padding: 4px 10px; border-radius: 15px;
              font-weight: 600; font-size: 0.8rem; display: inline-block;
            }

            .price-stack { display: flex; flex-direction: column; align-items: center; gap: 1px; }
            .price-stack.subtotal { font-weight: 600; }
            .price-usd { font-weight: 600; color: #1f2937; }
            .price-khr { font-size: 0.75rem; color: #6b7280; }

            .totals-section {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 2px solid #0ea5e9; border-radius: 12px; padding: 20px; margin-bottom: 25px;
            }

            .totals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .total-item { text-align: center; }
            .total-label { font-size: 0.9rem; color: #64748b; font-weight: 500; margin-bottom: 6px; }
            .total-amount { font-size: 1.6rem; font-weight: 800; color: #0ea5e9; }

            .footer-note {
              text-align: center; margin-top: 30px; padding: 15px;
              background: #f8fafc; border-radius: 10px; color: #6b7280; font-size: 0.85rem;
              border-left: 4px solid #6366f1;
            }

            @media print {
              body { background: white !important; padding: 20px !important; }
              .invoice-header, .invoice-table-modal thead {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
                -webkit-print-color-adjust: exact; color-adjust: exact;
              }
              .totals-section {
                background: #f0f9ff !important; border: 2px solid #0ea5e9 !important;
                -webkit-print-color-adjust: exact; color-adjust: exact;
              }
              .invoice-table-modal { font-size: 10px; }
              .invoice-table-modal th, .invoice-table-modal td { padding: 6px 4px; }
            }

            @page { margin: 0.4in; size: A4 landscape; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h2>${this.title}</h2>
            <div style="font-size: 1rem; opacity: 0.9; font-weight: 300;">Official Invoice Receipt</div>
          </div>

          <div class="invoice-info-grid">
            <div class="company-section">
              <h3>${this.title}</h3>
              <div class="company-details">
                <p><strong>Address:</strong> 123 Main Street, Phnom Penh, Cambodia</p>
                <p><strong>Phone:</strong> +855 12 345 678</p>
                <p><strong>Email:</strong> info@baychastore.com</p>
              </div>
            </div>
            <div class="invoice-section">
              <h3>Invoice Details</h3>
              <div class="invoice-details">
                <p><strong>Date:</strong> ${this.currentDate.toLocaleDateString()}</p>
                <p><strong>Invoice #:</strong> ${this.currentDate.getTime()}</p>
                <p><strong>Status:</strong> <span class="status-paid">✓ Paid</span></p>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table class="invoice-table-modal">
              <thead>
                <tr>
                  <th class="item-num">#</th>
                  <th class="product-col">Product</th>
                  <th class="qty-col">Qty</th>
                  <th class="price-col">Unit Price</th>
                  <th class="price-col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${this.cart.map((item, index) => `
                  <tr>
                    <td class="item-num text-center">${index + 1}</td>
                    <td class="product-col">
                      <div class="product-info">
                        <span class="product-name">${item.title}</span>
                      </div>
                    </td>
                    <td class="qty-col text-center">
                      <span class="quantity-badge">${item.qty}</span>
                    </td>
                    <td class="price-col text-center">
                      <div class="price-stack">
                        <span class="price-usd">$${item.price.toFixed(2)}</span>
                        <span class="price-khr">៛ ${Math.round(item.price * 4100 / 100) * 100}</span>
                      </div>
                    </td>
                    <td class="price-col text-center">
                      <div class="price-stack subtotal">
                        <span class="price-usd">$${(item.price * item.qty).toFixed(2)}</span>
                        <span class="price-khr">៛ ${Math.round(item.price * item.qty * 4100 / 100) * 100}</span>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <div class="totals-grid">
              <div class="total-item">
                <span class="total-label">Total (USD)</span>
                <span class="total-amount">$${this.totalUSD.toFixed(2)}</span>
              </div>
              <div class="total-item">
                <span class="total-label">Total (KHR)</span>
                <span class="total-amount">៛ ${Math.round(this.totalKHR / 100) * 100}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            <p>Thank you for shopping with ${this.title}!</p>
            <p>Questions? Contact us at info@baychastore.com</p>
          </div>
        </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  }

  /** 🧹 Close Invoice & Clear Cart */
  closeInvoice(): void {
    this.showInvoice = false;
    this.cartService.clearCart();
    this.cart = [...this.cartService.getCart()];
  }

  /** 🗂 Map API Category to UI Category */
  private mapCategory(apiCategory: string): string {
    const categoryMap: Record<string, string> = {
      skincare: 'Make Up',
      fragrances: 'Make Up',
      groceries: 'Food',
      furniture: 'Furniture',
    };
    return categoryMap[apiCategory] || 'Make Up';
  }
}