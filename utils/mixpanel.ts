// Mixpanel Analytics — singleton init (avoids mutex lock errors with Next.js HMR)
import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = 'a8cf933c3054afed7f397f71249ba506';
const isBrowser = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV === 'development';

declare global {
  interface Window {
    __kudyaMixpanelInitialized?: boolean;
  }
}

function initMixpanel(): void {
  if (!isBrowser || window.__kudyaMixpanelInitialized) return;

  window.__kudyaMixpanelInitialized = true;

  mixpanel.init(MIXPANEL_TOKEN, {
    // Cookie in dev avoids localStorage mutex timeouts; production uses localStorage.
    persistence: isDev ? 'cookie' : 'localStorage',
    autocapture: !isDev,
    record_sessions_percent: isDev ? 0 : 10,
    debug: false,
    track_pageview: false,
    batch_requests: true,
  });
}

function ready(): boolean {
  if (!isBrowser) return false;
  initMixpanel();
  return true;
}

class Analytics {
  trackPageView(pageName: string, properties?: Record<string, unknown>) {
    if (!ready()) return;
    mixpanel.track('Page View', { page: pageName, ...properties });
  }

  track(eventName: string, properties?: Record<string, unknown>) {
    if (!ready()) return;
    mixpanel.track(eventName, properties);
  }

  identify(userId: string) {
    if (!ready()) return;
    mixpanel.identify(userId);
  }

  setUserProperties(properties: Record<string, unknown>) {
    if (!ready()) return;
    mixpanel.people.set(properties);
  }

  trackSignup(userId: string, properties?: Record<string, unknown>) {
    if (!ready()) return;
    this.identify(userId);
    this.track('User Signup', properties);
    this.setUserProperties({
      $name: properties?.name,
      $email: properties?.email,
      signup_date: new Date().toISOString(),
      ...properties,
    });
  }

  trackLogin(userId: string, properties?: Record<string, unknown>) {
    if (!ready()) return;
    this.identify(userId);
    this.track('User Login', properties);
  }

  trackLogout() {
    if (!ready()) return;
    this.track('User Logout');
    mixpanel.reset();
    if (isBrowser) window.__kudyaMixpanelInitialized = false;
  }

  trackProductView(productId: string, productName: string, properties?: Record<string, unknown>) {
    if (!ready()) return;
    this.track('Product Viewed', { product_id: productId, product_name: productName, ...properties });
  }

  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    if (!ready()) return;
    this.track('Product Added to Cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      total: price * quantity,
    });
  }

  trackRemoveFromCart(productId: string, productName: string) {
    if (!ready()) return;
    this.track('Product Removed from Cart', { product_id: productId, product_name: productName });
  }

  trackCheckoutStarted(cartValue: number, itemCount: number) {
    if (!ready()) return;
    this.track('Checkout Started', { cart_value: cartValue, item_count: itemCount });
  }

  trackOrderCompleted(orderId: string, orderValue: number, items: unknown[]) {
    if (!ready()) return;
    this.track('Order Completed', {
      order_id: orderId,
      order_value: orderValue,
      item_count: items.length,
      items,
    });
  }

  trackSearch(query: string, results: number) {
    if (!ready()) return;
    this.track('Search', { query, results_count: results });
  }

  trackServiceBooking(serviceId: string, serviceName: string, price: number) {
    if (!ready()) return;
    this.track('Service Booked', { service_id: serviceId, service_name: serviceName, price });
  }

  trackHelpGuideOpened(section?: string) {
    if (!ready()) return;
    this.track('Help Guide Opened', { section });
  }

  trackCategorySelected(categoryId: string, categoryName: string) {
    if (!ready()) return;
    this.track('Category Selected', { category_id: categoryId, category_name: categoryName });
  }

  trackError(error: string, errorDetails?: unknown) {
    if (!ready()) return;
    this.track('Error Occurred', { error_message: error, error_details: errorDetails });
  }
}

export const analytics = new Analytics();
export { mixpanel };
