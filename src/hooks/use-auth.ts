import { useCallback } from 'react';
import { authClient } from '../utils/auth-client';

export const useAuth = () => {
  const signIn = useCallback(async () => {
    await authClient.signIn.social({
      provider: 'google',
    });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  return {
    signIn,
    signOut,
  };
};
