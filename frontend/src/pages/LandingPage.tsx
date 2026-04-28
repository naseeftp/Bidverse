import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect,useRef} from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const LandingPage: React.FC = () => {
  const [searchParams,setSearchParams]=useSearchParams()
  const toastShown=useRef(false)
  useEffect(()=>{
   if(toastShown.current) return
   const errorType=searchParams.get('auth_error')
   const reason=searchParams.get('reason');
   if(errorType=='blocked'){
    toast.error(`Your account has been blocked due to : ${reason}`)
    toastShown.current=true
    setSearchParams({})
   }
   if(errorType=='expired'){
     toast.error('Session expired Please login Again')
     toastShown.current=true
     setSearchParams({})
   }

  },[setSearchParams,searchParams])
  return (

    <div className="bg-[#FFF9F4] min-h-screen">


      <section className="px-8 py-24 md:py-40 flex flex-col items-center text-center border-b border-[#E6E0DA]">

        <span className="text-[#6B6B6B] text-xs font-bold uppercase tracking-[0.3em] mb-4">
          The Future of Collecting
        </span>


        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-8 text-[#1F1F1F] leading-[0.9]">
          Bid. Win. <br />
          <span className="text-[#C9653B]">Own the Rare.</span>
        </h1>


        <p className="max-w-2xl text-[#6B6B6B] text-lg md:text-xl mb-12 font-light leading-relaxed">

          {"A premium multi-tenant auction platform designed for speed, security, and the world's most exclusive items."}
        </p>

        <div className="flex flex-col sm:flex-row gap-5">

          <Link
            to="/register"
            className="bg-[#C9653B] text-white px-12 py-5 text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#C9653B]/20"
          >
            Start Bidding
          </Link>


          <button className="border border-[#1F1F1F] text-[#1F1F1F] px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#1F1F1F] hover:text-white transition-all">
            Become Seller
          </button>
        </div>
      </section>


      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-[#E6E0DA]">


        <div className="p-16 border-b md:border-b-0 md:border-r border-[#E6E0DA] bg-white hover:bg-[#FFF9F4] transition-colors group">
          <span className="text-4xl font-bold text-[#C9653B] block mb-6">01.</span>
          <h3 className="text-xl font-bold uppercase text-[#1F1F1F] mb-4 tracking-tight">Real-Time Bidding</h3>
          <p className="text-[#6B6B6B] font-light leading-relaxed">
            Experience zero-latency auctions with our advanced WebSocket integration. Every millisecond counts.
          </p>
        </div>


        <div className="p-16 border-b md:border-b-0 md:border-r border-[#E6E0DA] bg-white hover:bg-[#FFF9F4] transition-colors group">
          <span className="text-4xl font-bold text-[#C9653B] block mb-6">02.</span>
          <h3 className="text-xl font-bold uppercase text-[#1F1F1F] mb-4 tracking-tight">Secure Escrow</h3>
          <p className="text-[#6B6B6B] font-light leading-relaxed">
            Your funds are protected. We ensure safe transitions between buyers and sellers with end-to-end encryption.
          </p>
        </div>


        <div className="p-16 bg-white hover:bg-[#FFF9F4] transition-colors group">
          <span className="text-4xl font-bold text-[#C9653B] block mb-6">03.</span>
          <h3 className="text-xl font-bold uppercase text-[#1F1F1F] mb-4 tracking-tight">Multi-Tenant</h3>
          <p className="text-[#6B6B6B] font-light leading-relaxed">
            Create your own auction house or join an existing one in seconds. Seamless scaling for global markets.
          </p>
        </div>

      </section>
    </div>
  );
};

export default LandingPage;