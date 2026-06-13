export type NotificationType =
  | 'provider_approved'
  | 'provider_rejected'
  | 'new_order'
  | 'order_accepted'
  | 'order_rejected'
  | 'order_status_changed'
  | 'booking_requested'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'refund_processed'
  | 'new_message'
  | 'coupon_applied'
  | 'promotion'
  | 'payout_requested'
  | 'payout_processed'
  | 'document_approved'
  | 'document_rejected'
  | 'dispute_opened'
  | 'system_alert'
  | 'doctor_approved'
  | 'doctor_rejected'
  | 'new_booking'
  | 'appointment_confirmed'
  | 'appointment_completed'
  | 'appointment_updated'
  | 'verification_request';

export interface AppNotification {
  id: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}
