import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E6E0DA] py-12 px-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B6B]">
        
        {/* BRAND & COPYRIGHT - Secondary Text Color */}
        <p className="hover:text-[#1F1F1F] transition-colors cursor-default">
          © 2026 AUCTION PLATFORM<span className="text-[#C9653B] mx-1">/</span>EST. 2026
        </p>
        
        {/* LINKS - Hover effect uses Primary Heading Color */}
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#1F1F1F] transition-colors border-b border-transparent hover:border-[#C9653B]">
            Privacy
          </a>
          <a href="#" className="hover:text-[#1F1F1F] transition-colors border-b border-transparent hover:border-[#C9653B]">
            Terms
          </a>
          <a href="#" className="hover:text-[#1F1F1F] transition-colors border-b border-transparent hover:border-[#C9653B]">
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;