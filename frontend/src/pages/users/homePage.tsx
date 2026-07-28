import React,{useState} from "react";
import {MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import chatService from "../../services/chat.service";
const UserHomePage: React.FC = () => {
const [isChatLoading,setIsChatLoading]=useState<boolean>(false);
const navigate=useNavigate()
const handleInitiateChat=async ()=>{
        setIsChatLoading(true)
        try {
            const payload={
               receiverId: '',
               receiverRole: 'admin'
            }
            const response=await chatService.getOrCreateConversation(payload)
            if(response.success&&response.data){
                navigate('/chat')
            }
            else{
                toast.error(response.message)
            }
        } catch {
           toast.error('failed to start conversation') 
        }finally{
            setIsChatLoading(false)
        }
    }



  return (
    <div className="bg-[#FFF9F4] min-h-screen relative text-[#1F1F1F]">
  
      <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center border-b border-[#E6E0DA]">
        <span className="text-[#6B6B6B] text-xs font-bold uppercase tracking-[0.3em] mb-4">
          Exclusive Marketplace
        </span>

        <h1 className="text-4xl md:text-7xl font-bold tracking-tighter uppercase mb-6 leading-none">
          Welcome to <span className="text-[#C9653B]">BidVerse</span>
        </h1>

        <p className="max-w-2xl text-[#6B6B6B] text-base md:text-lg font-light leading-relaxed">
          Discover rare collectibles, active listings, and real-time competitive bidding across global auction houses.
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-[#E6E0DA]">
        <div className="p-12 border-b md:border-b-0 md:border-r border-[#E6E0DA] bg-white hover:bg-[#FFF9F4] transition-colors">
          <span className="text-3xl font-bold text-[#C9653B] block mb-4">01.</span>
          <h3 className="text-lg font-bold uppercase mb-2 tracking-tight">Real-Time Bidding</h3>
          <p className="text-[#6B6B6B] text-sm font-light leading-relaxed">
            Experience zero-latency auctions powered by WebSockets.
          </p>
        </div>
        <div className="p-12 border-b md:border-b-0 md:border-r border-[#E6E0DA] bg-white hover:bg-[#FFF9F4] transition-colors">
          <span className="text-3xl font-bold text-[#C9653B] block mb-4">02.</span>
          <h3 className="text-lg font-bold uppercase mb-2 tracking-tight">Secure Escrow</h3>
          <p className="text-[#6B6B6B] text-sm font-light leading-relaxed">
            Protected transactions managed securely from bid to delivery.
          </p>
        </div>
        <div className="p-12 bg-white hover:bg-[#FFF9F4] transition-colors">
          <span className="text-3xl font-bold text-[#C9653B] block mb-4">03.</span>
          <h3 className="text-lg font-bold uppercase mb-2 tracking-tight">Verified Houses</h3>
          <p className="text-[#6B6B6B] text-sm font-light leading-relaxed">
            Bid confidently on items authenticated by multi-tenant partners.
          </p>
        </div>
      </section>

     
      <div className="fixed bottom-8 right-8 z-50">
        <button
          disabled={isChatLoading}
          onClick={handleInitiateChat}
          className="relative group flex items-center gap-3 bg-[#1F1F1F] text-white px-5 py-4 shadow-2xl hover:bg-[#C9653B] transition-all duration-300 rounded-full"
          aria-label="Chat with Platform Support"
        >
          
          <span className="absolute -inset-0.5 rounded-full bg-[#C9653B] opacity-75 blur animate-pulse group-hover:opacity-100 transition duration-1000"></span>

          <div className="relative flex items-center gap-3">
            <MessageSquare size={20} className="animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-widest pr-1">
              Chat Support
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserHomePage;