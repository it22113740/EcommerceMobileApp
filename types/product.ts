export interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isLocal: boolean;
    isOrganic: boolean;
    farmName?: string;
    rating: number;
    reviews: number;
    images?: string[];
    nutritionInfo?: string;
    origin?: string;
    certifications?: string[];
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
  }

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number; // Price at time of purchase
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress?: string;
}