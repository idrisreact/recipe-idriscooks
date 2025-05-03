import { BouncingText } from "@/src/components/hero-animation-text/hero-animation-text";
import { Container } from "@/src/components/ui/Container";
import {signIn,signUp} from '@/src/server/user'
import { authClient } from "@/src/utils/auth-client";


export default function Home() {

  authClient.getSession
  return (
    <div>
        <Container>
          <div className="mt-16" >
        <BouncingText />
          </div>
        <div className="flex gap-4 mt-8">
       
        </div>
        </Container>
        
    </div>
  );
}
