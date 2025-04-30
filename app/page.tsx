import { Container } from "@/src/components/ui/Container";
import {signIn,signUp} from '@/src/server/user'
import Image from "next/image";

export default function Home() {
  return (
    <div>
        <Container>
      
          <div className="mt-16" >
          <h1 className="text-6xl w-4/5 mb-8">Taste Perfection: Premium Recipes Curated by Idris</h1>
  
          </div>
        <div className="flex gap-4 mt-8">
        <button className="p-2 bg-blue-500 text-white rounded-md" onClick={signIn}>Sign In</button>
        <button className="p-2 bg-red-500 text-white rounded-md" onClick={signUp}>Sign Up</button>
        </div>
        </Container>
        
    </div>
  );
}
