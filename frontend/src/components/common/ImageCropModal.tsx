import React, { useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Square } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onCropComplete: (croppedFile: File) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (location: Point) => setCrop(location);
  const onZoomChange = (zoomLevel: number) => setZoom(zoomLevel);

  const onCropLayoutComplete = useCallback((_: Area, currentPixels: Area) => {
    setCroppedAreaPixels(currentPixels);
  }, []);

  const generateCroppedImage = async () => {
    if (!croppedAreaPixels) return;
    try {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, croppedAreaPixels.width, croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        const finalCroppedFile = new File([blob], "avatar-crop.jpg", { type: "image/jpeg" });
        onCropComplete(finalCroppedFile);
      }, "image/jpeg", 0.9);

    } catch {
      // console.error("Failed to generate canvas slice matrix:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col">

        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
          <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
            <Square size={16} className="text-[#2F6FED]" /> Frame Profile Picture
          </h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="relative w-full h-80 bg-neutral-950 overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={true}
            minZoom={0.5}
            maxZoom={3}
            restrictPosition={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropLayoutComplete}
          />
        </div>

        <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-5">
          <div className="flex items-center gap-3 text-[#64748B]">
            <ZoomOut size={16} />
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#2F6FED]"
            />
            <ZoomIn size={16} />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={generateCroppedImage}
              className="px-5 py-2 bg-[#2F6FED] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              Apply Dimension Mask
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageCropModal;