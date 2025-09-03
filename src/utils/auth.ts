import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { schema } from '../db/schema';

// Runtime guard for required Google OAuth environment variables
const missingGoogleEnvVars: string[] = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
].filter((envKey) => !process.env[envKey]);

if (missingGoogleEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s) for Google OAuth: ${missingGoogleEnvVars.join(
      ', '
    )}. Set them in your environment (e.g. .env.local).`
  );
}

export const auth = betterAuth({
    session:{
        expiresIn:60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24
    },
    database: drizzleAdapter(db,{
        provider:'pg',
        schema:
            schema
        
    }),
    emailAndPassword:{
        enabled:true
    },
    socialProviders:{
        google:{
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }
    },
    

})


