import React, { useEffect, useState } from "react";
import auctionHouseService from "../../services/auctionHouse.service";
import type { AdminAuctionHouseDetailDTO } from "../../types/auctionHouse.type";
import toast from "react-hot-toast"


const TenantProfilePage: React.FC = () => {
    const [house, setHouse] = useState<AdminAuctionHouseDetailDTO | null>(null)
    const [isEditing, setIsEditing] = useState(false);
    const [ownerDeatails, setOwnerDetails] = useState({ name: '', Phone: '' })

    useEffect(() => {
        const fethData = async () => {
            const response = await auctionHouseService.getProfile()
            if (response.success && response.data) {
                setHouse(response.data)
                setOwnerDetails({ name: response.data.userName, Phone:response.data.userPhone})
            }
            else {
                toast.error(response.message)
            }
        }
        fethData()
    }, [])
    
    return (
       
    )
}
export default TenantProfilePage