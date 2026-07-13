export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  photoUrl: string | null;
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