import {env} from '../config/env'
import Stripe from 'stripe'
import { AppError } from '../errors/AppError'

const secretkey=process.env.STRIPE_SECRET_KEY;
if(!secretkey){
    throw new AppError("Missing STRIPE_SECRET_KEY")
}

export const stripeClient=new Stripe(secretkey)

// export const stripeClient=new Stripe(
//     process.env.STRIPE_SECRET_KEY,{
//         apiVersion:'2026-07-29.dahlia'
//     }
// )