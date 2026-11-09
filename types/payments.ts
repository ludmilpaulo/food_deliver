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
  thunes_accept_enabled?: boolean;
  thunes_money_transfer_enabled?: boolean;
  thunes_refunds_enabled?: boolean;
  settlement_currency?: string;
  compliance_status?: string;
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

export type ThunesCredentialState = {
  id?: number;
  product: string;
  environment: string;
  base_url: string;
  active: boolean;
  credentials_status: string;
  key_hint: string;
  secret_hint: string;
  credential_version: number | null;
  credentials_updated_at?: string | null;
  last_test_at?: string | null;
  last_test_ok?: boolean | null;
  last_test_detail?: string;
  pending_approval_id?: number | null;
  callback_url: string;
};

export type ThunesCredentialVersion = {
  version: number;
  key_hint: string;
  secret_hint: string;
  is_active: boolean;
  created_at: string;
  retired_at: string | null;
  created_by: string;
};

export type ThunesMethodConfig = {
  id: number;
  country: number;
  country_code: string;
  currency: string;
  method_code: string;
  display_name: string;
  min_amount: string;
  max_amount: string | null;
  display_order: number;
  enabled: boolean;
  can_cancel: boolean;
  can_charge: boolean;
  can_refund: boolean;
  services: string[];
  payment_page_id: string;
  integration_mode: string;
};

export type ThunesFeeRule = {
  id: number;
  audience: string;
  fee_type: string;
  value: string;
  country: number | null;
  currency: string;
  service_type: string;
  enabled: boolean;
  waiver_until: string | null;
};

export type ThunesCountryCompliance = {
  id: number;
  country_code: string;
  country_name: string;
  currency: string;
  compliance_status: string;
  thunes_accept_enabled: boolean;
  thunes_money_transfer_enabled: boolean;
  thunes_refunds_enabled: boolean;
};

export type ThunesReconciliationRow = {
  id: number;
  kind: string;
  reference: string;
  detail: Record<string, unknown>;
  resolved: boolean;
  created_at: string;
};

export type WalletReconciliationReport = {
  currencies: Array<{
    currency: string;
    wallet_liabilities: string;
    ledger_liabilities: string;
    difference: string;
  }>;
  mismatches: Array<{ wallet_id: number; owner_type: string; currency: string; balance: string; ledger: string; delta: string }>;
};

export type TransferRequirements =
  | { credit_party_identifier?: string[][]; beneficiary?: string[][] }
  | Array<string | string[]>;

export type TransferDestination = {
  payer_id: string;
  name: string;
  country: string;
  currency: string;
  service: string;
  min_amount: string | null;
  max_amount: string | null;
  required_fields: TransferRequirements;
};

export type TransferQuote = {
  id: number;
  payer_id: string;
  source_amount: string;
  source_currency: string;
  destination_amount: string;
  destination_currency: string;
  fee: string;
  total_debit: string;
  fx_rate: string;
  expires_at: string;
  required_fields: TransferRequirements;
};

export type TransferVerification = {
  verified: boolean;
  verification_available: boolean;
  warning: string;
  account_status?: string;
};

export type MoneyTransferRow = {
  id: number;
  external_id: string;
  status_class: string;
  raw_status: string;
  customer_message: string;
  completed: boolean;
  beneficiary_received: boolean;
  reversed_to_wallet: boolean;
  amount: string;
  fee: string;
  currency: string;
  destination_amount: string;
  destination_currency: string;
  open_rfi: boolean;
  created_at: string;
};

export type ThunesRfi = {
  id: number;
  transfer_id: number;
  transfer_external_id: string;
  transfer_status: string;
  provider_rfi_id: string;
  provider_status: string;
  status: string;
  deadline: string | null;
  requested_fields: string[];
  requested_information: Record<string, string[]>;
  requested_documents: string[];
  description: string;
  has_document: boolean;
  created_at: string;
};
