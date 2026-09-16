import React, { useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
    images: string[];
    activeIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

const ImageLightbox: React.FC<Props> = ({ images, activeIndex, onClose, onNavigate }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && activeIndex < images.length - 1) onNavigate(activeIndex + 1);
            if (e.key === "ArrowLeft" && activeIndex > 0) onNavigate(activeIndex - 1);
        };
        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [activeIndex, images.length, onClose, onNavigate]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer z-10"
                aria-label="Close"
            >
                <FaTimes size={18} />
            </button>

            {images.length > 1 && (
                <div className="absolute top-5 left-5 text-white/70 text-xs font-bold uppercase tracking-wider">
                    {activeIndex + 1} / {images.length}
                </div>
            )}

            {images.length > 1 && activeIndex > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(activeIndex - 1);
                    }}
                    className="absolute left-4 md:left-8 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Previous image"
                >
                    <FaChevronLeft size={16} />
                </button>
            )}

            {images.length > 1 && activeIndex < images.length - 1 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(activeIndex + 1);
                    }}
                    className="absolute right-4 md:right-8 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Next image"
                >
                    <FaChevronRight size={16} />
                </button>
            )}

            <img
                src={images[activeIndex]}
                alt={`Preview ${activeIndex + 1}`}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
        </div>
    );
};

export default ImageLightbox;