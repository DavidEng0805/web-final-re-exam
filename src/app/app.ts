import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProductService } from './services/product.service';
import { CutTextPipe } from './custom_pipe/cut-text-pipe';
import { KhrFormatPipe } from './custom_pipe/khr-format-pipe';
import { RoundHundredsPipe } from './custom_pipe/round-hundreds-pipe';
import { CartService, CartItem, Product } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterOutlet,
    CutTextPipe,
    RoundHundredsPipe,
    CurrencyPipe,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
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

  /** ℹ️ About Section */
  showAbout = false;

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
  }

  /** ⬇️ Smooth Scroll */
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (id === 'about') {
      this.showAbout = true;
      this.selectedProduct = null;
      this.showInvoice = false;
    } else if (id === 'products' || id === 'top') {
      this.showAbout = false;
      this.selectedProduct = null;
      this.showInvoice = false;
    } else {
      this.selectedProduct = null;
    }
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

  /** 🖨 Print Invoice */
  printInvoice(): void {
    const printContent = document.getElementById('invoice');
    if (!printContent) return;

    const newWindow = window.open('', '', 'width=800,height=600');
    if (!newWindow) return;

    const cloned = printContent.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('button').forEach(btn => btn.remove());

    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            h2 { color: #D32F2F; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${cloned.outerHTML}
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
}
