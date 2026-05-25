import {
  useWishlist as useWishlistContext,
  type WishlistContextValue,
} from '../contexts/WishlistContext';

/**
 * Returns the shared wishlist state and actions for the mobile app.
 */
export function useWishlist(): WishlistContextValue {
  return useWishlistContext();
}

export default useWishlist;
