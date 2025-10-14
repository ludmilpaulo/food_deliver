// Mixpanel Analytics Configuration
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your token
const MIXPANEL_TOKEN = 'a8cf933c3054afed7f397f71249ba506';

// Check if we're in the browser (not SSR)
const isBrowser = typeof window !== 'undefined';

// Initialize Mixpanel
if (isBrowser) {
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
    debug: process.env.NODE_ENV === 'development',
  });
}

// Analytics class for tracking events
class Analytics {
  // Track page views
  trackPageView(pageName: string, properties?: Record<string, any>) {
    if (!isBrowser) return;
    
    mixpanel.track('Page View', {
      page: pageName,
      ...properties,
    });
  }

  // Track user actions
  track(eventName: string, properties?: Record<string, any>) {
    if (!isBrowser) return;
    
    mixpanel.track(eventName, properties);
  }

  // Identify user
  identify(userId: string) {
    if (!isBrowser) return;
    
    mixpanel.identify(userId);
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    if (!isBrowser) return;
    
    mixpanel.people.set(properties);
  }

  // Track user signup
  trackSignup(userId: string, properties?: Record<string, any>) {
    if (!isBrowser) return;
    
    this.identify(userId);
    this.track('User Signup', properties);
    this.setUserProperties({
      $name: properties?.name,
      $email: properties?.email,
      signup_date: new Date().toISOString(),
      ...properties,
    });
  }

  // Track user login
  trackLogin(userId: string, properties?: Record<string, any>) {
    if (!isBrowser) return;
    
    this.identify(userId);
    this.track('User Login', properties);
  }

  // Track user logout
  trackLogout() {
    if (!isBrowser) return;
    
    this.track('User Logout');
    mixpanel.reset();
  }

  // Track product views
  trackProductView(productId: string, productName: string, properties?: Record<string, any>) {
    if (!isBrowser) return;
    
    this.track('Product Viewed', {
      product_id: productId,
      product_name: productName,
      ...properties,
    });
  }

  // Track add to cart
  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    if (!isBrowser) return;
    
    this.track('Product Added to Cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      total: price * quantity,
    });
  }

  // Track remove from cart
  trackRemoveFromCart(productId: string, productName: string) {
    if (!isBrowser) return;
    
    this.track('Product Removed from Cart', {
      product_id: productId,
      product_name: productName,
    });
  }

  // Track checkout started
  trackCheckoutStarted(cartValue: number, itemCount: number) {
    if (!isBrowser) return;
    
    this.track('Checkout Started', {
      cart_value: cartValue,
      item_count: itemCount,
    });
  }

  // Track order completed
  trackOrderCompleted(orderId: string, orderValue: number, items: any[]) {
    if (!isBrowser) return;
    
    this.track('Order Completed', {
      order_id: orderId,
      order_value: orderValue,
      item_count: items.length,
      items: items,
    });
  }

  // Track search
  trackSearch(query: string, results: number) {
    if (!isBrowser) return;
    
    this.track('Search', {
      query,
      results_count: results,
    });
  }

  // Track service booking
  trackServiceBooking(serviceId: string, serviceName: string, price: number) {
    if (!isBrowser) return;
    
    this.track('Service Booked', {
      service_id: serviceId,
      service_name: serviceName,
      price,
    });
  }

  // Track help guide opened
  trackHelpGuideOpened(section?: string) {
    if (!isBrowser) return;
    
    this.track('Help Guide Opened', {
      section,
    });
  }

  // Track category selected
  trackCategorySelected(categoryId: string, categoryName: string) {
    if (!isBrowser) return;
    
    this.track('Category Selected', {
      category_id: categoryId,
      category_name: categoryName,
    });
  }

  // Track error
  trackError(error: string, errorDetails?: any) {
    if (!isBrowser) return;
    
    this.track('Error Occurred', {
      error_message: error,
      error_details: errorDetails,
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export mixpanel instance for direct access if needed
export { mixpanel };

