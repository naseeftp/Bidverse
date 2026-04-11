import { configureStore } from "@reduxjs/toolkit";
import authReducer from './user/auth.slice'
import auctionHouseReduce from './tenant/auctionHouse.slice'

export const store=configureStore({
    reducer:{
        auth:authReducer,
        auctionHouse:auctionHouseReduce
    }
})

export type RootState=ReturnType<typeof store.getState> //A TypeScript type that represents entire Redux state For type safety when using useSelector
export type AppDispatch = typeof store.dispatch;//Type for dispatch function