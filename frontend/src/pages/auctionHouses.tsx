import React from "react";
import { useEffect } from "react";
import publicAuctionService from "../services/publicAuction.service";
const PublicAuctionHouses:React.FC=()=>{

const fetchHouses=async()=>{
    const result=await publicAuctionService.listAllPublicAuctionHouses(1,3)
    console.log(result)
}
useEffect(()=>{
  fetchHouses()
},[])




}

export default PublicAuctionHouses