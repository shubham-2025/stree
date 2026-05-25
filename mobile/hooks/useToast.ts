import { useToast as useToastContext, type ToastContextValue } from '../contexts/ToastContext';

/**
 * Returns the shared toast actions for lightweight in-app feedback.
 */
export function useToast(): ToastContextValue {
  return useToastContext();
}

export default useToast;
