
export interface ProductDetails {
  properties: { label: string; value: string }[];
  features: string[];
  usage: string;
  warnings: string;
  storage: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  gallery?: string[];
  category: string;
  brand: string;
  details?: ProductDetails; // New optional field for specifications
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  title: string;
  city: string;
  province: string;
  fullAddress: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: number;
  rating: number;
  comment: string;
  date: string;
  userName: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
  relatedProductId?: number; // Links to a product
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  addresses: Address[];
}

export enum ShippingMethod {
  JET = 'jet',
  POST = 'post',
  PICKUP = 'pickup'
}

export enum PaymentMethod {
  ZARINPAL = 'zarinpal',
  SAMAN = 'saman',
  MELLAT = 'mellat',
  TARA = 'tara'
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  date: string;
  status: OrderStatus;
  trackingCode?: string;
  shippingMethod: ShippingMethod;
  address: Address;
}
