// Re-export database types
export type {
  User,
  NewUser,
  Vendor,
  NewVendor,
  Product,
  NewProduct,
  Order,
  NewOrder,
  OrderItem,
  NewOrderItem,
  Subscription,
  NewSubscription,
  Review,
  NewReview,
} from '@/server/db/schema';

// Category types
export type ProductCategory = 'HPI' | 'ADHD' | 'hypersensitive';

export type RoastLevel = 'light' | 'medium' | 'dark';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type UserRole = 'customer' | 'vendor' | 'admin';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type SubscriptionFrequency = 'monthly' | 'quarterly';

// API response types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

// Pagination types
export type PaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};

// Filter types
export type ProductFilters = {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  roastLevel?: RoastLevel;
  vendorId?: string;
  featured?: boolean;
};

// Cart types
export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  vendorId: string;
  vendorName: string;
};

// Checkout types
export type ShippingAddress = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type CheckoutInput = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
};

// Vendor analytics types
export type VendorStats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  averageOrderValue: number;
};

// Admin analytics types
export type PlatformStats = {
  users: number;
  vendors: number;
  pendingVendors: number;
  products: number;
  orders: number;
  gmv: number;
  commissionEarned: number;
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
};

// Stripe types
export type StripeConnectStatus = {
  connected: boolean;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  accountId?: string;
};
