import type { SupportedLocale } from "./translations";

export type PropertyTranslationKey =
  | "propertyDashboardTitle"
  | "propertyBrand"
  | "overview"
  | "listings"
  | "enquiries"
  | "profile"
  | "logout"
  | "languageSettings"
  | "loadingDashboard"
  | "dashboardLoadError"
  | "signIn"
  | "totalListings"
  | "activeListings"
  | "approvedListings"
  | "pendingListings"
  | "pendingEnquiries"
  | "recentEnquiries"
  | "noListings"
  | "noEnquiries"
  | "addListing"
  | "cancel"
  | "fillAllFields"
  | "listingTitle"
  | "listingCity"
  | "listingAddress"
  | "listingPrice"
  | "listingType"
  | "createListing"
  | "listingSaved"
  | "listingFailed"
  | "toggleAvailability"
  | "available"
  | "unavailable"
  | "markResponded"
  | "markScheduled"
  | "markClosed"
  | "enquiryUpdated"
  | "quickActions"
  | "manageListings"
  | "reviewEnquiries"
  | "listingTypeRentDaily"
  | "listingTypeRentMonthly"
  | "listingTypeBuy"
  | "enquiryTypeGeneral"
  | "enquiryTypeViewing"
  | "enquiryTypeOffer"
  | "enquiryTypeRentalApplication"
  | "statusPending"
  | "statusResponded"
  | "statusScheduled"
  | "statusApproved"
  | "statusRejected"
  | "statusClosed"
  | "approvalPending"
  | "approvalApproved"
  | "approvalRejected"
  | "approvalSuspended"
  | "analyticsTitle"
  | "enquiriesTrend"
  | "listingsByType"
  | "enquiriesByStatus"
  | "listingsByApproval"
  | "noAnalyticsData"
  | "last7Days"
  | "days30"
  | "days90"
  | "topListingsByEnquiries"
  | "vsPreviousPeriod"
  | "comparisonTitle"
  | "exportCsv"
  | "exportPdf"
  | "listingsCreated"
  | "enquiriesMetric"
  | "listingDescription"
  | "bedroomsLabel"
  | "bathroomsLabel"
  | "propertyTypeLabel"
  | "addFirstListing"
  | "createListingHint"
  | "addPhotos"
  | "addVideo"
  | "photosSelected"
  | "videoSelected"
  | "removeMedia"
  | "mediaHint"
  | "hasVideo"
  | "photoCount"
  | "propertyEnquiryBuyTemplate"
  | "propertyEnquiryRentMonthlyTemplate"
  | "propertyEnquiryRentDailyTemplate"
  | "properties"
  | "addProperty"
  | "managePropertiesSubtitle"
  | "goodMorning"
  | "goodAfternoon"
  | "goodEvening"
  | "dashboardGreetingSubtitle"
  | "propertyOverview"
  | "totalProperties"
  | "activeProperties"
  | "pendingReview"
  | "needsAttention"
  | "ofListings"
  | "statusActive"
  | "statusPendingReview"
  | "statusDraft"
  | "statusInactive"
  | "statusChangesRequired"
  | "statusSuspended"
  | "tabAll"
  | "tabActive"
  | "tabPending"
  | "tabDraft"
  | "tabInactive"
  | "searchProperties"
  | "purposeRent"
  | "purposeStay"
  | "purposeSale"
  | "purposeAll"
  | "manageProperty"
  | "pauseListing"
  | "activateListing"
  | "perDayShort"
  | "perMonthShort"
  | "emptyPropertiesTitle"
  | "emptyPropertiesSubtitle"
  | "tryAgain"
  | "continueListing"
  | "savedAutomatically"
  | "wizardStepOf"
  | "wizardPurposeTitle"
  | "wizardPurposeSubtitle"
  | "wizardTypeTitle"
  | "wizardDetailsTitle"
  | "wizardLocationTitle"
  | "wizardPricingTitle"
  | "wizardPhotosTitle"
  | "wizardReviewTitle"
  | "nextStep"
  | "backStep"
  | "submitForApproval"
  | "suburbLabel"
  | "parkingSpaces"
  | "areaLabel"
  | "furnished"
  | "amenities"
  | "depositLabel"
  | "currencyLabel"
  | "coverPhoto"
  | "reviewSummary"
  | "enquiriesInbox"
  | "enquiryTabAll"
  | "enquiryTabNew"
  | "enquiryTabResponded"
  | "enquiryTabClosed"
  | "emptyEnquiriesTitle"
  | "emptyEnquiriesSubtitle"
  | "attentionBanner"
  | "viewPending"
  | "filterPurpose"
  | "noMatchFilters"
  | "clearFilters"
  | "listingSubmitted"
  | "pending"
  | "applications"
  | "applicationsSubtitle"
  | "applicationLoadError"
  | "applicationActionFailed"
  | "applicationName"
  | "applicationEmail"
  | "applicationPhone"
  | "applicationEmployment"
  | "applicationAddress"
  | "applicationMoveIn"
  | "applicationPeriod"
  | "applicationStartReview"
  | "applicationDecision"
  | "applicationProposedRent"
  | "applicationProposedDeposit"
  | "applicationSpecialConditions"
  | "applicationApprove"
  | "applicationReject"
  | "applicationRejectionReason"
  | "applicationProposeViewing"
  | "applicationViewingLocation"
  | "requiredDocuments"
  | "applicationVerifyDocument"
  | "applicationRejectDocument"
  | "applicationDocumentRejectReason"
  | "applicationGenerateLease"
  | "lease"
  | "applicationSignatureName"
  | "applicationSignLease"
  | "stayBookings"
  | "stayBookingsSubtitle"
  | "stayBookingsLoadError"
  | "stayBookingsToday"
  | "stayBookingsUpcoming"
  | "stayBookingsThisMonth"
  | "emptyStayBookingsTitle"
  | "emptyStayBookingsSubtitle"
  | "stayNights"
  | "stayAdults"
  | "stayChildren"
  | "availability"
  | "availabilitySubtitle"
  | "availabilityLoadError"
  | "selectStayListing"
  | "noStayListingsTitle"
  | "noStayListingsSubtitle"
  | "blockDates"
  | "blockReason"
  | "blockedDatesList"
  | "noBlockedDates"
  | "unblockDates"
  | "stayBlockCreated"
  | "stayBlockFailed"
  | "stayBlockInvalidRange"
  | "stayStatusAvailable"
  | "stayStatusBlocked"
  | "stayStatusBooked"
  | "stayStatusPending"
  | "manageStayAvailability"
  | "nightlyPriceLabel"
  | "monthlyRentLabel"
  | "weekendPriceLabel"
  | "cleaningFeeLabel"
  | "minNightsLabel"
  | "maxGuestsLabel"
  | "allowedLeaseMonthsLabel"
  | "monthsChip";

type PropertyTranslationMap = Record<PropertyTranslationKey, string>;

const en: PropertyTranslationMap = {
  propertyDashboardTitle: "Property Dashboard",
  propertyBrand: "Kudya Property",
  overview: "Overview",
  listings: "Listings",
  enquiries: "Enquiries",
  profile: "Profile",
  logout: "Log out",
  languageSettings: "Language",
  loadingDashboard: "Loading dashboard…",
  dashboardLoadError: "Could not load property dashboard.",
  signIn: "Sign in",
  totalListings: "Total listings",
  activeListings: "Active listings",
  approvedListings: "Approved listings",
  pendingListings: "Pending approval",
  pendingEnquiries: "Pending enquiries",
  recentEnquiries: "Recent enquiries",
  noListings: "No property listings yet.",
  noEnquiries: "No enquiries yet.",
  addListing: "Add listing",
  cancel: "Cancel",
  fillAllFields: "Please fill in all required fields.",
  listingTitle: "Title",
  listingCity: "City",
  listingAddress: "Address",
  listingPrice: "Price",
  listingType: "Listing type",
  createListing: "Create listing",
  listingSaved: "Listing saved.",
  listingFailed: "Could not save listing.",
  toggleAvailability: "Toggle availability",
  available: "Available",
  unavailable: "Unavailable",
  markResponded: "Mark responded",
  markScheduled: "Schedule viewing",
  markClosed: "Close enquiry",
  enquiryUpdated: "Enquiry updated.",
  quickActions: "Quick actions",
  manageListings: "Manage listings",
  reviewEnquiries: "Review enquiries",
  listingTypeRentDaily: "Rent per day",
  listingTypeRentMonthly: "Rent per month",
  listingTypeBuy: "For sale",
  enquiryTypeGeneral: "General enquiry",
  enquiryTypeViewing: "Viewing request",
  enquiryTypeOffer: "Offer interest",
  enquiryTypeRentalApplication: "Rental application",
  statusPending: "Pending",
  statusResponded: "Responded",
  statusScheduled: "Viewing scheduled",
  statusApproved: "Approved",
  statusRejected: "Rejected",
  statusClosed: "Closed",
  approvalPending: "Pending approval",
  approvalApproved: "Approved",
  approvalRejected: "Rejected",
  approvalSuspended: "Suspended",
  analyticsTitle: "Analytics",
  enquiriesTrend: "Enquiries (last 7 days)",
  listingsByType: "Listings by type",
  enquiriesByStatus: "Enquiries by status",
  listingsByApproval: "Listings by approval",
  noAnalyticsData: "No activity yet — charts will appear once you have listings or enquiries.",
  last7Days: "Last 7 days",
  days30: "Last 30 days",
  days90: "Last 90 days",
  topListingsByEnquiries: "Top listings by enquiries",
  vsPreviousPeriod: "Compared with previous period",
  comparisonTitle: "Period comparison",
  exportCsv: "Export CSV",
  exportPdf: "Export PDF",
  listingsCreated: "Listings created",
  enquiriesMetric: "Enquiries",
  listingDescription: "Description",
  bedroomsLabel: "Bedrooms",
  bathroomsLabel: "Bathrooms",
  propertyTypeLabel: "Property type",
  addFirstListing: "Add your first listing",
  createListingHint: "Fill in the details below to publish a new property listing.",
  addPhotos: "Add photos",
  addVideo: "Add video",
  photosSelected: "photos selected",
  videoSelected: "Video selected",
  removeMedia: "Remove",
  mediaHint: "Add up to 12 photos (JPG/PNG) and one video (MP4/MOV, max 50MB).",
  hasVideo: "Has video",
  photoCount: "photos",
  propertyEnquiryBuyTemplate:
    'Hello, I am interested in purchasing "{title}". Please share next steps for viewing and making an offer.',
  propertyEnquiryRentMonthlyTemplate:
    'Hello, I would like to apply to rent "{title}" on a monthly basis. Please let me know availability and required documents.',
  propertyEnquiryRentDailyTemplate:
    'Hello, I would like to rent "{title}" and check available dates. Please confirm pricing and booking steps.',
  properties: "Properties",
  addProperty: "Add Property",
  managePropertiesSubtitle: "Manage your properties, listings and availability.",
  goodMorning: "Good morning",
  goodAfternoon: "Good afternoon",
  goodEvening: "Good evening",
  dashboardGreetingSubtitle: "Manage your properties and enquiries.",
  propertyOverview: "Property overview",
  totalProperties: "Total properties",
  activeProperties: "Active",
  pendingReview: "Pending review",
  needsAttention: "Needs attention",
  ofListings: "of listings",
  statusActive: "Active",
  statusPendingReview: "Pending review",
  statusDraft: "Draft",
  statusInactive: "Inactive",
  statusChangesRequired: "Changes required",
  statusSuspended: "Suspended",
  tabAll: "All",
  tabActive: "Active",
  tabPending: "Pending",
  tabDraft: "Draft",
  tabInactive: "Inactive",
  searchProperties: "Search properties…",
  purposeRent: "Rent",
  purposeStay: "Stay",
  purposeSale: "Sale",
  purposeAll: "All",
  manageProperty: "Manage property",
  pauseListing: "Pause listing",
  activateListing: "Activate",
  perDayShort: "day",
  perMonthShort: "month",
  emptyPropertiesTitle: "No properties yet",
  emptyPropertiesSubtitle: "Start by adding your first property and reach customers on Kudya.",
  tryAgain: "Try again",
  continueListing: "Continue listing",
  savedAutomatically: "Saved automatically",
  wizardStepOf: "Step {{current}} of {{total}}",
  wizardPurposeTitle: "What are you listing?",
  wizardPurposeSubtitle: "Choose how customers will find this property.",
  wizardTypeTitle: "Property type",
  wizardDetailsTitle: "Basic information",
  wizardLocationTitle: "Location",
  wizardPricingTitle: "Pricing",
  wizardPhotosTitle: "Photos & amenities",
  wizardReviewTitle: "Review listing",
  nextStep: "Continue",
  backStep: "Back",
  submitForApproval: "Submit for approval",
  suburbLabel: "Suburb / neighbourhood",
  parkingSpaces: "Parking spaces",
  areaLabel: "Area (m²)",
  furnished: "Furnished",
  amenities: "Amenities",
  depositLabel: "Deposit",
  currencyLabel: "Currency",
  coverPhoto: "Cover",
  reviewSummary: "Review your details before submitting.",
  enquiriesInbox: "Enquiries",
  enquiryTabAll: "All",
  enquiryTabNew: "New",
  enquiryTabResponded: "Responded",
  enquiryTabClosed: "Closed",
  emptyEnquiriesTitle: "No enquiries yet",
  emptyEnquiriesSubtitle: "When customers contact you, their messages will appear here.",
  attentionBanner: "You have listings that need attention",
  viewPending: "View pending",
  filterPurpose: "Purpose",
  noMatchFilters: "No properties match these filters.",
  clearFilters: "Clear filters",
  listingSubmitted: "Listing submitted for approval.",
  pending: "Pending",
  applications: "Applications",
  applicationsSubtitle: "Review rental applications and manage the next steps.",
  applicationLoadError: "Could not load this application.",
  applicationActionFailed: "Unable to complete this action.",
  applicationName: "Name",
  applicationEmail: "Email",
  applicationPhone: "Phone",
  applicationEmployment: "Employment",
  applicationAddress: "Address",
  applicationMoveIn: "Move-in date",
  applicationPeriod: "Rental period (months)",
  applicationStartReview: "Start review",
  applicationDecision: "Decision",
  applicationProposedRent: "Proposed rent",
  applicationProposedDeposit: "Proposed deposit",
  applicationSpecialConditions: "Special conditions",
  applicationApprove: "Approve application",
  applicationReject: "Reject application",
  applicationRejectionReason: "Reason for rejection",
  applicationProposeViewing: "Propose viewing",
  applicationViewingLocation: "Viewing location",
  requiredDocuments: "Required documents",
  applicationVerifyDocument: "Verify",
  applicationRejectDocument: "Reject document",
  applicationDocumentRejectReason: "Document rejection reason",
  applicationGenerateLease: "Generate lease",
  lease: "Lease",
  applicationSignatureName: "Full name for signature",
  applicationSignLease: "Sign lease",
  stayBookings: "Stay bookings",
  stayBookingsSubtitle: "Guest reservations for your short-stay listings.",
  stayBookingsLoadError: "Could not load stay bookings.",
  stayBookingsToday: "Check-ins today",
  stayBookingsUpcoming: "Upcoming",
  stayBookingsThisMonth: "This month",
  emptyStayBookingsTitle: "No stay bookings yet",
  emptyStayBookingsSubtitle: "Confirmed and pending guest stays will appear here.",
  stayNights: "nights",
  stayAdults: "adults",
  stayChildren: "children",
  availability: "Availability",
  availabilitySubtitle: "View calendar and block dates for stay listings.",
  availabilityLoadError: "Could not load availability.",
  selectStayListing: "Select stay listing",
  noStayListingsTitle: "No stay listings",
  noStayListingsSubtitle: "Create a stay listing to manage availability.",
  blockDates: "Block dates",
  blockReason: "Reason (optional)",
  blockedDatesList: "Blocked dates",
  noBlockedDates: "No blocked date ranges.",
  unblockDates: "Unblock",
  stayBlockCreated: "Dates blocked.",
  stayBlockFailed: "Could not update blocked dates.",
  stayBlockInvalidRange: "End date must be on or after start date.",
  stayStatusAvailable: "Available",
  stayStatusBlocked: "Blocked",
  stayStatusBooked: "Booked",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendar",
  nightlyPriceLabel: "Price per night",
  monthlyRentLabel: "Monthly rent",
  weekendPriceLabel: "Weekend nightly price (optional)",
  cleaningFeeLabel: "Cleaning fee (optional)",
  minNightsLabel: "Minimum nights",
  maxGuestsLabel: "Maximum guests",
  allowedLeaseMonthsLabel: "Allowed lease terms",
  monthsChip: "{{n}} months",
};

const pt: PropertyTranslationMap = {
  ...en,
  propertyDashboardTitle: "Painel de Imóveis",
  propertyBrand: "Kudya Imóveis",
  overview: "Visão geral",
  listings: "Anúncios",
  enquiries: "Pedidos",
  profile: "Perfil",
  logout: "Sair",
  languageSettings: "Idioma",
  loadingDashboard: "A carregar painel…",
  dashboardLoadError: "Não foi possível carregar o painel de imóveis.",
  signIn: "Entrar",
  totalListings: "Total de anúncios",
  activeListings: "Anúncios activos",
  approvedListings: "Anúncios aprovados",
  pendingListings: "Aguardando aprovação",
  pendingEnquiries: "Pedidos pendentes",
  recentEnquiries: "Pedidos recentes",
  noListings: "Ainda não há anúncios.",
  noEnquiries: "Ainda não há pedidos.",
  addListing: "Adicionar anúncio",
  cancel: "Cancelar",
  fillAllFields: "Por favor, preencha todos os campos obrigatórios.",
  listingTitle: "Título",
  listingCity: "Cidade",
  listingAddress: "Morada",
  listingPrice: "Preço",
  listingType: "Tipo de anúncio",
  createListing: "Criar anúncio",
  listingSaved: "Anúncio guardado.",
  listingFailed: "Não foi possível guardar o anúncio.",
  toggleAvailability: "Alternar disponibilidade",
  available: "Disponível",
  unavailable: "Indisponível",
  markResponded: "Marcar respondido",
  markScheduled: "Agendar visita",
  markClosed: "Fechar pedido",
  enquiryUpdated: "Pedido actualizado.",
  quickActions: "Acções rápidas",
  manageListings: "Gerir anúncios",
  reviewEnquiries: "Rever pedidos",
  listingTypeRentDaily: "Arrendamento diário",
  listingTypeRentMonthly: "Arrendamento mensal",
  listingTypeBuy: "Venda",
  enquiryTypeGeneral: "Pedido geral",
  enquiryTypeViewing: "Pedido de visita",
  enquiryTypeOffer: "Interesse em compra",
  enquiryTypeRentalApplication: "Candidatura de arrendamento",
  statusPending: "Pendente",
  statusResponded: "Respondido",
  statusScheduled: "Visita agendada",
  statusApproved: "Aprovado",
  statusRejected: "Rejeitado",
  statusClosed: "Fechado",
  approvalPending: "Aguardando aprovação",
  approvalApproved: "Aprovado",
  approvalRejected: "Rejeitado",
  approvalSuspended: "Suspenso",
  analyticsTitle: "Análises",
  enquiriesTrend: "Pedidos (últimos 7 dias)",
  listingsByType: "Anúncios por tipo",
  enquiriesByStatus: "Pedidos por estado",
  listingsByApproval: "Anúncios por aprovação",
  noAnalyticsData: "Ainda sem actividade — os gráficos aparecerão quando houver anúncios ou pedidos.",
  last7Days: "Últimos 7 dias",
  days30: "Últimos 30 dias",
  days90: "Últimos 90 dias",
  topListingsByEnquiries: "Anúncios com mais pedidos",
  vsPreviousPeriod: "Comparado com o período anterior",
  comparisonTitle: "Comparação do período",
  exportCsv: "Exportar CSV",
  exportPdf: "Exportar PDF",
  listingsCreated: "Anúncios criados",
  enquiriesMetric: "Pedidos",
  listingDescription: "Descrição",
  bedroomsLabel: "Quartos",
  bathroomsLabel: "Casas de banho",
  propertyTypeLabel: "Tipo de imóvel",
  addFirstListing: "Adicionar o primeiro anúncio",
  createListingHint: "Preencha os detalhes abaixo para publicar um novo anúncio.",
  addPhotos: "Adicionar fotos",
  addVideo: "Adicionar vídeo",
  photosSelected: "fotos selecionadas",
  videoSelected: "Vídeo selecionado",
  removeMedia: "Remover",
  mediaHint: "Adicione até 12 fotos (JPG/PNG) e um vídeo (MP4/MOV, máx. 50MB).",
  hasVideo: "Tem vídeo",
  photoCount: "fotos",
  propertyEnquiryBuyTemplate:
    'Olá, tenho interesse em comprar "{title}". Por favor, partilhe os próximos passos para visita e proposta.',
  propertyEnquiryRentMonthlyTemplate:
    'Olá, gostaria de candidatar-me a arrendar "{title}" mensalmente. Informe-me sobre disponibilidade e documentos necessários.',
  propertyEnquiryRentDailyTemplate:
    'Olá, gostaria de arrendar "{title}" e verificar datas disponíveis. Confirme preço e passos de reserva.',
  applications: "Candidaturas",
  applicationsSubtitle: "Reveja candidaturas de arrendamento e defina os próximos passos.",
  applicationLoadError: "Não foi possível carregar esta candidatura.",
  applicationActionFailed: "Não foi possível concluir esta ação.",
  applicationName: "Nome",
  applicationEmail: "Email",
  applicationPhone: "Telefone",
  applicationEmployment: "Emprego",
  applicationAddress: "Morada",
  applicationMoveIn: "Data de entrada",
  applicationPeriod: "Período de arrendamento (meses)",
  applicationStartReview: "Iniciar revisão",
  applicationDecision: "Decisão",
  applicationProposedRent: "Renda proposta",
  applicationProposedDeposit: "Caução proposta",
  applicationSpecialConditions: "Condições especiais",
  applicationApprove: "Aprovar candidatura",
  applicationReject: "Rejeitar candidatura",
  applicationRejectionReason: "Motivo da rejeição",
  applicationProposeViewing: "Propor visita",
  applicationViewingLocation: "Local da visita",
  requiredDocuments: "Documentos necessários",
  applicationVerifyDocument: "Verificar",
  applicationRejectDocument: "Rejeitar documento",
  applicationDocumentRejectReason: "Motivo da rejeição do documento",
  applicationGenerateLease: "Gerar contrato",
  lease: "Contrato",
  applicationSignatureName: "Nome completo para assinatura",
  applicationSignLease: "Assinar contrato",
  stayBookings: "Reservas de estadia",
  stayBookingsSubtitle: "Reservas de hóspedes nos seus anúncios de curta duração.",
  stayBookingsLoadError: "Não foi possível carregar as reservas.",
  stayBookingsToday: "Check-ins hoje",
  stayBookingsUpcoming: "Próximas",
  stayBookingsThisMonth: "Este mês",
  emptyStayBookingsTitle: "Ainda sem reservas",
  emptyStayBookingsSubtitle: "As estadias confirmadas e pendentes aparecem aqui.",
  stayNights: "noites",
  stayAdults: "adultos",
  stayChildren: "crianças",
  availability: "Disponibilidade",
  availabilitySubtitle: "Veja o calendário e bloqueie datas dos anúncios de estadia.",
  availabilityLoadError: "Não foi possível carregar a disponibilidade.",
  selectStayListing: "Seleccionar anúncio de estadia",
  noStayListingsTitle: "Sem anúncios de estadia",
  noStayListingsSubtitle: "Crie um anúncio de estadia para gerir a disponibilidade.",
  blockDates: "Bloquear datas",
  blockReason: "Motivo (opcional)",
  blockedDatesList: "Datas bloqueadas",
  noBlockedDates: "Não há intervalos bloqueados.",
  unblockDates: "Desbloquear",
  stayBlockCreated: "Datas bloqueadas.",
  stayBlockFailed: "Não foi possível actualizar as datas bloqueadas.",
  stayBlockInvalidRange: "A data final deve ser igual ou posterior à inicial.",
  stayStatusAvailable: "Disponível",
  stayStatusBlocked: "Bloqueado",
  stayStatusBooked: "Reservado",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendário",
  nightlyPriceLabel: "Preço por noite",
  monthlyRentLabel: "Renda mensal",
  weekendPriceLabel: "Preço de fim de semana (opcional)",
  cleaningFeeLabel: "Taxa de limpeza (opcional)",
  minNightsLabel: "Noites mínimas",
  maxGuestsLabel: "Máximo de hóspedes",
  allowedLeaseMonthsLabel: "Prazos de arrendamento",
  monthsChip: "{{n}} meses",
};

const fr: PropertyTranslationMap = {
  ...en,
  propertyDashboardTitle: "Tableau de bord immobilier",
  propertyBrand: "Kudya Immobilier",
  overview: "Aperçu",
  listings: "Annonces",
  enquiries: "Demandes",
  profile: "Profil",
  logout: "Se déconnecter",
  languageSettings: "Langue",
  loadingDashboard: "Chargement du tableau de bord…",
  dashboardLoadError: "Impossible de charger le tableau de bord immobilier.",
  signIn: "Se connecter",
  totalListings: "Total des annonces",
  activeListings: "Annonces actives",
  approvedListings: "Annonces approuvées",
  pendingListings: "En attente d'approbation",
  pendingEnquiries: "Demandes en attente",
  recentEnquiries: "Demandes récentes",
  noListings: "Aucune annonce pour le moment.",
  noEnquiries: "Aucune demande pour le moment.",
  addListing: "Ajouter une annonce",
  cancel: "Annuler",
  fillAllFields: "Veuillez remplir tous les champs obligatoires.",
  listingTitle: "Titre",
  listingCity: "Ville",
  listingAddress: "Adresse",
  listingPrice: "Prix",
  listingType: "Type d'annonce",
  createListing: "Créer l'annonce",
  listingSaved: "Annonce enregistrée.",
  listingFailed: "Impossible d'enregistrer l'annonce.",
  toggleAvailability: "Changer la disponibilité",
  available: "Disponible",
  unavailable: "Indisponible",
  markResponded: "Marquer comme répondu",
  markScheduled: "Planifier une visite",
  markClosed: "Fermer la demande",
  enquiryUpdated: "Demande mise à jour.",
  quickActions: "Actions rapides",
  manageListings: "Gérer les annonces",
  reviewEnquiries: "Examiner les demandes",
  listingTypeRentDaily: "Location à la journée",
  listingTypeRentMonthly: "Location mensuelle",
  listingTypeBuy: "À vendre",
  enquiryTypeGeneral: "Demande générale",
  enquiryTypeViewing: "Demande de visite",
  enquiryTypeOffer: "Intérêt d'achat",
  enquiryTypeRentalApplication: "Demande de location",
  statusPending: "En attente",
  statusResponded: "Répondu",
  statusScheduled: "Visite planifiée",
  statusApproved: "Approuvé",
  statusRejected: "Rejeté",
  statusClosed: "Fermé",
  approvalPending: "En attente d'approbation",
  approvalApproved: "Approuvé",
  approvalRejected: "Rejeté",
  approvalSuspended: "Suspendu",
  analyticsTitle: "Analyses",
  enquiriesTrend: "Demandes (7 derniers jours)",
  listingsByType: "Annonces par type",
  enquiriesByStatus: "Demandes par statut",
  listingsByApproval: "Annonces par approbation",
  noAnalyticsData: "Pas encore d'activité — les graphiques apparaîtront avec des annonces ou demandes.",
  last7Days: "7 derniers jours",
  days30: "30 derniers jours",
  days90: "90 derniers jours",
  topListingsByEnquiries: "Annonces les plus demandées",
  vsPreviousPeriod: "Comparé à la période précédente",
  comparisonTitle: "Comparaison de période",
  exportCsv: "Exporter CSV",
  exportPdf: "Exporter PDF",
  listingsCreated: "Annonces créées",
  enquiriesMetric: "Demandes",
  listingDescription: "Description",
  bedroomsLabel: "Chambres",
  bathroomsLabel: "Salles de bain",
  propertyTypeLabel: "Type de bien",
  addFirstListing: "Ajouter votre première annonce",
  createListingHint: "Remplissez les détails ci-dessous pour publier une nouvelle annonce.",
  addPhotos: "Ajouter des photos",
  addVideo: "Ajouter une vidéo",
  photosSelected: "photos sélectionnées",
  videoSelected: "Vidéo sélectionnée",
  removeMedia: "Retirer",
  mediaHint: "Ajoutez jusqu'à 12 photos (JPG/PNG) et une vidéo (MP4/MOV, max 50MB).",
  hasVideo: "Avec vidéo",
  photoCount: "photos",
  propertyEnquiryBuyTemplate:
    'Bonjour, je suis intéressé par l\'achat de « {title} ». Merci de me communiquer les prochaines étapes.',
  propertyEnquiryRentMonthlyTemplate:
    'Bonjour, je souhaite louer « {title} » au mois. Merci de m\'indiquer la disponibilité et les documents requis.',
  propertyEnquiryRentDailyTemplate:
    'Bonjour, je souhaite louer « {title} » et vérifier les dates disponibles. Merci de confirmer le prix.',
  applications: "Candidatures",
  applicationsSubtitle: "Examinez les demandes de location et gérez les prochaines étapes.",
  applicationLoadError: "Impossible de charger cette candidature.",
  applicationActionFailed: "Impossible d'effectuer cette action.",
  applicationName: "Nom",
  applicationEmail: "E-mail",
  applicationPhone: "Téléphone",
  applicationEmployment: "Emploi",
  applicationAddress: "Adresse",
  applicationMoveIn: "Date d'entrée",
  applicationPeriod: "Durée de location (mois)",
  applicationStartReview: "Commencer l'examen",
  applicationDecision: "Décision",
  applicationProposedRent: "Loyer proposé",
  applicationProposedDeposit: "Dépôt proposé",
  applicationSpecialConditions: "Conditions particulières",
  applicationApprove: "Approuver la candidature",
  applicationReject: "Rejeter la candidature",
  applicationRejectionReason: "Motif du rejet",
  applicationProposeViewing: "Proposer une visite",
  applicationViewingLocation: "Lieu de la visite",
  requiredDocuments: "Documents requis",
  applicationVerifyDocument: "Vérifier",
  applicationRejectDocument: "Rejeter le document",
  applicationDocumentRejectReason: "Motif du rejet du document",
  applicationGenerateLease: "Générer le bail",
  lease: "Bail",
  applicationSignatureName: "Nom complet pour la signature",
  applicationSignLease: "Signer le bail",
  stayBookings: "Réservations séjour",
  stayBookingsSubtitle: "Réservations clients pour vos annonces de courte durée.",
  stayBookingsLoadError: "Impossible de charger les réservations.",
  stayBookingsToday: "Arrivées aujourd'hui",
  stayBookingsUpcoming: "À venir",
  stayBookingsThisMonth: "Ce mois",
  emptyStayBookingsTitle: "Aucune réservation",
  emptyStayBookingsSubtitle: "Les séjours confirmés et en attente apparaîtront ici.",
  stayNights: "nuits",
  stayAdults: "adultes",
  stayChildren: "enfants",
  availability: "Disponibilité",
  availabilitySubtitle: "Calendrier et blocage de dates pour les annonces séjour.",
  availabilityLoadError: "Impossible de charger la disponibilité.",
  selectStayListing: "Choisir une annonce séjour",
  noStayListingsTitle: "Aucune annonce séjour",
  noStayListingsSubtitle: "Créez une annonce séjour pour gérer la disponibilité.",
  blockDates: "Bloquer des dates",
  blockReason: "Motif (optionnel)",
  blockedDatesList: "Dates bloquées",
  noBlockedDates: "Aucune période bloquée.",
  unblockDates: "Débloquer",
  stayBlockCreated: "Dates bloquées.",
  stayBlockFailed: "Impossible de mettre à jour les dates bloquées.",
  stayBlockInvalidRange: "La date de fin doit être postérieure ou égale à la date de début.",
  stayStatusAvailable: "Disponible",
  stayStatusBlocked: "Bloqué",
  stayStatusBooked: "Réservé",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendrier",
  nightlyPriceLabel: "Prix par nuit",
  monthlyRentLabel: "Loyer mensuel",
  weekendPriceLabel: "Prix week-end (optionnel)",
  cleaningFeeLabel: "Frais de ménage (optionnel)",
  minNightsLabel: "Nuits minimum",
  maxGuestsLabel: "Voyageurs maximum",
  allowedLeaseMonthsLabel: "Durées de bail autorisées",
  monthsChip: "{{n}} mois",
};

const es: PropertyTranslationMap = {
  ...en,
  propertyDashboardTitle: "Panel de propiedades",
  propertyBrand: "Kudya Propiedades",
  overview: "Resumen",
  listings: "Anuncios",
  enquiries: "Consultas",
  profile: "Perfil",
  logout: "Cerrar sesión",
  languageSettings: "Idioma",
  loadingDashboard: "Cargando panel…",
  dashboardLoadError: "No se pudo cargar el panel de propiedades.",
  signIn: "Iniciar sesión",
  totalListings: "Total de anuncios",
  activeListings: "Anuncios activos",
  approvedListings: "Anuncios aprobados",
  pendingListings: "Pendiente de aprobación",
  pendingEnquiries: "Consultas pendientes",
  recentEnquiries: "Consultas recientes",
  noListings: "Aún no hay anuncios.",
  noEnquiries: "Aún no hay consultas.",
  addListing: "Añadir anuncio",
  cancel: "Cancelar",
  fillAllFields: "Completa todos los campos obligatorios.",
  listingTitle: "Título",
  listingCity: "Ciudad",
  listingAddress: "Dirección",
  listingPrice: "Precio",
  listingType: "Tipo de anuncio",
  createListing: "Crear anuncio",
  listingSaved: "Anuncio guardado.",
  listingFailed: "No se pudo guardar el anuncio.",
  toggleAvailability: "Cambiar disponibilidad",
  available: "Disponible",
  unavailable: "No disponible",
  markResponded: "Marcar respondido",
  markScheduled: "Programar visita",
  markClosed: "Cerrar consulta",
  enquiryUpdated: "Consulta actualizada.",
  quickActions: "Acciones rápidas",
  manageListings: "Gestionar anuncios",
  reviewEnquiries: "Revisar consultas",
  listingTypeRentDaily: "Alquiler por día",
  listingTypeRentMonthly: "Alquiler mensual",
  listingTypeBuy: "En venta",
  enquiryTypeGeneral: "Consulta general",
  enquiryTypeViewing: "Solicitud de visita",
  enquiryTypeOffer: "Interés de compra",
  enquiryTypeRentalApplication: "Solicitud de alquiler",
  statusPending: "Pendiente",
  statusResponded: "Respondido",
  statusScheduled: "Visita programada",
  statusApproved: "Aprobado",
  statusRejected: "Rechazado",
  statusClosed: "Cerrado",
  approvalPending: "Pendiente de aprobación",
  approvalApproved: "Aprobado",
  approvalRejected: "Rechazado",
  approvalSuspended: "Suspendido",
  analyticsTitle: "Análisis",
  enquiriesTrend: "Consultas (últimos 7 días)",
  listingsByType: "Anuncios por tipo",
  enquiriesByStatus: "Consultas por estado",
  listingsByApproval: "Anuncios por aprobación",
  noAnalyticsData: "Sin actividad aún — los gráficos aparecerán cuando haya anuncios o consultas.",
  last7Days: "Últimos 7 días",
  days30: "Últimos 30 días",
  days90: "Últimos 90 días",
  topListingsByEnquiries: "Anuncios con más consultas",
  vsPreviousPeriod: "Comparado con el período anterior",
  comparisonTitle: "Comparación del período",
  exportCsv: "Exportar CSV",
  exportPdf: "Exportar PDF",
  listingsCreated: "Anuncios creados",
  enquiriesMetric: "Consultas",
  listingDescription: "Descripción",
  bedroomsLabel: "Habitaciones",
  bathroomsLabel: "Baños",
  propertyTypeLabel: "Tipo de propiedad",
  addFirstListing: "Añadir tu primer anuncio",
  createListingHint: "Completa los datos abajo para publicar un nuevo anuncio.",
  addPhotos: "Añadir fotos",
  addVideo: "Añadir vídeo",
  photosSelected: "fotos seleccionadas",
  videoSelected: "Vídeo seleccionado",
  removeMedia: "Quitar",
  mediaHint: "Añade hasta 12 fotos (JPG/PNG) y un vídeo (MP4/MOV, máx. 50MB).",
  hasVideo: "Tiene vídeo",
  photoCount: "fotos",
  propertyEnquiryBuyTemplate:
    'Hola, estoy interesado en comprar "{title}". Por favor, indique los siguientes pasos.',
  propertyEnquiryRentMonthlyTemplate:
    'Hola, me gustaría solicitar el alquiler mensual de "{title}". Indique disponibilidad y documentos.',
  propertyEnquiryRentDailyTemplate:
    'Hola, me gustaría alquilar "{title}" y consultar fechas disponibles. Confirme el precio.',
  applications: "Solicitudes",
  applicationsSubtitle: "Revisa las solicitudes de alquiler y gestiona los próximos pasos.",
  applicationLoadError: "No se pudo cargar esta solicitud.",
  applicationActionFailed: "No se pudo completar esta acción.",
  applicationName: "Nombre",
  applicationEmail: "Correo electrónico",
  applicationPhone: "Teléfono",
  applicationEmployment: "Empleo",
  applicationAddress: "Dirección",
  applicationMoveIn: "Fecha de entrada",
  applicationPeriod: "Período de alquiler (meses)",
  applicationStartReview: "Iniciar revisión",
  applicationDecision: "Decisión",
  applicationProposedRent: "Renta propuesta",
  applicationProposedDeposit: "Depósito propuesto",
  applicationSpecialConditions: "Condiciones especiales",
  applicationApprove: "Aprobar solicitud",
  applicationReject: "Rechazar solicitud",
  applicationRejectionReason: "Motivo del rechazo",
  applicationProposeViewing: "Proponer visita",
  applicationViewingLocation: "Ubicación de la visita",
  requiredDocuments: "Documentos requeridos",
  applicationVerifyDocument: "Verificar",
  applicationRejectDocument: "Rechazar documento",
  applicationDocumentRejectReason: "Motivo del rechazo del documento",
  applicationGenerateLease: "Generar contrato",
  lease: "Contrato",
  applicationSignatureName: "Nombre completo para la firma",
  applicationSignLease: "Firmar contrato",
  stayBookings: "Reservas de estancia",
  stayBookingsSubtitle: "Reservas de huéspedes en tus anuncios de corta estancia.",
  stayBookingsLoadError: "No se pudieron cargar las reservas.",
  stayBookingsToday: "Check-ins hoy",
  stayBookingsUpcoming: "Próximas",
  stayBookingsThisMonth: "Este mes",
  emptyStayBookingsTitle: "Aún no hay reservas",
  emptyStayBookingsSubtitle: "Las estancias confirmadas y pendientes aparecerán aquí.",
  stayNights: "noches",
  stayAdults: "adultos",
  stayChildren: "niños",
  availability: "Disponibilidad",
  availabilitySubtitle: "Calendario y bloqueo de fechas para anuncios de estancia.",
  availabilityLoadError: "No se pudo cargar la disponibilidad.",
  selectStayListing: "Seleccionar anuncio de estancia",
  noStayListingsTitle: "Sin anuncios de estancia",
  noStayListingsSubtitle: "Crea un anuncio de estancia para gestionar la disponibilidad.",
  blockDates: "Bloquear fechas",
  blockReason: "Motivo (opcional)",
  blockedDatesList: "Fechas bloqueadas",
  noBlockedDates: "No hay rangos bloqueados.",
  unblockDates: "Desbloquear",
  stayBlockCreated: "Fechas bloqueadas.",
  stayBlockFailed: "No se pudieron actualizar las fechas bloqueadas.",
  stayBlockInvalidRange: "La fecha final debe ser igual o posterior a la inicial.",
  stayStatusAvailable: "Disponible",
  stayStatusBlocked: "Bloqueado",
  stayStatusBooked: "Reservado",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendario",
  nightlyPriceLabel: "Precio por noche",
  monthlyRentLabel: "Alquiler mensual",
  weekendPriceLabel: "Precio de fin de semana (opcional)",
  cleaningFeeLabel: "Tarifa de limpieza (opcional)",
  minNightsLabel: "Noches mínimas",
  maxGuestsLabel: "Huéspedes máximos",
  allowedLeaseMonthsLabel: "Plazos de arrendamiento",
  monthsChip: "{{n}} meses",
};

const propertyTranslations: Record<SupportedLocale, PropertyTranslationMap> = {
  en,
  pt,
  fr,
  es,
};

export function propertyT(key: PropertyTranslationKey, locale: SupportedLocale): string {
  return propertyTranslations[locale]?.[key] ?? propertyTranslations.en[key] ?? key;
}

export function listingTypeLabel(type: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    rent_daily: "listingTypeRentDaily",
    rent_monthly: "listingTypeRentMonthly",
    buy: "listingTypeBuy",
  };
  const key = map[type];
  return key ? propertyT(key, locale) : type;
}

export function approvalStatusLabel(status: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    draft: "statusDraft",
    pending: "approvalPending",
    under_review: "statusPendingReview",
    approved: "approvalApproved",
    rejected: "statusChangesRequired",
    suspended: "approvalSuspended",
  };
  const key = map[status];
  return key ? propertyT(key, locale) : status;
}

export function enquiryStatusLabel(status: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    pending: "statusPending",
    responded: "statusResponded",
    scheduled: "statusScheduled",
    approved: "statusApproved",
    rejected: "statusRejected",
    closed: "statusClosed",
  };
  const key = map[status];
  return key ? propertyT(key, locale) : status;
}

export function enquiryTypeLabel(type: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    general: "enquiryTypeGeneral",
    viewing: "enquiryTypeViewing",
    offer: "enquiryTypeOffer",
    rental_application: "enquiryTypeRentalApplication",
  };
  const key = map[type];
  return key ? propertyT(key, locale) : type;
}

const PROPERTY_TYPE_LABELS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    apartment: "Apartment",
    house: "House",
    villa: "Villa",
    townhouse: "Townhouse",
    room: "Room",
    studio: "Studio",
    office: "Office",
    commercial: "Commercial",
    land: "Land",
    hotel: "Hotel",
    guest_house: "Guest House",
    lodge: "Lodge",
    other: "Other",
  },
  pt: {
    apartment: "Apartamento",
    house: "Casa",
    villa: "Vila",
    townhouse: "Moradia",
    room: "Quarto",
    studio: "Estúdio",
    office: "Escritório",
    commercial: "Comercial",
    land: "Terreno",
    hotel: "Hotel",
    guest_house: "Casa de hóspedes",
    lodge: "Lodge",
    other: "Outro",
  },
  fr: {
    apartment: "Appartement",
    house: "Maison",
    villa: "Villa",
    townhouse: "Maison de ville",
    room: "Chambre",
    studio: "Studio",
    office: "Bureau",
    commercial: "Commercial",
    land: "Terrain",
    hotel: "Hôtel",
    guest_house: "Maison d'hôtes",
    lodge: "Lodge",
    other: "Autre",
  },
  es: {
    apartment: "Apartamento",
    house: "Casa",
    villa: "Villa",
    townhouse: "Adosado",
    room: "Habitación",
    studio: "Estudio",
    office: "Oficina",
    commercial: "Comercial",
    land: "Terreno",
    hotel: "Hotel",
    guest_house: "Casa de huéspedes",
    lodge: "Lodge",
    other: "Otro",
  },
};

const AMENITY_LABELS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    wifi: "Wi‑Fi",
    parking: "Parking",
    pool: "Swimming Pool",
    security: "24/7 Security",
    generator: "Generator",
    air_conditioning: "Air Conditioning",
    furnished: "Furnished",
    balcony: "Balcony",
    elevator: "Elevator",
    gym: "Gym",
    garden: "Garden",
    water_tank: "Water Tank",
  },
  pt: {
    wifi: "Wi‑Fi",
    parking: "Estacionamento",
    pool: "Piscina",
    security: "Segurança 24h",
    generator: "Gerador",
    air_conditioning: "Ar condicionado",
    furnished: "Mobilado",
    balcony: "Varanda",
    elevator: "Elevador",
    gym: "Ginásio",
    garden: "Jardim",
    water_tank: "Cisterna",
  },
  fr: {
    wifi: "Wi‑Fi",
    parking: "Parking",
    pool: "Piscine",
    security: "Sécurité 24h/24",
    generator: "Générateur",
    air_conditioning: "Climatisation",
    furnished: "Meublé",
    balcony: "Balcon",
    elevator: "Ascenseur",
    gym: "Salle de sport",
    garden: "Jardin",
    water_tank: "Réservoir d'eau",
  },
  es: {
    wifi: "Wi‑Fi",
    parking: "Aparcamiento",
    pool: "Piscina",
    security: "Seguridad 24h",
    generator: "Generador",
    air_conditioning: "Aire acondicionado",
    furnished: "Amueblado",
    balcony: "Balcón",
    elevator: "Ascensor",
    gym: "Gimnasio",
    garden: "Jardín",
    water_tank: "Depósito de agua",
  },
};

function titleCaseKey(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function propertyTypeLabel(type: string, locale: SupportedLocale): string {
  return (
    PROPERTY_TYPE_LABELS[locale]?.[type] ??
    PROPERTY_TYPE_LABELS.en[type] ??
    titleCaseKey(type)
  );
}

export function amenityLabel(key: string, locale: SupportedLocale): string {
  return (
    AMENITY_LABELS[locale]?.[key] ??
    AMENITY_LABELS.en[key] ??
    titleCaseKey(key)
  );
}

export function purposeLabel(purpose: string, locale: SupportedLocale): string {
  if (purpose === "rent") return propertyT("purposeRent", locale);
  if (purpose === "stay") return propertyT("purposeStay", locale);
  if (purpose === "sale") return propertyT("purposeSale", locale);
  return purpose;
}

export function defaultEnquiryMessage(
  listingType: string,
  title: string,
  locale: SupportedLocale,
): string {
  if (listingType === "buy") {
    return propertyT("propertyEnquiryBuyTemplate", locale).replace("{title}", title);
  }
  if (listingType === "rent_monthly") {
    return propertyT("propertyEnquiryRentMonthlyTemplate", locale).replace("{title}", title);
  }
  return propertyT("propertyEnquiryRentDailyTemplate", locale).replace("{title}", title);
}

export default propertyTranslations;
