import React,{useEffect, useState} from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import publicAuctionService from "../services/publicAuction.service";

const PublicAuctionHouseDetailsPage:React.FC=()=>{
const {houseId}=useParams<{houseId:string}>()
const navigate=useNavigate()
const fetchHouseDetail=async()=>{
    if(!houseId) return
    try {
        const response=await publicAuctionService.getHouseDetailsWithAuctions(houseId,1,6)
        if(response.data&&response.success){
            toast.success(response.message)
        }
        else{
            toast.error(response.message);
            navigate('/auctions')
        }
    } catch {
        toast.error('Failed to fetch auction Details')
        navigate('/auctions')
    }
}

useEffect(()=>{
    fetchHouseDetail()
},[])

}

export default PublicAuctionHouseDetailsPage