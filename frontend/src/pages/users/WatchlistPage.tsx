import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import watchListService from "../../services/watchList.service";
import type { IPaginationMeta } from "../../types/auth.type";
import type { WatchlistItemCardDTO } from "../../types/watchlist.dto";
import toast from "react-hot-toast";

const Watchlist:React.FC=()=>{
const [items,setItems]=useState<WatchlistItemCardDTO[]>([])
const [pagination,setPageination]=useState<IPaginationMeta|null>(null)
const navigate=useNavigate()
const fetchItems=async()=>{
try {
    const response=await watchListService.findAllWatchListItems(1,5)
    if(response.success&&response.data){
        setItems(response.data)
        setPageination(response.pagination??null)
    }
    else{
        toast.error(response.message);
        navigate(-1)
    }
} catch{
    toast.error('Failed to get items')
     navigate(-1)
}

}

useEffect(()=>{
fetchItems()
},[])

console.log('items :',items)
console.log('pagination',pagination)
}

export default Watchlist