import {
  useCart as useCartContext,
  type CartContextValue,
} from '../contexts/CartContext';

/**
 * Returns the shared cart state and actions for the mobile app.
 */
export function useCart(): CartContextValue {
  return useCartContext();
}

export default useCart;
