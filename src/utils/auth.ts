import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { schema } from '../db/schema';

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