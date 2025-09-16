// Hooks d'authentification
export {
  useCurrentUser,
  useAuth,
  useIsAuthenticated,
  useAuthToken,
  useLogout,
  useLogin,
  useRegister,
  useUpdateProfile
} from './api/useAuth';

// Hooks de dashboard
export {
  useDashboardStats,
  useRecentOrders,
  useFavoriteProducts,
  useNotifications
} from './api/useDashboard';

// Hooks d'entreprise
export {
  useEntreprise,
  useUpdateEntreprise
} from './api/useEntreprise';

// Hooks de produits
export {
  useProduct,
  useProducts
} from './api/useProducts';

// Hooks de messages
export {
  useUnreadCount
} from './api/useMessages';

// Hooks de panier
export {
  useCartCount
} from './api/useCart';

// Hooks de fournisseur
export {
  useSupplierStats,
  useSupplierMessages
} from './api/useSupplierDashboard';

// Hook Socket.IO principal
export {
  useSocketConnection,
  type SocketConnectionState,
  type SocketEventHandlers,
  type UseSocketConnectionOptions,
  type UseSocketConnectionReturn
} from './useSocketConnection';