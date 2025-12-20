
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  gallery?: string[];
  category: string;
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
  MELLAT = 'mellat'
}
