import React, { useState,useEffect} from "react";
import toast from "react-hot-toast";

interface PlaceBidProps{
    isOpen:boolean;
    onClose:()=>void;
    auctionName:string;
    currentHighestBid:number;
    minimumBidIncrement:number;
    startingPrice?:number;
    onSubmitBid:(amount:number)=>Promise<void>
}

const PlaceBidModal:React.FC<PlaceBidProps>=({
isOpen,
onClose,
auctionName,
currentHighestBid,
minimumBidIncrement,
startingPrice,
onSubmitBid
})=>{

const hasbids=currentHighestBid>0;
const basePrice=hasbids?currentHighestBid:startingPrice;
const requireMinBid=basePrice!+minimumBidIncrement;

const [bidAmount,setBidAmount]=useState<number>(requireMinBid);
const [isSubmitting,setIsSubmitting]=useState<boolean>(false);
const [errorMessage,setErrorMessage]=useState<string>('')

useEffect(()=>{
  if(isOpen){
    setBidAmount(requireMinBid);
    setErrorMessage('')
  }
},[isOpen,requireMinBid])
if(!isOpen) return null;

const handleInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const value=parseFloat(e.target.value);
    setBidAmount(value);
    if(isNaN(value)||value<requireMinBid){
        setErrorMessage(`Minimum Require bid is ${requireMinBid.toLocaleString()}`)
    }
    else{
        setErrorMessage('');
    }
}
const handlePresetAdd=(multiplier:number)=>{
    const newBid=requireMinBid+minimumBidIncrement*(multiplier-1);
    setBidAmount(newBid);
    setErrorMessage('')
}
const handleSubmit=async (e:React.FormEvent)=>{
    e.preventDefault();
    if(isNaN(bidAmount)||bidAmount<requireMinBid){
      setErrorMessage(`Your bid must be at least $${requireMinBid.toLocaleString()}`); 
      toast.error("Bid amount is below the required minimum!");
      return 
    }
    try {
        setIsSubmitting(true);
        await onSubmitBid(bidAmount);
        toast.success('Bid placed successfully');
        onClose()
    } catch{
       toast.error("Failed to place bid. Please try again."); 
    }finally{
        setIsSubmitting(false)
    }
}
return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
                className="bg-white border border-[#E6E0DA] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#FFF9F4] px-5 py-4 border-b border-[#E6E0DA]/60 flex items-center justify-between">
                    <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[#C9653B]">
                            Place Your Bid
                        </span>
                        <h2 className="text-sm font-bold text-[#1F1F1F] truncate max-w-[280px]">
                            {auctionName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-[#6B6B6B] hover:text-[#1F1F1F] p-1 rounded-lg hover:bg-black/5 transition-colors text-lg font-bold leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2 bg-[#FFF9F4]/80 border border-[#E6E0DA]/60 rounded-xl p-3">
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-bold text-[#6B6B6B]">
                                {hasbids ? "Current Highest Bid" : "Starting Price"}
                            </span>
                            <span className="text-sm font-black text-[#1F1F1F]">
                                ${basePrice!.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex flex-col text-right">
                            <span className="text-[8px] uppercase font-bold text-[#6B6B6B]">
                                Min Increment
                            </span>
                            <span className="text-sm font-bold text-[#C9653B]">
                                +${minimumBidIncrement.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                            Quick Bid Presets
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handlePresetAdd(1)}
                                className="py-1.5 px-2 bg-white hover:bg-[#FFF9F4] border border-[#E6E0DA] hover:border-[#C9653B] rounded-lg text-xs font-bold text-[#1F1F1F] transition-all"
                            >
                                ${requireMinBid.toLocaleString()}
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePresetAdd(2)}
                                className="py-1.5 px-2 bg-white hover:bg-[#FFF9F4] border border-[#E6E0DA] hover:border-[#C9653B] rounded-lg text-xs font-bold text-[#1F1F1F] transition-all"
                            >
                                ${(requireMinBid + minimumBidIncrement).toLocaleString()}
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePresetAdd(3)}
                                className="py-1.5 px-2 bg-white hover:bg-[#FFF9F4] border border-[#E6E0DA] hover:border-[#C9653B] rounded-lg text-xs font-bold text-[#1F1F1F] transition-all"
                            >
                                ${(requireMinBid + minimumBidIncrement * 2).toLocaleString()}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#1F1F1F] flex justify-between">
                            <span>Your Bid Amount ($)</span>
                            <span className="text-[#C9653B]">Min: ${requireMinBid.toLocaleString()}</span>
                        </label>
                        
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-sm font-bold text-[#6B6B6B]">
                                $
                            </span>
                            <input
                                type="number"
                                step="any"
                                min={requireMinBid}
                                value={isNaN(bidAmount) ? "" : bidAmount}
                                onChange={handleInputChange}
                                placeholder={`Enter amount >= ${requireMinBid}`}
                                className={`w-full pl-7 pr-3 py-2 bg-white border ${
                                    errorMessage 
                                        ? "border-red-500 focus:ring-2 focus:ring-red-200" 
                                        : "border-[#E6E0DA] focus:border-[#C9653B] focus:ring-2 focus:ring-[#C9653B]/20"
                                } rounded-xl text-sm font-bold text-[#1F1F1F] outline-none transition-all shadow-sm`}
                            />
                        </div>

                        {errorMessage ? (
                            <span className="text-[10px] font-semibold text-red-500 mt-0.5">
                                {errorMessage}
                            </span>
                        ) : (
                            <span className="text-[9.5px] font-medium text-[#6B6B6B] mt-0.5">
                                {hasbids ? "Highest Bid" : "Starting Price"} (${basePrice!.toLocaleString()}) + Increment (${minimumBidIncrement.toLocaleString()}) = Minimum Bid (${requireMinBid.toLocaleString()})
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E0DA]/60 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full bg-white hover:bg-[#FFF9F4] border border-[#E6E0DA] text-[#1F1F1F] font-bold text-xs py-2 rounded-xl transition-all"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !!errorMessage || isNaN(bidAmount)}
                            className="w-full bg-[#C9653B] hover:bg-[#C9653B]/90 text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-sm disabled:bg-[#E6E0DA] disabled:text-[#6B6B6B] disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                            {isSubmitting ? "Submitting..." : "Confirm Bid"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}

export default PlaceBidModal