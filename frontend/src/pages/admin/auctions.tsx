import React, { useEffect, useState,useCallback} from "react";
import type { AuctionItemListDTO } from "../../types/auctionItem.dto";
import type { IPaginationMeta } from "../../types/auth.type";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import toast from "react-hot-toast";


const AdminAuctionsListPage:React.FC=()=>{
const [auctions,setAuction]=useState<AuctionItemListDTO[]>([])
const [pagination,setPagination]=useState<IPaginationMeta|null>(null)


const fetchAuctions=useCallback(async()=>{
   try {
     const result=await auctionItemMangementService.listAdminAuctions(1,5)
    if(result.success&&result.data){
        setAuction(result.data)
        setPagination(result.pagination??null)
    }
    else{
        toast.error(result.message)
    }
   } catch{
    toast.error('Error while listing auctions')
   }
},[])

useEffect(()=>{
fetchAuctions()
},[fetchAuctions])


}

export default AdminAuctionsListPage