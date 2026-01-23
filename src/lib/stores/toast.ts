import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastStore {
  toasts: Toast[];
}

function createToastStore() {
  const { subscribe, update } = writable<ToastStore>({ toasts: [] });

  const remove = (id: string) => {
    update((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  };

  return {
    subscribe,
    add: (message: string, type: 'success' | 'error' = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, message, type };
      
      update((state) => ({
        toasts: [...state.toasts, toast]
      }));

      // 5초 후 자동 제거
      setTimeout(() => {
        remove(id);
      }, 5000);

      return id;
    },
    remove,
    clear: () => {
      update(() => ({ toasts: [] }));
    }
  };
}

export const toastStore = createToastStore();

// 편의 함수
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  return toastStore.add(message, type);
}
