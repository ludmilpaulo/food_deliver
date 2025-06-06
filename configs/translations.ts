export const supportedLocales = ['en', 'pt'] as const;
export type SupportedLocale = typeof supportedLocales[number];

export const translationKeys = [
  "all",
  "allProducts",
  "male",
  "female",
  "browseProducts",
  "price",
  "size",
  "color",
  "sortBy",
  "newest",
  "priceLowHigh",
  "priceHighLow",
  "noProductsFound",
  // Shopping, Cart, Product
  "selectStore",
  "browse",
  "search",
  "loading",
  "error",
  "noStores",
  "back",
  "productNotFound",
  "brand",
  "noBrand",
  "outOfStock",
  "lowStock",
  "inStock",
  "selectSize",
  "quantity",
  "stockLimitReached",
  "only",
  "itemsAvailable",
  "addToCart",
  "goToCart",
  "share",
  "removeFromWishlist",
  "addToWishlist",
  "addedToWishlist",
  "removedFromWishlist",
  "rating",
  "customerReviews",
  "noReviews",
  "youMayAlsoLike",
  "lastOne",

  // Navigation
  "Home",
  "Categories",
  "Stores",
  "Cart",
  "Orders",
  "Wishlist",
  "Profile",

  // Auth/General
  "loginRequired",
  "sharingNotSupported",
  "shareFailed",
  "fillAllFields",
  "increase",
  "decrease",
  "loginToAccessCart",
  "login",
  "cancel",
  "name",
  "role",

  // Authentication/Forgot Password
  "loginTitle",
  "noAccount",
  "registerHere",
  "alreadyHaveAccount",
  "signup",
  "register",
  "registerSuccess",
  "registerFailed",
  "username",
  "password",
  "forgotPassword",
  "email",
  "enterEmail",
  "send",
  "close",
  "success",
  "emailSent",
  "emailSentInstruction",
  "resetPassword",
  "loginSuccess",
  "loginFailed",
  "resetFailed",
  "client",
  "store",
  "storeName",
  "phone",
  "address",
  "uploadLogo",
  "uploadLicense",
  "registerAsClient",
  "registerAsStore",
  "registerNow",
  "signingUp", 
  "storeAddress",
  "loginToAccessCart",

  // Checkout/order/payment
  "checkout",
  "paymentMethod",
  "payoutAccount",
  "orderSummary",
  "cartEmpty",
  "total",
  "confirmOrder",
  "orderConfirmed",
  "thankYouPurchase",
  "simulatePayment",
  "away",

  // Language/UI
  "changeLanguage",

  // Reset/Activation specific (new! 👇)
  "invalidResetLink",
  "passwordsDontMatch",
  "passwordResetSuccess",
  "newPassword",
  "enterNewPassword",
  "confirmNewPassword",
  "resetting",
  "invalidActivationLink",
  "accountActivatedSuccess",
  "activationFailed",
  "activatingAccount",
  "backToLogin",

  "todaysDeals",
  "nearbyStores",
  "allStores",
  "open",
  "closed",
  "minutesAway",
  "seeMenu",
  "selectColor",

  'noDealsToday',
  'storeClosed',
   "welcomeBack",
   "onSale",
   "viewDetails",
   "copiedToClipboard",
    "OpenWhatsApp",
   "YourSecretPIN",
   "BacktoHome",
   "Enterdeliveryaddress",
   "e.g.Leaveatthegate",
   "CashonDelivery",
   "CardonDelivery",
   "PlacingOrder...",
   "PlaceOrder",
   "OrderSummary",
   "Qty",
   "Delivery",
   "PaymentMethod",
   "DeliveryAddress",
   "DeliveryDetails",
   "OrderNotes(optional)",
   "FullName",
   "Checkout",
   "You'll_receive_updates_via_WhatsApp_or_email",
   "OrderPlaced",
   "Thank you! Your order has been received.",
   "networkError",

   "YourCart",
  "Your cart is empty",
  "Go Shopping",
  "Remove",
  "Decrease quantity",
  "Increase quantity",
  "Proceed to Checkout",
  "Clear Cart",
  "Are you sure you want to remove all items from your cart?",
  "Total",
  "careerOpportunities",
  "careerSubtitle", 
  "noOpenings",
  "applyNow",
  "applyFor",
  "submitApplication",
  "fullName",
  "pleaseAttachResume",
  "applicationSuccess",
  "applicationFailed",
  "sending",

  "contactUs",
  "contactSubtitle",
  "subject",
  "subjectPlaceholder",
  "emailPlaceholder",
  "phonePlaceholder",
  "message",
  "messagePlaceholder",
  "contactSuccess",
  "contactFailed",
  "currency",

  "adding",
  "decreaseQuantity",
  "increaseQuantity",

  "downloadApp",
  "aboutUs",
  "seeCareers",
  "language",
  "coverLetter",
  "resume",
  "submit",

        

 
] as const;

export type TranslationKey = typeof translationKeys[number];


const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: {
    // ENGLISH
   "language": "Language",
  "coverLetter": "Cover Letter",
  "resume": "Resume",
  "submit": "Submit",

    "downloadApp": "Download our App",
    "aboutUs": "About Us",
    "seeCareers": "See Careers",
    "increaseQuantity": "Increase Quantity",
    "decreaseQuantity": "Decrease Quantity",  
    "adding": "Adding",

"currency": "Currency",
    // ENGLISH
"contactUs": "Contact Us",
"contactSubtitle": "Send your message, suggestion, or question. Our team will respond promptly!",
"subject": "Subject",
"subjectPlaceholder": "How can we help?",

"emailPlaceholder": "your@email.com",

"phonePlaceholder": "+244 912 345 678",
"message": "Message",
"messagePlaceholder": "Write your message...",

"contactSuccess": "Message sent successfully! Check your email for confirmation.",
"contactFailed": "Failed to send message. Please try again.",

    /////////////////////
    "careerOpportunities": "Career Opportunities",
"careerSubtitle": "Build the future with us. See openings for your country.",
"noOpenings": "No open positions for your country at the moment.",
"applyNow": "Apply Now",
"applyFor": "Apply for",
"submitApplication": "Submit Application",
"fullName": "Full Name",
"pleaseAttachResume": "Please attach your resume.",
"applicationSuccess": "Application sent successfully!",
"applicationFailed": "Failed to submit application.",
"sending": "Sending...",
    YourCart: "Your Cart",
    "Your cart is empty": "Your cart is empty",
    "Go Shopping": "Go Shopping",
    Remove: "Remove",
    "Decrease quantity": "Decrease quantity",
    "Increase quantity": "Increase quantity",
    "Proceed to Checkout": "Proceed to Checkout",
    "Clear Cart": "Clear Cart",
    "Are you sure you want to remove all items from your cart?": "Are you sure you want to remove all items from your cart?",
    Total: "Total",

    // Add to "en":
OpenWhatsApp: "Open WhatsApp",
YourSecretPIN: "Your Secret PIN:",
BacktoHome: "Back to Home",
Enterdeliveryaddress: "Enter delivery address",
"e.g.Leaveatthegate": "e.g. Leave at the gate",
CashonDelivery: "Cash on Delivery",
CardonDelivery: "Card on Delivery",
"PlacingOrder...": "Placing Order...",
PlaceOrder: "Place Order",
OrderSummary: "Order Summary",
Qty: "Qty",
Delivery: "Delivery",
PaymentMethod: "Payment Method",
DeliveryAddress: "Delivery Address",
DeliveryDetails: "Delivery Details",
"OrderNotes(optional)": "Order Notes (optional)",
FullName: "Full Name",
Checkout: "Checkout",
"You'll_receive_updates_via_WhatsApp_or_email": "You'll receive updates via WhatsApp or email.",
OrderPlaced: "Order Placed!",
"Thank you! Your order has been received.": "Thank you! Your order has been received.",
networkError: "Network error, please try again.",

  
   
    changeLanguage: "Change Language",
    allProducts: "All Products",
    copiedToClipboard: "Copied to clipboard",
    noProductsFound: "No products found",
   all: "all",
   male: "male",
   female: "female",
  browseProducts: "browse Products",
   price: "price",
   size: "size",
   color: "color",
   sortBy: "sortBy",
    newest:"newest",
    priceLowHigh:"price LowHigh",
    priceHighLow:"price HighLow",

    // Shopping, Cart, Product
    viewDetails: "View Details",
    selectColor: "Select Color",
    selectStore: "Select Store Type",
    browse: "Search or browse categories",
    search: "Search...",
    loading: "Loading...",
    error: "Something went wrong",
    noStores: "No store types found",
    back: "Back",
    productNotFound: "Product not found",
    brand: "Brand",
    noBrand: "N/A",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    inStock: "in stock",
    selectSize: "Select Size",
    quantity: "Quantity",
    stockLimitReached: "Stock Limit Reached",
    only: "Only",
    itemsAvailable: "items available",
    addToCart: "🛒 Add to Cart",
    goToCart: "🛒 Go to Cart",
    share: "Share",
    removeFromWishlist: "Remove from Wishlist",
    addToWishlist: "Add to Wishlist",
    addedToWishlist: "Added to Wishlist",
    removedFromWishlist: "Removed from Wishlist",
    rating: "Rating",
    customerReviews: "Customer Reviews",
    noReviews: "No reviews yet.",
    youMayAlsoLike: "You May Also Like",
    lastOne: "Last one!",
    Home: "Home",
    Categories: "Categories",
    Stores: "Stores",
    Cart: "Cart",
    Orders: "Orders",
    Wishlist: "Wishlist",
    Profile: "Profile",
    loginRequired: "Login Required",
    sharingNotSupported: "Sharing not supported on this device.",
    shareFailed: "Failed to share product.",
    fillAllFields: "Please fill all fields.",
    increase: "Increase",
    decrease: "Decrease",
    loginToAccessCart: "You need to log in to access your cart and complete your purchase.",
    login: "Login",
    cancel: "Cancel",
    // Authentication/Forgot Password:
    loginTitle: "Sign in to your account",
    noAccount: "Don't have an account?",
    registerHere: "Register here",
    username: "Username",
    password: "Password",
    forgotPassword: "Forgot password?",
    email: "Email",
    enterEmail: "Enter your email",
    send: "Send",
    close: "Close",
    success: "Success",
    emailSent: "Email Sent",
    emailSentInstruction: "Please check your email to reset your password.",
    resetPassword: "Reset Password",
    loginSuccess: "You have successfully logged in!",
    loginFailed: "Failed to login. Please try again.",
    resetFailed: "Failed to send reset password email.",
    //checkout
    checkout: "Checkout",
    paymentMethod: "Payment Method",
    payoutAccount: "Payout Account",
    orderSummary: "Order Summary",
    cartEmpty: "Your cart is empty.",
    total: "Total",
    confirmOrder: "Confirm Order",
    orderConfirmed: "Order Confirmed",
    thankYouPurchase: "Thank you for your purchase!",
   
    simulatePayment: "Simulate Payment",
    away: "away",
 
    //////
    signup: "Sign Up",
    register: "Register",
    registerSuccess: "You have registered successfully!",
    registerFailed: "Failed to register. Please try again.",
    name: "Name",
    address: "Address",
    phone: "Phone",
    uploadLogo: "Upload Logo",
    uploadLicense: "Upload License",
    role: "Role",
    client: "Customer",
    store: "Business Vendor",
    alreadyHaveAccount: "Already have an account?",
    registerNow: "Register now",
    registerAsClient: "Register as Customer",
    registerAsStore: "Register as Vendor",
    signingUp: "Signing up...",
    storeName: "Business or Store Name",
    storeAddress: "Business or Store Address",

    // Add these keys to your translations (en/pt):
    invalidResetLink: "Invalid reset link. Please check your email or request again.",
    passwordsDontMatch: "Passwords do not match.",
    passwordResetSuccess: "Password reset successfully. You can now log in.",
    newPassword: "New Password",
    enterNewPassword: "Enter your new password",
    confirmNewPassword: "Confirm New Password",
    resetting: "Resetting...",
    invalidActivationLink: "Invalid activation link. Please check your email or request again.",
    accountActivatedSuccess: "Account successfully activated.",
    activationFailed: "Failed to activate account.",
    activatingAccount: "Activating account...",
    backToLogin: "Back to Login",

    todaysDeals: "Today's Deals",
    nearbyStores: "Nearby Stores",
    allStores: "All Stores",
    open: "Open",
    closed: "Closed",
    minutesAway: "You are about {min} minutes away",
    seeMenu: "See Menu",
    noDealsToday: "No deals today!",
    welcomeBack: "Welcome back!",
  
    storeClosed: "This store is currently closed. Please try later.",
    onSale: "On Sale",
  },
  pt: {
// PORTUGUÊS
"language": "Idioma",
  "coverLetter": "Carta de Apresentação",
  "resume": "Currículo",
  "submit": "Enviar",
"downloadApp": "Baixe nosso App",
"aboutUs": "Sobre Nós", 
"seeCareers": "Ver Carreiras",
"decreaseQuantity": "Diminuir Quantidade",
"increaseQuantity": "Aumentar Quantidade",
"adding": "Adicionando",
"currency": "Moeda",
    YourCart: "Seu Carrinho",
"Your cart is empty": "Seu carrinho está vazio",
"Go Shopping": "Continuar Comprando",
Remove: "Remover",
"Decrease quantity": "Diminuir quantidade",
"Increase quantity": "Aumentar quantidade",
"Proceed to Checkout": "Finalizar Compra",
"Clear Cart": "Limpar Carrinho",
"Are you sure you want to remove all items from your cart?": "Tem certeza que deseja remover todos os itens do seu carrinho?",
Total: "Total",

    // Add to "pt":
OpenWhatsApp: "Abrir WhatsApp",
YourSecretPIN: "Seu PIN Secreto:",
BacktoHome: "Voltar para o início",
Enterdeliveryaddress: "Digite o endereço de entrega",
"e.g.Leaveatthegate": "Ex: Deixe no portão",
CashonDelivery: "Dinheiro na Entrega",
CardonDelivery: "Cartão na Entrega",
"PlacingOrder...": "Enviando pedido...",
PlaceOrder: "Fazer Pedido",
OrderSummary: "Resumo do Pedido",
Qty: "Qtd",
Delivery: "Entrega",
PaymentMethod: "Método de pagamento",
DeliveryAddress: "Endereço de entrega",
DeliveryDetails: "Detalhes de Entrega",
"OrderNotes(optional)": "Observações (opcional)",
FullName: "Nome completo",
Checkout: "Finalizar Compra",
"You'll_receive_updates_via_WhatsApp_or_email": "Você receberá atualizações por WhatsApp ou email.",
OrderPlaced: "Pedido realizado!",
"Thank you! Your order has been received.": "Obrigado! Seu pedido foi recebido.",
networkError: "Erro de rede, tente novamente.",


   
    allProducts: "Todos os Produtos",
    copiedToClipboard: "Copiado para a área de transferência",
    noProductsFound: "Nenhum produto encontrado",
    all: "todos",
    male: "masculino",
    female: "feminino",
    browseProducts: "navegar Produtos",
    price: "preço",
    size: "tamanho",
    color: "cor",
    sortBy: "ordenarPor",
    newest: "mais recente",
    priceLowHigh: "preço BaixoAlto",
    priceHighLow: "preço AltoBaixo",
    // Shopping, Cart, Product
    viewDetails: "Ver Detalhes",
    selectColor: "Selecionar Cor",
    selectStore: "Selecione o tipo de loja",
    browse: "Procure ou navegue pelas categorias",
    search: "Pesquisar...",
    loading: "Carregando...",
    error: "Algo deu errado",
    noStores: "Nenhum tipo de loja encontrado",
    back: "Voltar",
    productNotFound: "Produto não encontrado",
    brand: "Marca",
    noBrand: "N/D",
    outOfStock: "Esgotado",
    lowStock: "Pouco Stock",
    inStock: "em estoque",
    selectSize: "Selecione o tamanho",
    quantity: "Quantidade",
    stockLimitReached: "Limite de estoque alcançado",
    only: "Apenas",
    itemsAvailable: "itens disponíveis",
    addToCart: "🛒 Adicionar ao Carrinho",
    goToCart: "🛒 Ir para o Carrinho",
    share: "Compartilhar",
    removeFromWishlist: "Remover da Lista de Desejos",
    addToWishlist: "Adicionar à Lista de Desejos",
    addedToWishlist: "Adicionado à Lista de Desejos",
    removedFromWishlist: "Removido da Lista de Desejos",
    rating: "Avaliação",
    customerReviews: "Avaliações dos Clientes",
    noReviews: "Sem avaliações.",
    youMayAlsoLike: "Você também pode gostar",
    lastOne: "Último!",
    Home: "Início",
    Categories: "Categorias",
    Stores: "Lojas",
    Cart: "Carrinho",
    Orders: "Pedidos",
    Wishlist: "Favoritos",
    Profile: "Conta",
    loginRequired: "É necessário estar autenticado",
    sharingNotSupported: "Compartilhamento não suportado neste dispositivo.",
    shareFailed: "Falha ao compartilhar o produto.",
    increase: "Aumentar",
    decrease: "Diminuir",
    loginToAccessCart: "Você precisa fazer login para acessar seu carrinho e finalizar a compra.",
    login: "Entrar",
    cancel: "Cancelar",
    // Authentication/Forgot Password:
    loginTitle: "Faça login na sua conta",
    noAccount: "Não tem uma conta?",
    registerHere: "Cadastre-se aqui",
    username: "Nome do usuário",
    password: "Senha",
    forgotPassword: "Esqueceu a senha?",
    fillAllFields: "Preenche todos campos.",
    email: "Email",
    enterEmail: "Digite seu email",
    send: "Enviar",
    close: "Fechar",
    success: "Sucesso",
    emailSent: "Email Enviado",
    emailSentInstruction: "Por favor, verifique seu email para redefinir sua senha.",
    resetPassword: "Redefinir Senha",
    loginSuccess: "Você se conectou com sucesso!",
    loginFailed: "Falha ao entrar. Por favor, tente novamente.",
    resetFailed: "Erro ao enviar o email de redefinição de senha.",

    //checkout
    checkout: "Finalizar Compra",
    paymentMethod: "Método de Pagamento",
    payoutAccount: "Conta de recebimento",
    orderSummary: "Resumo do Pedido",
    cartEmpty: "Seu carrinho está vazio.",
    total: "Total",
    confirmOrder: "Confirmar Pedido",
    orderConfirmed: "Pedido Confirmado",
    thankYouPurchase: "Obrigado pela sua compra!",
   
    simulatePayment: "Simular Pagamento",
    away: "distância",
    changeLanguage: "Alterar idioma",
    //////
    signup: "Inscrever-se",
    register: "Registrar",
    registerSuccess: "Você se registrou com sucesso!",
    registerFailed: "Falha ao registrar. Por favor, tente novamente.",
    name: "Nome",
    address: "Endereço",
    phone: "Telefone",
    uploadLogo: "Carregar Logo",
    uploadLicense: "Carregar Licença",
    role: "Função",
    client: "Cliente",
    store: "Fornecedor de Negócio",
    alreadyHaveAccount: "Já tem uma conta?",
    registerNow: "Registrar agora",
    registerAsClient: "Registrar como Cliente",
    registerAsStore: "Registrar como Fornecedor",
    signingUp: "Registrando...",
    storeName: "Nome do Negócio ou Loja",
    storeAddress: "Endereço do Negócio ou Loja",

    invalidResetLink: "Link de redefinição inválido. Por favor, verifique seu email ou solicite novamente.",
    passwordsDontMatch: "As senhas não coincidem.",
    passwordResetSuccess: "Senha redefinida com sucesso. Agora você pode fazer login.",
    newPassword: "Nova Senha",
    enterNewPassword: "Digite sua nova senha",
    confirmNewPassword: "Confirme a Nova Senha",
    resetting: "Redefinindo...",
    invalidActivationLink: "Link de ativação inválido. Por favor, verifique seu email ou solicite novamente.",
    accountActivatedSuccess: "Conta ativada com sucesso.",
    activationFailed: "Falha ao ativar a conta.",
    activatingAccount: "Ativando conta...",
    backToLogin: "Voltar para Login",

    todaysDeals: "Ofertas de Hoje",
    noDealsToday: "Sem ofertas Hoje!",
    nearbyStores: "Lojas Próximas",
    allStores: "Todas as Lojas",
    open: "Aberto",
    closed: "Fechado",
    minutesAway: "Você está a aproximadamente {min} minutos de distância",
    seeMenu: "Ver o Menu",
    welcomeBack: "Bem-vindo de volta!",
    onSale: "Em Promoção",
    storeClosed: "O restaurante está fechado de momento, tente mais tarde.",

    // pt
    "careerOpportunities": "Oportunidades de Carreira",
    "careerSubtitle": "Construa o futuro com a gente. Veja as vagas disponíveis para o seu país.",
    "noOpenings": "Nenhuma vaga disponível para o seu país no momento.",
    "applyNow": "Candidatar-se",
    "applyFor": "Candidate-se para",
    "submitApplication": "Enviar Inscrição",
    "fullName": "Nome Completo",
    "pleaseAttachResume": "Por favor, anexe um currículo.",
    "applicationSuccess": "Inscrição enviada com sucesso!",
    "applicationFailed": "Falha ao enviar inscrição.",
    "sending": "Enviando...",

    // PORTUGUÊS
"contactUs": "Contacte-nos",
"contactSubtitle": "Envie sua mensagem, sugestão ou dúvida. Nossa equipa irá responder rapidamente!",
"subject": "Assunto",
"subjectPlaceholder": "Como podemos ajudar?",

"emailPlaceholder": "seu@email.com",

"phonePlaceholder": "+244 912 345 678",
"message": "Mensagem",
"messagePlaceholder": "Escreva sua mensagem...",

"contactSuccess": "Mensagem enviada com sucesso! Verifique seu e-mail para confirmação.",
"contactFailed": "Falha ao enviar a mensagem. Tente novamente.",
  },
};

export default translations;
