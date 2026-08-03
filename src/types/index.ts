export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  photoUrl: string | null;
  category: Category | null;
}

export interface Merchant {
  id: string;
  businessName: string;
  username: string;
  products: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
}