export type PaymentMethodCode =
  | 'cash'
  | 'card'
  | 'wallet'
  | 'ecocash'
  | 'bank_transfer'
  | 'mobile_money'
  | 'apple_pay'
  | 'google_pay'
  | string;

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'pending_verification'
  | 'paid'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'
  | 'rejected';

export type PaymentCountry = {
  id: number | null;
  code: string;
  name: string;
  currency?: string;
};

export type BankAccount = {
  id: number;
  country?: number;
  country_code?: string;
  country_name?: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_bic: string;
  branch: string;
  branch_code: string;
  currency: string;
  payment_reference_instructions: string;
  additional_instructions: string;
  is_active?: boolean;
};

export type AvailablePaymentMethod = {
  code: PaymentMethodCode;
  label: string;
  provider: string;
  available: boolean;
  requires_phone: boolean;
  requires_proof: boolean;
  bank_accounts?: BankAccount[];
};

export type PaymentConfiguration = {
  country: PaymentCountry | null;
  currency: string;
  min_amount: string;
  max_amount: string | null;
  default_method: PaymentMethodCode;
  manual_proof_required: boolean;
  methods: AvailablePaymentMethod[];
};

export type PaymentTransaction = {
  id: number;
  kudya_reference: string;
  service_type: string;
  object_id: number | null;
  amount: string;
  currency: string;
  method: PaymentMethodCode;
  status: PaymentStatus;
  provider_reference: string;
  rejection_reason: string;
  country: number | null;
  country_code: string | null;
  country_name: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentInitializeResponse = {
  payment_id: number;
  kudya_reference: string;
  authorization_url: string | null;
  provider: string;
  provider_reference: string;
  public_key: string | null;
  status: PaymentStatus;
  amount: string;
  currency: string;
  service_type: string;
  object_id: number | null;
  method: PaymentMethodCode;
  requires_action: string | null;
  customer_message: string | null;
  rejection_reason: string;
  bank_account: BankAccount | null;
  country: PaymentCountry;
};

export type ProofOfPayment = {
  id: number;
  original_filename: string;
  content_type: string;
  file_size: number;
  created_at: string;
  download_url: string;
};

export type Commission = {
  gross: string;
  commission: string;
  partner_amount: string;
};

export type WalletTransaction = {
  id: number;
  transaction_type: string;
  entry_type?: 'credit' | 'debit';
  amount: string;
  currency: string;
  status: string;
  reference: string;
  description: string;
  service_type?: string;
  created_at: string;
};

export type Refund = {
  id: number;
  payment: number;
  amount: string;
  currency: string;
  reason: string;
  status: string;
  kudya_reference: string;
  is_manual: boolean;
  created_at: string;
};

export type PaymentError = {
  detail: string;
  code: string;
};

export type ProviderResponse = {
  provider: string;
  status: PaymentStatus;
  reference: string;
};

export type CountryPaymentConfigAdmin = {
  id: number;
  country: number;
  country_code: string;
  country_name: string;
  currency: string;
  enabled: boolean;
  ecocash_enabled: boolean;
  bank_transfer_enabled: boolean;
  cash_on_delivery_enabled: boolean;
  wallet_enabled: boolean;
  card_enabled: boolean;
  manual_proof_required: boolean;
  default_payment_method: string;
  min_amount: string;
  max_amount: string | null;
  method_labels: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type PaymentProviderAdmin = {
  id: number;
  provider: string;
  country: string;
  country_ref: number | null;
  country_name: string | null;
  environment: string;
  base_url: string;
  merchant_code: string;
  public_key: string | null;
  active: boolean;
  credentials_present: Record<string, boolean>;
  masked_credentials: Record<string, string>;
};

export type PaymentAdminRow = PaymentTransaction & {
  customer_email: string;
  customer_phone: string;
  bank_account_detail: BankAccount | null;
  proofs: ProofOfPayment[];
  gross_amount: string;
  commission_amount: string;
  partner_amount: string;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  verified_at: string | null;
};

export type PaymentOverview = {
  totals: { count: number; amount: string };
  successful: { count: number; amount: string };
  pending: { count: number; amount: string };
  failed: { count: number; amount: string };
  refunds: { count: number; amount: string };
  eft_awaiting: { count: number; amount: string };
  ecocash: { count: number; amount: string };
  commission: string;
  partner_earnings: string;
  by_country: Array<{ country__name: string | null; country__code: string | null; count: number; amount: string }>;
  by_service: Array<{ service_type: string; count: number; amount: string }>;
  by_method: Array<{ method: string; count: number; amount: string }>;
  by_status: Array<{ status: string; count: number; amount: string }>;
};

export type PaymentAuditEvent = {
  id: number;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  target_repr: string;
  country_name: string | null;
  created_at: string;
};
