import { authClient } from "../utils/auth-client";



export const useAuth = ()=>{

     const signIn = async () => {
        await authClient.signIn.social({
          provider: "google",
        });
      };

      const signOut = async () => {
        await authClient.signOut();
      };

      return {
        signIn,
        signOut
      }
}