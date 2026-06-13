import type { SupportedLocale } from './translations';

export type HealthcareTranslationKey =
  | 'findDoctor'
  | 'subtitle'
  | 'searchPlaceholder'
  | 'country'
  | 'selectCountry'
  | 'searchCountry'
  | 'city'
  | 'allCities'
  | 'browseBySpecialty'
  | 'allSpecialties'
  | 'consultationType'
  | 'online'
  | 'inPerson'
  | 'verified'
  | 'reviews'
  | 'yearsExperience'
  | 'viewProfile'
  | 'bookAppointment'
  | 'location'
  | 'getDirections'
  | 'openInMaps'
  | 'clearFilters'
  | 'noDoctorsFound'
  | 'noDoctorsHint'
  | 'viewAllDoctors'
  | 'doctorsLoadFailed'
  | 'doctorsLoadFailedHint'
  | 'retry'
  | 'searching'
  | 'doctorFound'
  | 'doctorsFound'
  | 'filters'
  | 'rating'
  | 'minRating'
  | 'priceRange'
  | 'verifiedOnly'
  | 'availableToday'
  | 'languages'
  | 'experience'
  | 'about'
  | 'servicesOffered'
  | 'availability'
  | 'consultationFee'
  | 'confirmBooking'
  | 'selectDate'
  | 'availableSlots'
  | 'noSlotsForDate'
  | 'reasonForVisit'
  | 'appointmentBooked'
  | 'bookingFailed'
  | 'selectTimeSlot'
  | 'trustTitle'
  | 'trustSubtitle'
  | 'mobileFilters'
  | 'applyFilters'
  | 'close'
  | 'loading'
  | 'back'
  | 'viewDoctorProfile'
  | 'bookingSubtitle'
  | 'stepConsultation'
  | 'stepDateTime'
  | 'stepPatient'
  | 'stepConfirm'
  | 'verifiedDoctor'
  | 'inPersonVisit'
  | 'inPersonDescription'
  | 'onlineConsultation'
  | 'onlineDescription'
  | 'onlineMeetingHint'
  | 'estimatedDuration'
  | 'inPersonUnavailable'
  | 'onlineUnavailable'
  | 'today'
  | 'tomorrow'
  | 'calendarPicker'
  | 'loadingSlots'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'selectedSlot'
  | 'patientDetails'
  | 'patientFullName'
  | 'phoneNumber'
  | 'emailAddress'
  | 'age'
  | 'gender'
  | 'medicalAid'
  | 'preferredLanguage'
  | 'emergencyContact'
  | 'emergencyPhone'
  | 'selectOption'
  | 'male'
  | 'female'
  | 'other'
  | 'prefer_not_to_say'
  | 'generalCheckup'
  | 'followUp'
  | 'prescription'
  | 'feverFlu'
  | 'painDiscomfort'
  | 'testResults'
  | 'reasonOther'
  | 'reasonPlaceholder'
  | 'reasonHelper'
  | 'reasonMinLength'
  | 'paymentMethod'
  | 'pay_now'
  | 'pay_at_clinic'
  | 'wallet'
  | 'mobile_money'
  | 'card'
  | 'appointmentSummary'
  | 'doctorLabel'
  | 'dateLabel'
  | 'timeLabel'
  | 'platformFee'
  | 'total'
  | 'bookingPolicy'
  | 'policyHour'
  | 'policyBreak'
  | 'policyArrive'
  | 'policyOnlineLink'
  | 'policyCancel'
  | 'needHelp'
  | 'contactKudyaSupport'
  | 'chatSupport'
  | 'callClinic'
  | 'callDoctor'
  | 'onlineTechCheck'
  | 'liveChatTitle'
  | 'liveChatSubtitle'
  | 'liveChatDoctorContext'
  | 'liveChatWelcome'
  | 'liveChatPlaceholder'
  | 'liveChatUnavailable'
  | 'liveChatSendFailed'
  | 'loginToChatSupport'
  | 'signIn'
  | 'platformAdmin'
  | 'you'
  | 'noSlotsTitle'
  | 'noSlotsBody'
  | 'findNextSlot'
  | 'changeConsultationType'
  | 'contactSupport'
  | 'chooseAnotherDoctor'
  | 'completeRequiredFields'
  | 'noUpcomingSlots'
  | 'bookingConfirmed'
  | 'bookingConfirmedSubtitle'
  | 'viewAppointment'
  | 'addToCalendar'
  | 'messageDoctor'
  | 'meetingLinkLater'
  | 'dateOfBirth'
  | 'yearsOld'
  | 'ageAutoCalculated'
  | 'patientLabel'
  | 'guardianDetails'
  | 'guardianRequired'
  | 'guardianFullName'
  | 'guardianPhone'
  | 'guardianRelationship'
  | 'parent'
  | 'guardian'
  | 'relative';

export type HealthcareTranslations = Record<SupportedLocale, Record<HealthcareTranslationKey, string>>;

const bookingStringsEn = {
  bookingSubtitle: 'Complete your consultation booking securely',
  stepConsultation: 'Consultation',
  stepDateTime: 'Date & Time',
  stepPatient: 'Patient Details',
  stepConfirm: 'Confirm',
  verifiedDoctor: 'Verified Doctor',
  inPersonVisit: 'In-person Visit',
  inPersonDescription: 'Visit the doctor at the clinic',
  onlineConsultation: 'Online Consultation',
  onlineDescription: 'Video consultation with the doctor',
  onlineMeetingHint: 'Secure online meeting link after confirmation',
  estimatedDuration: 'Estimated duration: 1 hour',
  inPersonUnavailable: 'In-person consultation unavailable for this doctor',
  onlineUnavailable: 'Online consultation unavailable for this doctor',
  today: 'Today',
  tomorrow: 'Tomorrow',
  calendarPicker: 'Or choose from calendar',
  loadingSlots: 'Loading available time slots...',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  selectedSlot: 'Selected',
  patientDetails: 'Patient details',
  patientFullName: 'Patient full name',
  phoneNumber: 'Phone number',
  emailAddress: 'Email address',
  age: 'Age',
  gender: 'Gender',
  medicalAid: 'Medical aid / insurance',
  preferredLanguage: 'Preferred language',
  emergencyContact: 'Emergency contact name',
  emergencyPhone: 'Emergency contact phone',
  selectOption: 'Select',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
  generalCheckup: 'General check-up',
  followUp: 'Follow-up',
  prescription: 'Prescription',
  feverFlu: 'Fever / flu symptoms',
  painDiscomfort: 'Pain / discomfort',
  testResults: 'Test results review',
  reasonOther: 'Other',
  reasonPlaceholder: 'Briefly describe your symptoms or reason for this visit...',
  reasonHelper:
    'Do not include highly sensitive information unless necessary. You can discuss details directly with the doctor.',
  reasonMinLength: 'Reason must be at least 10 characters',
  paymentMethod: 'Payment method',
  pay_now: 'Pay now',
  pay_at_clinic: 'Pay at clinic',
  wallet: 'Wallet',
  mobile_money: 'Mobile money',
  card: 'Card',
  appointmentSummary: 'Appointment Summary',
  doctorLabel: 'Doctor',
  dateLabel: 'Date',
  timeLabel: 'Time',
  platformFee: 'Platform/service fee',
  total: 'Total',
  bookingPolicy: 'Booking Policy',
  policyHour: 'Appointments are 1 hour long.',
  policyBreak: 'Doctors have a 10-minute break between appointments.',
  policyArrive: 'Please arrive 10 minutes before your in-person appointment.',
  policyOnlineLink: 'For online consultations, the meeting link will be shared after confirmation.',
  policyCancel: 'You can cancel or reschedule according to the platform policy.',
  needHelp: 'Need help booking?',
  contactKudyaSupport: 'Contact Kudya support',
  chatSupport: 'Chat with support',
  callClinic: 'Call clinic',
  callDoctor: 'Call doctor',
  onlineTechCheck:
    'Make sure your internet connection, camera, and microphone are working before the consultation.',
  liveChatTitle: 'Live support chat',
  liveChatSubtitle: 'Chat in real time with a Kudya platform admin',
  liveChatDoctorContext: 'Booking with',
  liveChatWelcome: 'A platform admin will join shortly. Describe your booking question below.',
  liveChatPlaceholder: 'Type your message...',
  liveChatUnavailable: 'Live support is temporarily unavailable. Please try again.',
  liveChatSendFailed: 'Could not send your message. Please try again.',
  loginToChatSupport: 'Please sign in to chat with Kudya support.',
  signIn: 'Sign in',
  platformAdmin: 'Kudya Support',
  you: 'You',
  noSlotsTitle: 'No available slots on',
  noSlotsBody: 'has no open appointment times for this day. Please try another date or consultation type.',
  findNextSlot: 'Find next available slot',
  changeConsultationType: 'Change consultation type',
  contactSupport: 'Contact support',
  chooseAnotherDoctor: 'Choose another doctor',
  completeRequiredFields: 'Please complete all required fields before confirming.',
  noUpcomingSlots: 'No upcoming slots found. Try another doctor or contact support.',
  bookingConfirmed: 'Booking Confirmed',
  bookingConfirmedSubtitle: 'Your appointment with',
  viewAppointment: 'View appointment',
  addToCalendar: 'Add to calendar',
  messageDoctor: 'Message doctor/clinic',
  meetingLinkLater: 'Meeting link will be available before the appointment.',
  dateOfBirth: 'Date of birth',
  yearsOld: 'years old',
  ageAutoCalculated: 'Age will be calculated automatically',
  patientLabel: 'Patient',
  guardianDetails: 'Parent / guardian details',
  guardianRequired: 'Guardian information is required for patients under 18.',
  guardianFullName: 'Parent/guardian full name',
  guardianPhone: 'Parent/guardian phone number',
  guardianRelationship: 'Relationship to patient',
  parent: 'Parent',
  guardian: 'Guardian',
  relative: 'Relative',
} as const satisfies Record<string, string>;

const healthcareTranslations: HealthcareTranslations = {
  en: {
    findDoctor: 'Find a Doctor',
    subtitle: 'Book trusted healthcare professionals near you',
    searchPlaceholder: 'Search by name, clinic, city, or specialty...',
    country: 'Country',
    selectCountry: 'Select country',
    searchCountry: 'Search country...',
    city: 'City',
    allCities: 'All cities',
    browseBySpecialty: 'Browse by specialty',
    allSpecialties: 'All specialties',
    consultationType: 'Consultation type',
    online: 'Online',
    inPerson: 'In person',
    verified: 'Verified',
    reviews: 'reviews',
    yearsExperience: 'years experience',
    viewProfile: 'View Profile',
    bookAppointment: 'Book Appointment',
    location: 'Location',
    getDirections: 'Get Directions',
    openInMaps: 'Open in Google Maps',
    clearFilters: 'Clear filters',
    noDoctorsFound: 'No doctors found',
    noDoctorsHint: 'Try changing the country, specialty, or consultation type.',
    viewAllDoctors: 'View all doctors',
    doctorsLoadFailed: 'Unable to load doctors',
    doctorsLoadFailedHint: 'Please check your connection and try again.',
    retry: 'Retry',
    searching: 'Searching...',
    doctorFound: 'doctor found',
    doctorsFound: 'doctors found',
    filters: 'Filters',
    rating: 'Rating',
    minRating: 'Minimum rating',
    priceRange: 'Price range',
    verifiedOnly: 'Verified only',
    availableToday: 'Available today',
    languages: 'Languages spoken',
    experience: 'Experience',
    about: 'About',
    servicesOffered: 'Services offered',
    availability: 'Availability',
    consultationFee: 'Consultation fee',
    confirmBooking: 'Confirm Booking',
    selectDate: 'Select date',
    availableSlots: 'Available time slots',
    noSlotsForDate: 'No slots available for this date.',
    reasonForVisit: 'Reason for visit',
    appointmentBooked: 'Appointment requested successfully',
    bookingFailed: 'Could not book appointment. Please check your details and try again.',
    selectTimeSlot: 'Please select an available time slot',
    trustTitle: 'Trusted healthcare on Kudya',
    trustSubtitle: 'Verified doctors, secure booking, and transparent consultation fees.',
    mobileFilters: 'Filters',
    applyFilters: 'Apply filters',
    close: 'Close',
    loading: 'Loading...',
    back: 'Back',
    viewDoctorProfile: 'View doctor profile',
    ...bookingStringsEn,
  },
  pt: {
    findDoctor: 'Encontrar Médico',
    subtitle: 'Marque consultas com profissionais de saúde de confiança',
    searchPlaceholder: 'Pesquisar por nome, clínica, cidade ou especialidade...',
    country: 'País',
    selectCountry: 'Selecionar país',
    searchCountry: 'Pesquisar país...',
    city: 'Cidade',
    allCities: 'Todas as cidades',
    browseBySpecialty: 'Explorar por especialidade',
    allSpecialties: 'Todas as especialidades',
    consultationType: 'Tipo de consulta',
    online: 'Online',
    inPerson: 'Presencial',
    verified: 'Verificado',
    reviews: 'avaliações',
    yearsExperience: 'anos de experiência',
    viewProfile: 'Ver Perfil',
    bookAppointment: 'Marcar Consulta',
    location: 'Localização',
    getDirections: 'Obter direções',
    openInMaps: 'Abrir no Google Maps',
    clearFilters: 'Limpar filtros',
    noDoctorsFound: 'Nenhum médico encontrado',
    noDoctorsHint: 'Tente alterar o país, especialidade ou tipo de consulta.',
    viewAllDoctors: 'Ver todos os médicos',
    doctorsLoadFailed: 'Não foi possível carregar médicos',
    doctorsLoadFailedHint: 'Verifique a sua ligação e tente novamente.',
    retry: 'Tentar novamente',
    searching: 'A pesquisar...',
    doctorFound: 'médico encontrado',
    doctorsFound: 'médicos encontrados',
    filters: 'Filtros',
    rating: 'Avaliação',
    minRating: 'Avaliação mínima',
    priceRange: 'Intervalo de preço',
    verifiedOnly: 'Apenas verificados',
    availableToday: 'Disponível hoje',
    languages: 'Idiomas falados',
    experience: 'Experiência',
    about: 'Sobre',
    servicesOffered: 'Serviços oferecidos',
    availability: 'Disponibilidade',
    consultationFee: 'Taxa de consulta',
    confirmBooking: 'Confirmar Reserva',
    selectDate: 'Selecionar data',
    availableSlots: 'Horários disponíveis',
    noSlotsForDate: 'Sem horários disponíveis para esta data.',
    reasonForVisit: 'Motivo da consulta',
    appointmentBooked: 'Consulta solicitada com sucesso',
    bookingFailed: 'Não foi possível marcar a consulta. Verifique os seus dados e tente novamente.',
    selectTimeSlot: 'Selecione um horário disponível',
    trustTitle: 'Saúde de confiança na Kudya',
    trustSubtitle: 'Médicos verificados, reservas seguras e taxas transparentes.',
    mobileFilters: 'Filtros',
    applyFilters: 'Aplicar filtros',
    close: 'Fechar',
    loading: 'A carregar...',
    back: 'Voltar',
    viewDoctorProfile: 'Ver perfil do médico',
    bookingSubtitle: 'Conclua a sua marcação de consulta com segurança',
    stepConsultation: 'Consulta',
    stepDateTime: 'Data e hora',
    stepPatient: 'Dados do paciente',
    stepConfirm: 'Confirmar',
    verifiedDoctor: 'Médico verificado',
    inPersonVisit: 'Consulta presencial',
    inPersonDescription: 'Visite o médico na clínica',
    onlineConsultation: 'Consulta online',
    onlineDescription: 'Consulta por vídeo com o médico',
    onlineMeetingHint: 'Link seguro da reunião após confirmação',
    estimatedDuration: 'Duração estimada: 1 hora',
    inPersonUnavailable: 'Consulta presencial indisponível para este médico',
    onlineUnavailable: 'Consulta online indisponível para este médico',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    calendarPicker: 'Ou escolha no calendário',
    loadingSlots: 'A carregar horários disponíveis...',
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
    selectedSlot: 'Selecionado',
    patientDetails: 'Dados do paciente',
    patientFullName: 'Nome completo do paciente',
    phoneNumber: 'Telefone',
    emailAddress: 'Email',
    age: 'Idade',
    gender: 'Género',
    medicalAid: 'Seguro / subsídio de saúde',
    preferredLanguage: 'Idioma preferido',
    emergencyContact: 'Contacto de emergência',
    emergencyPhone: 'Telefone de emergência',
    selectOption: 'Selecionar',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    prefer_not_to_say: 'Prefiro não dizer',
    generalCheckup: 'Check-up geral',
    followUp: 'Seguimento',
    prescription: 'Prescrição',
    feverFlu: 'Febre / gripe',
    painDiscomfort: 'Dor / desconforto',
    testResults: 'Revisão de resultados',
    reasonOther: 'Outro',
    reasonPlaceholder: 'Descreva brevemente os sintomas ou motivo da consulta...',
    reasonHelper:
      'Não inclua informação altamente sensível, a menos que seja necessário. Pode discutir os detalhes diretamente com o médico.',
    reasonMinLength: 'O motivo deve ter pelo menos 10 caracteres',
    paymentMethod: 'Método de pagamento',
    pay_now: 'Pagar agora',
    pay_at_clinic: 'Pagar na clínica',
    wallet: 'Carteira',
    mobile_money: 'Dinheiro móvel',
    card: 'Cartão',
    appointmentSummary: 'Resumo da consulta',
    doctorLabel: 'Médico',
    dateLabel: 'Data',
    timeLabel: 'Hora',
    platformFee: 'Taxa da plataforma',
    total: 'Total',
    bookingPolicy: 'Política de marcação',
    policyHour: 'As consultas têm a duração de 1 hora.',
    policyBreak: 'Os médicos têm 10 minutos de intervalo entre consultas.',
    policyArrive: 'Chegue 10 minutos antes da consulta presencial.',
    policyOnlineLink: 'Para consultas online, o link será partilhado após confirmação.',
    policyCancel: 'Pode cancelar ou reagendar de acordo com a política da plataforma.',
    needHelp: 'Precisa de ajuda?',
    contactKudyaSupport: 'Contacte o suporte Kudya',
    chatSupport: 'Chat com suporte',
    callClinic: 'Ligar à clínica',
    callDoctor: 'Ligar ao médico',
    onlineTechCheck: 'Verifique internet, câmara e microfone antes da consulta online.',
    liveChatTitle: 'Chat de suporte ao vivo',
    liveChatSubtitle: 'Converse em tempo real com um administrador da Kudya',
    liveChatDoctorContext: 'Marcação com',
    liveChatWelcome: 'Um administrador da plataforma irá responder em breve. Descreva a sua questão abaixo.',
    liveChatPlaceholder: 'Escreva a sua mensagem...',
    liveChatUnavailable: 'O suporte ao vivo está temporariamente indisponível.',
    liveChatSendFailed: 'Não foi possível enviar a mensagem. Tente novamente.',
    loginToChatSupport: 'Inicie sessão para conversar com o suporte Kudya.',
    signIn: 'Iniciar sessão',
    platformAdmin: 'Suporte Kudya',
    you: 'Você',
    noSlotsTitle: 'Sem horários disponíveis em',
    noSlotsBody: 'não tem horários livres neste dia. Tente outra data ou tipo de consulta.',
    findNextSlot: 'Próximo horário disponível',
    changeConsultationType: 'Alterar tipo de consulta',
    contactSupport: 'Contactar suporte',
    chooseAnotherDoctor: 'Escolher outro médico',
    completeRequiredFields: 'Preencha todos os campos obrigatórios antes de confirmar.',
    noUpcomingSlots: 'Sem horários futuros. Tente outro médico ou contacte o suporte.',
    bookingConfirmed: 'Marcação confirmada',
    bookingConfirmedSubtitle: 'A sua consulta com',
    viewAppointment: 'Ver consulta',
    addToCalendar: 'Adicionar ao calendário',
    messageDoctor: 'Mensagem ao médico/clínica',
    meetingLinkLater: 'O link da reunião estará disponível antes da consulta.',
    dateOfBirth: 'Data de nascimento',
    yearsOld: 'anos',
    ageAutoCalculated: 'A idade será calculada automaticamente',
    patientLabel: 'Paciente',
    guardianDetails: 'Dados do encarregado de educação',
    guardianRequired: 'Informação do encarregado é obrigatória para menores de 18 anos.',
    guardianFullName: 'Nome completo do encarregado',
    guardianPhone: 'Telefone do encarregado',
    guardianRelationship: 'Relação com o paciente',
    parent: 'Pai/Mãe',
    guardian: 'Encarregado',
    relative: 'Familiar',
  },
  fr: {
    findDoctor: 'Trouver un médecin',
    subtitle: 'Réservez des professionnels de santé de confiance près de chez vous',
    searchPlaceholder: 'Rechercher par nom, clinique, ville ou spécialité...',
    country: 'Pays',
    selectCountry: 'Sélectionner un pays',
    searchCountry: 'Rechercher un pays...',
    city: 'Ville',
    allCities: 'Toutes les villes',
    browseBySpecialty: 'Parcourir par spécialité',
    allSpecialties: 'Toutes les spécialités',
    consultationType: 'Type de consultation',
    online: 'En ligne',
    inPerson: 'En personne',
    verified: 'Vérifié',
    reviews: 'avis',
    yearsExperience: "années d'expérience",
    viewProfile: 'Voir le profil',
    bookAppointment: 'Prendre rendez-vous',
    location: 'Localisation',
    getDirections: "Obtenir l'itinéraire",
    openInMaps: 'Ouvrir dans Google Maps',
    clearFilters: 'Effacer les filtres',
    noDoctorsFound: 'Aucun médecin trouvé',
    noDoctorsHint: 'Essayez de changer le pays, la spécialité ou le type de consultation.',
    viewAllDoctors: 'Voir tous les médecins',
    doctorsLoadFailed: 'Impossible de charger les médecins',
    doctorsLoadFailedHint: 'Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
    searching: 'Recherche...',
    doctorFound: 'médecin trouvé',
    doctorsFound: 'médecins trouvés',
    filters: 'Filtres',
    rating: 'Note',
    minRating: 'Note minimale',
    priceRange: 'Fourchette de prix',
    verifiedOnly: 'Vérifiés uniquement',
    availableToday: "Disponible aujourd'hui",
    languages: 'Langues parlées',
    experience: 'Expérience',
    about: 'À propos',
    servicesOffered: 'Services proposés',
    availability: 'Disponibilité',
    consultationFee: 'Frais de consultation',
    confirmBooking: 'Confirmer la réservation',
    selectDate: 'Sélectionner la date',
    availableSlots: 'Créneaux disponibles',
    noSlotsForDate: 'Aucun créneau disponible pour cette date.',
    reasonForVisit: 'Motif de la visite',
    appointmentBooked: 'Rendez-vous demandé avec succès',
    bookingFailed: 'Impossible de réserver. Vérifiez vos informations et réessayez.',
    selectTimeSlot: 'Veuillez sélectionner un créneau disponible',
    trustTitle: 'Santé de confiance sur Kudya',
    trustSubtitle: 'Médecins vérifiés, réservations sécurisées et tarifs transparents.',
    mobileFilters: 'Filtres',
    applyFilters: 'Appliquer les filtres',
    close: 'Fermer',
    loading: 'Chargement...',
    back: 'Retour',
    viewDoctorProfile: 'Voir le profil du médecin',
    bookingSubtitle: 'Finalisez votre réservation en toute sécurité',
    stepConsultation: 'Consultation',
    stepDateTime: 'Date et heure',
    stepPatient: 'Détails du patient',
    stepConfirm: 'Confirmer',
    verifiedDoctor: 'Médecin vérifié',
    inPersonVisit: 'Consultation en personne',
    inPersonDescription: 'Rendez-vous à la clinique',
    onlineConsultation: 'Consultation en ligne',
    onlineDescription: 'Consultation vidéo avec le médecin',
    onlineMeetingHint: 'Lien de réunion sécurisé après confirmation',
    estimatedDuration: 'Durée estimée : 1 heure',
    inPersonUnavailable: 'Consultation en personne indisponible',
    onlineUnavailable: 'Consultation en ligne indisponible',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    calendarPicker: 'Ou choisir dans le calendrier',
    loadingSlots: 'Chargement des créneaux...',
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    selectedSlot: 'Sélectionné',
    patientDetails: 'Détails du patient',
    patientFullName: 'Nom complet du patient',
    phoneNumber: 'Téléphone',
    emailAddress: 'E-mail',
    age: 'Âge',
    gender: 'Genre',
    medicalAid: 'Assurance / mutuelle',
    preferredLanguage: 'Langue préférée',
    emergencyContact: "Contact d'urgence",
    emergencyPhone: "Téléphone d'urgence",
    selectOption: 'Sélectionner',
    male: 'Homme',
    female: 'Femme',
    other: 'Autre',
    prefer_not_to_say: 'Je préfère ne pas dire',
    generalCheckup: 'Bilan général',
    followUp: 'Suivi',
    prescription: 'Ordonnance',
    feverFlu: 'Fièvre / grippe',
    painDiscomfort: 'Douleur / inconfort',
    testResults: 'Revue des résultats',
    reasonOther: 'Autre',
    reasonPlaceholder: 'Décrivez brièvement vos symptômes ou motif de visite...',
    reasonHelper:
      "N'incluez pas d'informations très sensibles sauf si nécessaire. Vous pourrez en discuter avec le médecin.",
    reasonMinLength: 'Le motif doit contenir au moins 10 caractères',
    paymentMethod: 'Mode de paiement',
    pay_now: 'Payer maintenant',
    pay_at_clinic: 'Payer à la clinique',
    wallet: 'Portefeuille',
    mobile_money: 'Mobile money',
    card: 'Carte',
    appointmentSummary: 'Résumé du rendez-vous',
    doctorLabel: 'Médecin',
    dateLabel: 'Date',
    timeLabel: 'Heure',
    platformFee: 'Frais de plateforme',
    total: 'Total',
    bookingPolicy: 'Politique de réservation',
    policyHour: 'Les rendez-vous durent 1 heure.',
    policyBreak: 'Les médecins ont 10 minutes entre chaque patient.',
    policyArrive: 'Arrivez 10 minutes avant un rendez-vous en personne.',
    policyOnlineLink: 'Pour les consultations en ligne, le lien sera partagé après confirmation.',
    policyCancel: 'Annulation ou report selon la politique de la plateforme.',
    needHelp: "Besoin d'aide ?",
    contactKudyaSupport: 'Contacter le support Kudya',
    chatSupport: 'Chat support',
    callClinic: 'Appeler la clinique',
    callDoctor: 'Appeler le médecin',
    onlineTechCheck: 'Vérifiez internet, caméra et micro avant la consultation en ligne.',
    liveChatTitle: 'Chat support en direct',
    liveChatSubtitle: 'Discutez en temps réel avec un administrateur Kudya',
    liveChatDoctorContext: 'Réservation avec',
    liveChatWelcome: 'Un administrateur rejoindra bientôt. Décrivez votre question ci-dessous.',
    liveChatPlaceholder: 'Tapez votre message...',
    liveChatUnavailable: 'Le support en direct est temporairement indisponible.',
    liveChatSendFailed: "Impossible d'envoyer le message. Réessayez.",
    loginToChatSupport: 'Connectez-vous pour discuter avec le support Kudya.',
    signIn: 'Se connecter',
    platformAdmin: 'Support Kudya',
    you: 'Vous',
    noSlotsTitle: 'Aucun créneau disponible le',
    noSlotsBody: "n'a pas de créneaux libres ce jour. Essayez une autre date ou un autre type.",
    findNextSlot: 'Prochain créneau disponible',
    changeConsultationType: 'Changer le type de consultation',
    contactSupport: 'Contacter le support',
    chooseAnotherDoctor: 'Choisir un autre médecin',
    completeRequiredFields: 'Complétez tous les champs requis avant de confirmer.',
    noUpcomingSlots: 'Aucun créneau à venir. Essayez un autre médecin ou contactez le support.',
    bookingConfirmed: 'Réservation confirmée',
    bookingConfirmedSubtitle: 'Votre rendez-vous avec',
    viewAppointment: 'Voir le rendez-vous',
    addToCalendar: 'Ajouter au calendrier',
    messageDoctor: 'Message au médecin/clinique',
    meetingLinkLater: 'Le lien de réunion sera disponible avant le rendez-vous.',
    dateOfBirth: 'Date de naissance',
    yearsOld: 'ans',
    ageAutoCalculated: "L'âge sera calculé automatiquement",
    patientLabel: 'Patient',
    guardianDetails: 'Informations du parent/tuteur',
    guardianRequired: 'Les informations du tuteur sont requises pour les moins de 18 ans.',
    guardianFullName: 'Nom complet du parent/tuteur',
    guardianPhone: 'Téléphone du parent/tuteur',
    guardianRelationship: 'Lien avec le patient',
    parent: 'Parent',
    guardian: 'Tuteur',
    relative: 'Proche',
  },
  es: {
    findDoctor: 'Encontrar médico',
    subtitle: 'Reserve profesionales de salud de confianza cerca de usted',
    searchPlaceholder: 'Buscar por nombre, clínica, ciudad o especialidad...',
    country: 'País',
    selectCountry: 'Seleccionar país',
    searchCountry: 'Buscar país...',
    city: 'Ciudad',
    allCities: 'Todas las ciudades',
    browseBySpecialty: 'Explorar por especialidad',
    allSpecialties: 'Todas las especialidades',
    consultationType: 'Tipo de consulta',
    online: 'En línea',
    inPerson: 'Presencial',
    verified: 'Verificado',
    reviews: 'reseñas',
    yearsExperience: 'años de experiencia',
    viewProfile: 'Ver perfil',
    bookAppointment: 'Reservar cita',
    location: 'Ubicación',
    getDirections: 'Obtener direcciones',
    openInMaps: 'Abrir en Google Maps',
    clearFilters: 'Borrar filtros',
    noDoctorsFound: 'No se encontraron médicos',
    noDoctorsHint: 'Intente cambiar el país, especialidad o tipo de consulta.',
    viewAllDoctors: 'Ver todos los médicos',
    doctorsLoadFailed: 'No se pudieron cargar los médicos',
    doctorsLoadFailedHint: 'Compruebe su conexión e inténtelo de nuevo.',
    retry: 'Reintentar',
    searching: 'Buscando...',
    doctorFound: 'médico encontrado',
    doctorsFound: 'médicos encontrados',
    filters: 'Filtros',
    rating: 'Calificación',
    minRating: 'Calificación mínima',
    priceRange: 'Rango de precio',
    verifiedOnly: 'Solo verificados',
    availableToday: 'Disponible hoy',
    languages: 'Idiomas hablados',
    experience: 'Experiencia',
    about: 'Acerca de',
    servicesOffered: 'Servicios ofrecidos',
    availability: 'Disponibilidad',
    consultationFee: 'Tarifa de consulta',
    confirmBooking: 'Confirmar reserva',
    selectDate: 'Seleccionar fecha',
    availableSlots: 'Horarios disponibles',
    noSlotsForDate: 'No hay horarios disponibles para esta fecha.',
    reasonForVisit: 'Motivo de la visita',
    appointmentBooked: 'Cita solicitada con éxito',
    bookingFailed: 'No se pudo reservar. Revise sus datos e inténtelo de nuevo.',
    selectTimeSlot: 'Seleccione un horario disponible',
    trustTitle: 'Salud de confianza en Kudya',
    trustSubtitle: 'Médicos verificados, reservas seguras y tarifas transparentes.',
    mobileFilters: 'Filtros',
    applyFilters: 'Aplicar filtros',
    close: 'Cerrar',
    loading: 'Cargando...',
    back: 'Volver',
    viewDoctorProfile: 'Ver perfil del médico',
    bookingSubtitle: 'Complete su reserva de consulta de forma segura',
    stepConsultation: 'Consulta',
    stepDateTime: 'Fecha y hora',
    stepPatient: 'Datos del paciente',
    stepConfirm: 'Confirmar',
    verifiedDoctor: 'Médico verificado',
    inPersonVisit: 'Consulta presencial',
    inPersonDescription: 'Visite al médico en la clínica',
    onlineConsultation: 'Consulta en línea',
    onlineDescription: 'Consulta por video con el médico',
    onlineMeetingHint: 'Enlace seguro de reunión tras la confirmación',
    estimatedDuration: 'Duración estimada: 1 hora',
    inPersonUnavailable: 'Consulta presencial no disponible',
    onlineUnavailable: 'Consulta en línea no disponible',
    today: 'Hoy',
    tomorrow: 'Mañana',
    calendarPicker: 'O elegir en el calendario',
    loadingSlots: 'Cargando horarios disponibles...',
    morning: 'Mañana',
    afternoon: 'Tarde',
    evening: 'Noche',
    selectedSlot: 'Seleccionado',
    patientDetails: 'Datos del paciente',
    patientFullName: 'Nombre completo del paciente',
    phoneNumber: 'Teléfono',
    emailAddress: 'Correo electrónico',
    age: 'Edad',
    gender: 'Género',
    medicalAid: 'Seguro médico',
    preferredLanguage: 'Idioma preferido',
    emergencyContact: 'Contacto de emergencia',
    emergencyPhone: 'Teléfono de emergencia',
    selectOption: 'Seleccionar',
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    prefer_not_to_say: 'Prefiero no decir',
    generalCheckup: 'Chequeo general',
    followUp: 'Seguimiento',
    prescription: 'Receta',
    feverFlu: 'Fiebre / gripe',
    painDiscomfort: 'Dolor / malestar',
    testResults: 'Revisión de resultados',
    reasonOther: 'Otro',
    reasonPlaceholder: 'Describa brevemente sus síntomas o motivo de la visita...',
    reasonHelper:
      'No incluya información muy sensible a menos que sea necesario. Puede discutir los detalles con el médico.',
    reasonMinLength: 'El motivo debe tener al menos 10 caracteres',
    paymentMethod: 'Método de pago',
    pay_now: 'Pagar ahora',
    pay_at_clinic: 'Pagar en la clínica',
    wallet: 'Billetera',
    mobile_money: 'Dinero móvil',
    card: 'Tarjeta',
    appointmentSummary: 'Resumen de la cita',
    doctorLabel: 'Médico',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    platformFee: 'Tarifa de plataforma',
    total: 'Total',
    bookingPolicy: 'Política de reserva',
    policyHour: 'Las citas duran 1 hora.',
    policyBreak: 'Los médicos tienen 10 minutos entre pacientes.',
    policyArrive: 'Llegue 10 minutos antes de una cita presencial.',
    policyOnlineLink: 'Para consultas en línea, el enlace se compartirá tras la confirmación.',
    policyCancel: 'Puede cancelar o reprogramar según la política de la plataforma.',
    needHelp: '¿Necesita ayuda?',
    contactKudyaSupport: 'Contactar soporte Kudya',
    chatSupport: 'Chat con soporte',
    callClinic: 'Llamar a la clínica',
    callDoctor: 'Llamar al médico',
    onlineTechCheck: 'Verifique internet, cámara y micrófono antes de la consulta en línea.',
    liveChatTitle: 'Chat de soporte en vivo',
    liveChatSubtitle: 'Chatea en tiempo real con un administrador de Kudya',
    liveChatDoctorContext: 'Reserva con',
    liveChatWelcome: 'Un administrador se unirá pronto. Describa su consulta abajo.',
    liveChatPlaceholder: 'Escriba su mensaje...',
    liveChatUnavailable: 'El soporte en vivo no está disponible temporalmente.',
    liveChatSendFailed: 'No se pudo enviar el mensaje. Inténtelo de nuevo.',
    loginToChatSupport: 'Inicie sesión para chatear con el soporte Kudya.',
    signIn: 'Iniciar sesión',
    platformAdmin: 'Soporte Kudya',
    you: 'Usted',
    noSlotsTitle: 'Sin horarios disponibles el',
    noSlotsBody: 'no tiene horarios libres este día. Pruebe otra fecha o tipo de consulta.',
    findNextSlot: 'Próximo horario disponible',
    changeConsultationType: 'Cambiar tipo de consulta',
    contactSupport: 'Contactar soporte',
    chooseAnotherDoctor: 'Elegir otro médico',
    completeRequiredFields: 'Complete todos los campos requeridos antes de confirmar.',
    noUpcomingSlots: 'No hay horarios próximos. Pruebe otro médico o contacte soporte.',
    bookingConfirmed: 'Reserva confirmada',
    bookingConfirmedSubtitle: 'Su cita con',
    viewAppointment: 'Ver cita',
    addToCalendar: 'Añadir al calendario',
    messageDoctor: 'Mensaje al médico/clínica',
    meetingLinkLater: 'El enlace de reunión estará disponible antes de la cita.',
    dateOfBirth: 'Fecha de nacimiento',
    yearsOld: 'años',
    ageAutoCalculated: 'La edad se calculará automáticamente',
    patientLabel: 'Paciente',
    guardianDetails: 'Datos del padre/tutor',
    guardianRequired: 'Se requiere información del tutor para menores de 18 años.',
    guardianFullName: 'Nombre completo del padre/tutor',
    guardianPhone: 'Teléfono del padre/tutor',
    guardianRelationship: 'Relación con el paciente',
    parent: 'Padre/Madre',
    guardian: 'Tutor',
    relative: 'Familiar',
  },
};

export default healthcareTranslations;

export function healthcareT(key: HealthcareTranslationKey, locale: SupportedLocale): string {
  return healthcareTranslations[locale]?.[key] ?? healthcareTranslations.en[key] ?? key;
}
