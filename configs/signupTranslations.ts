import type { SupportedLocale } from './translations';

export const signupTranslationKeys = [
  'signupHeroTitle',
  'signupHeroSubtitle',
  'signupHeroSubtitleShort',
  'signupHighlight1',
  'signupHighlight2',
  'signupHighlight3',
  'signupTrustLine',
  'signupCustomerHint',
  'signupPartnerHint',
  'orRegisterWithEmail',
  'passwordHint',
  'passwordWeak',
  'passwordFair',
  'passwordGood',
  'passwordStrong',
  'showPassword',
  'hidePassword',
  'businessInfo',
  'businessCategory',
  'chooseImage',
  'chooseLicenseFile',
  'backToHome',
  'notAuthorized',
  'notFound',
  'loginHeroTitle',
  'loginHeroSubtitle',
  'loginHeroSubtitleShort',
  'loginTrustLine',
  'orContinueWithEmail',
  'signingIn',
  'devSignIn',
  'mfaLoginSetupTitle',
  'mfaLoginSetupHint',
] as const;

export type SignupTranslationKey = (typeof signupTranslationKeys)[number];

type SignupTable = Record<SignupTranslationKey, string>;

const en: SignupTable = {
  signupHeroTitle: 'Create your Kudya account',
  signupHeroSubtitle:
    'One account for deliveries, rides, stays and local services — or to run your business on Kudya.',
  signupHeroSubtitleShort:
    'Food, rides, stays and local services — or grow your business with Kudya.',
  signupHighlight1: 'Order food, groceries and pharmacy essentials',
  signupHighlight2: 'Book rides, stays and home services in one place',
  signupHighlight3: 'Grow with Kudya as a restaurant, shop or service partner',
  signupTrustLine: 'Secure signup. You stay in control of your data.',
  signupCustomerHint: 'Order, book and track',
  signupPartnerHint: 'Sell, host or deliver',
  orRegisterWithEmail: 'or register with email',
  passwordHint: 'Use at least 8 characters.',
  passwordWeak: 'Weak',
  passwordFair: 'Fair',
  passwordGood: 'Good',
  passwordStrong: 'Strong',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  businessInfo: 'Business details',
  businessCategory: 'Business category',
  chooseImage: 'Choose an image',
  chooseLicenseFile: 'Choose a file',
  backToHome: 'Back to home',
  notAuthorized: 'Not authorized.',
  notFound: 'Not found.',
  loginHeroTitle: 'Welcome back',
  loginHeroSubtitle:
    'Sign in to continue ordering, tracking deliveries and managing your Kudya account.',
  loginHeroSubtitleShort: 'Sign in to order, track and manage your Kudya account.',
  loginTrustLine: 'Secure login. You stay in control of your data.',
  orContinueWithEmail: 'or sign in with email',
  signingIn: 'Signing in...',
  devSignIn: 'Developer sign-in',
  mfaLoginSetupTitle: 'Set up an authenticator app',
  mfaLoginSetupHint:
    'This account needs an authenticator app. Scan the code (or enter the key) in Google Authenticator, Microsoft Authenticator or similar, then type the 6-digit code below.',
};

const pt: SignupTable = {
  ...en,
  signupHeroTitle: 'Crie a sua conta Kudya',
  signupHeroSubtitle:
    'Uma conta para entregas, boleias, estadias e serviços locais — ou para gerir o seu negócio na Kudya.',
  signupHeroSubtitleShort:
    'Comida, boleias, estadias e serviços locais — ou faça crescer o seu negócio com a Kudya.',
  signupHighlight1: 'Encomende comida, mercearia e farmácia',
  signupHighlight2: 'Reserve boleias, estadias e serviços em um só lugar',
  signupHighlight3: 'Cresça com a Kudya como restaurante, loja ou parceiro de serviços',
  signupTrustLine: 'Registo seguro. Os seus dados ficam sob o seu controlo.',
  signupCustomerHint: 'Encomendar, reservar e seguir',
  signupPartnerHint: 'Vender, acolher ou entregar',
  orRegisterWithEmail: 'ou registe-se com o email',
  passwordHint: 'Use pelo menos 8 caracteres.',
  passwordWeak: 'Fraca',
  passwordFair: 'Razoável',
  passwordGood: 'Boa',
  passwordStrong: 'Forte',
  showPassword: 'Mostrar senha',
  hidePassword: 'Ocultar senha',
  businessInfo: 'Dados do negócio',
  businessCategory: 'Categoria do negócio',
  chooseImage: 'Escolher uma imagem',
  chooseLicenseFile: 'Escolher um ficheiro',
  backToHome: 'Voltar ao início',
  notAuthorized: 'Não autorizado.',
  notFound: 'Não encontrado.',
  loginHeroTitle: 'Bem-vindo de volta',
  loginHeroSubtitle:
    'Entre para continuar a encomendar, seguir entregas e gerir a sua conta Kudya.',
  loginHeroSubtitleShort: 'Entre para encomendar, seguir e gerir a sua conta Kudya.',
  loginTrustLine: 'Início de sessão seguro. Os seus dados ficam sob o seu controlo.',
  orContinueWithEmail: 'ou entre com o email',
  signingIn: 'A entrar...',
  devSignIn: 'Início de sessão de programador',
  mfaLoginSetupTitle: 'Configure uma aplicação de autenticação',
  mfaLoginSetupHint:
    'Esta conta precisa de uma aplicação de autenticação. Leia o código (ou introduza a chave) no Google Authenticator, Microsoft Authenticator ou semelhante e escreva abaixo o código de 6 dígitos.',
};

const fr: SignupTable = {
  ...en,
  signupHeroTitle: 'Créez votre compte Kudya',
  signupHeroSubtitle:
    'Un compte pour les livraisons, courses, séjours et services locaux — ou pour gérer votre activité sur Kudya.',
  signupHeroSubtitleShort:
    'Repas, courses, séjours et services locaux — ou développez votre activité avec Kudya.',
  signupHighlight1: 'Commandez repas, courses et pharmacie',
  signupHighlight2: 'Réservez courses, séjours et services au même endroit',
  signupHighlight3: 'Développez-vous avec Kudya comme restaurant, magasin ou partenaire',
  signupTrustLine: 'Inscription sécurisée. Vous restez maître de vos données.',
  signupCustomerHint: 'Commander, réserver et suivre',
  signupPartnerHint: 'Vendre, héberger ou livrer',
  orRegisterWithEmail: 'ou inscrivez-vous par e-mail',
  passwordHint: 'Utilisez au moins 8 caractères.',
  passwordWeak: 'Faible',
  passwordFair: 'Correcte',
  passwordGood: 'Bonne',
  passwordStrong: 'Forte',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  businessInfo: 'Informations professionnelles',
  businessCategory: "Catégorie d'activité",
  chooseImage: 'Choisir une image',
  chooseLicenseFile: 'Choisir un fichier',
  backToHome: "Retour à l'accueil",
  notAuthorized: 'Non autorisé.',
  notFound: 'Introuvable.',
  loginHeroTitle: 'Bon retour',
  loginHeroSubtitle:
    'Connectez-vous pour continuer à commander, suivre vos livraisons et gérer votre compte Kudya.',
  loginHeroSubtitleShort: 'Connectez-vous pour commander, suivre et gérer votre compte Kudya.',
  loginTrustLine: 'Connexion sécurisée. Vous restez maître de vos données.',
  orContinueWithEmail: 'ou connectez-vous par e-mail',
  signingIn: 'Connexion...',
  devSignIn: 'Connexion développeur',
  mfaLoginSetupTitle: "Configurez une application d'authentification",
  mfaLoginSetupHint:
    "Ce compte nécessite une application d'authentification. Scannez le code (ou saisissez la clé) dans Google Authenticator, Microsoft Authenticator ou une application similaire, puis saisissez le code à 6 chiffres ci-dessous.",
};

const es: SignupTable = {
  ...en,
  signupHeroTitle: 'Crea tu cuenta Kudya',
  signupHeroSubtitle:
    'Una cuenta para entregas, viajes, estancias y servicios locales — o para gestionar tu negocio en Kudya.',
  signupHeroSubtitleShort:
    'Comida, viajes, estancias y servicios locales — o haz crecer tu negocio con Kudya.',
  signupHighlight1: 'Pide comida, supermercado y farmacia',
  signupHighlight2: 'Reserva viajes, estancias y servicios en un solo lugar',
  signupHighlight3: 'Crece con Kudya como restaurante, tienda o socio de servicios',
  signupTrustLine: 'Registro seguro. Tú controlas tus datos.',
  signupCustomerHint: 'Pedir, reservar y seguir',
  signupPartnerHint: 'Vender, hospedar o entregar',
  orRegisterWithEmail: 'o regístrate con el correo',
  passwordHint: 'Usa al menos 8 caracteres.',
  passwordWeak: 'Débil',
  passwordFair: 'Aceptable',
  passwordGood: 'Buena',
  passwordStrong: 'Fuerte',
  showPassword: 'Mostrar contraseña',
  hidePassword: 'Ocultar contraseña',
  businessInfo: 'Datos del negocio',
  businessCategory: 'Categoría del negocio',
  chooseImage: 'Elige una imagen',
  chooseLicenseFile: 'Elige un archivo',
  backToHome: 'Volver al inicio',
  notAuthorized: 'No autorizado.',
  notFound: 'No encontrado.',
  loginHeroTitle: 'Bienvenido de nuevo',
  loginHeroSubtitle:
    'Inicia sesión para seguir pidiendo, rastreando entregas y gestionando tu cuenta Kudya.',
  loginHeroSubtitleShort: 'Inicia sesión para pedir, rastrear y gestionar tu cuenta Kudya.',
  loginTrustLine: 'Inicio de sesión seguro. Tú controlas tus datos.',
  orContinueWithEmail: 'o inicia sesión con el correo',
  signingIn: 'Iniciando sesión...',
  devSignIn: 'Inicio de sesión de desarrollador',
  mfaLoginSetupTitle: 'Configura una aplicación de autenticación',
  mfaLoginSetupHint:
    'Esta cuenta necesita una aplicación de autenticación. Escanea el código (o introduce la clave) en Google Authenticator, Microsoft Authenticator o similar y escribe abajo el código de 6 dígitos.',
};

const tables: Record<SupportedLocale, SignupTable> = { en, pt, fr, es };

export function signupT(locale: SupportedLocale, key: string): string | undefined {
  const table = tables[locale] ?? tables.en;
  if (key in table) return table[key as SignupTranslationKey];
  if (key in tables.en) return tables.en[key as SignupTranslationKey];
  return undefined;
}
