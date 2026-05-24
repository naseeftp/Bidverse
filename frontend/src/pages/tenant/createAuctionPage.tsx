import React, { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import toast from "react-hot-toast";
import Cropper, {type Point, type Area } from "react-easy-crop";
import { 
  Gavel, Image as ImageIcon, Calendar, Percent, IndianRupee, Truck, Info, Loader2, Trash2, CheckCircle2 
} from "lucide-react";
import { createAuctionItemSchema } from "../../types/auctionItem.dto";
import  type { CreateAuctionItemDTO } from "../../types/auctionItem.dto";
import uploadservice from "../../services/uploadservice";
import auctionItemMangementService from "../../services/auctionItemMangement.service";
import { AuctionType } from "../../types/auctionItem.dto";



interface ICropQueueItem {
  id: string;
  rawUrl: string;
  file: File;
}

const CreateAuctionPage: React.FC = () => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [cropQueue, setCropQueue] = useState<ICropQueueItem[]>([]);// arr holding that need to be cropped before hitting main form list
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);// track which image in the queue is currently visible inside the cropper canvas model
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);//zoom crop croppedAreapixels are state variables diroctly  pass to react-easy crop for track positioning
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);//hold the exact pixel cordinates and diamensions of the image area you want to cut out

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<CreateAuctionItemDTO>({
    resolver: yupResolver(createAuctionItemSchema),
    defaultValues: { images: [] }
  });

  const { fields: attachedImages, append: appendImageField, remove: removeImageField } = useFieldArray({
    control,
    name: "images"
  });

  const watchedImages = watch("images") || [];


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    const newQueueItems = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      rawUrl: URL.createObjectURL(file),// creating local browswer url
      file          //  fn purpose instead of  passing every selected files into form at once,intercepts the raw files and creates temp browser link for them
    }));

    setCropQueue((prev) => [...prev, ...newQueueItems]);
    if (activeCropIndex === null) {
      setActiveCropIndex(0);
    }
    e.target.value = ""; 
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  
  const processCroppedBlob = async (activeItem: ICropQueueItem, pixelCrop: Area): Promise<File> => {
    const image = new Image();   // instantiate an invisible html img elemnt  in your browser's background engine memory                               
    image.src = activeItem.rawUrl;  //and binds it to the local temporary file location tracker                           //this fn act as virtual knife
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas rendering context generation crashed");

    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,//source where to cut the orginal file
      0, 0, pixelCrop.width, pixelCrop.height // destination where to past it on canvas
    );

    return new Promise((resolve, reject) => {  // it takes temp pixel data drawn on virtual web screen and convert into stndrd js file object
      canvas.toBlob((blob) => {                //[ Canvas Pixels on Screen ] ──► (canvas.toBlob) ──► [ Raw Binary Data Array ] ──► (new File) ──► [ Labeled System File ]                    
        if (!blob) return reject(new Error("Canvas generation returned null data stream"));
        const finalFile = new File([blob], activeItem.file.name, { type: activeItem.file.type });//[blob]: The raw cropped image data,activeItem.file.name: It copies over the original name of the file  { type: activeItem.file.type }: It seals the file extension type.
        resolve(finalFile);
      }, activeItem.file.type);  //activeItem.file.type passed as a configuration argmnt,telling the brwsr exctly how to encode row pixl data
    });           //canvas.toBlob( (blob) => { ... }, activeItem.file.type ); 2 argmnts
  };

  const saveActiveCropSelection = async () => {  // this fn bridge that connect your image cropping modal to ur main applctn form
    if (activeCropIndex === null || !croppedAreaPixels) return;
    const activeItem = cropQueue[activeCropIndex];

    try {
      const finishedCroppedFile = await processCroppedBlob(activeItem, croppedAreaPixels);
      
      const frontendPreviewUrl = URL.createObjectURL(finishedCroppedFile);// now we have new file instance that ,that broser shows on the screen

      appendImageField({
        id: activeItem.id,
        url: frontendPreviewUrl, 
        isPrimary: attachedImages.length === 0, 
        altText: ""
      });

      advanceOrCloseCropModal();
    } catch  {
      toast.error("Image optimization failed. Please retry.");
    }
  };

  const advanceOrCloseCropModal = () => {
    if (activeCropIndex === null) return;
    URL.revokeObjectURL(cropQueue[activeCropIndex].rawUrl);

    if (activeCropIndex < cropQueue.length - 1) {
      setActiveCropIndex(activeCropIndex + 1);
      setZoom(1);
    } else {
  
      setCropQueue([]);
      setActiveCropIndex(null);
    }
  };

  const setPrimaryImageIndex = (targetIndex: number) => {
    watchedImages.forEach((_, index) => { //_ image object itslf and which insnt needed here
      setValue(`images.${index}.isPrimary`, index === targetIndex);
    });
  };


  const onSubmit = async (data:CreateAuctionItemDTO) => {
    try {
      setIsFormSubmitting(true);

      const secureUploadPipelines = attachedImages.map(async (field, idx) => {
        const previewUrl = data.images[idx].url;// gtes the local browser link
        const res = await fetch(previewUrl);// http fetches the raw bytes from browsers ram
        const blob = await res.blob();// extract the raw binary file chunk
        const fileInstance = new File([blob], `item_photo_${idx}.jpg`, { type: blob.type });

        const secureCdnUrl = await uploadservice.uploadSecurely(fileInstance);
        return {
          id: field.id,
          url: secureCdnUrl,
          isPrimary: data.images[idx].isPrimary,
          altText: data.images[idx].altText || `${data.title} asset viewport ${idx}`
        };
      });

      const uploadedImagesPayload = await Promise.all(secureUploadPipelines);

      const finalAuctionPayload = {
        ...data,
        images: uploadedImagesPayload
      };

      const result = await auctionItemMangementService.createAuctionItem(finalAuctionPayload);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(result.message);
      
      data.images.forEach((img) => URL.revokeObjectURL(img.url));

    } catch {
      toast.error("Failed to catalog auction request parameter limits.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-xl text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
  const labelStyle = "block text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1";
  const errorStyle = "text-[#EF4444] text-[9px] font-bold uppercase mt-1";

  return (
    <div className="max-w-5xl mx-auto pb-20 px-6 pt-10 font-sans">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Catalog New Auction Item</h1>
        <p className="text-[#475569] mt-2 text-[11px] font-medium uppercase tracking-wider">Configure item metrics, multi-tenant asset paths, and threshold margins.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F5F7FB]">
            <Gavel size={18} className="text-[#2F6FED]" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#0F172A]">Listing Content Parameters</h2>
          </div>
          
          <div className="space-y-1">
            <label className={labelStyle}>Auction Lot Title</label>
            <input {...register("title")} placeholder="Ex: Vintage Leather Chronograph Watch (150-Word Ceiling)" className={inputStyle} />
            {errors.title && <p className={errorStyle}>{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}>Auction Format Strategy</label>
              <select {...register("type")} className={inputStyle}>
                <option value="">Select Target Mechanism Style</option>
                {Object.values(AuctionType).map((typeVal) => (
                  <option key={typeVal} value={typeVal}>{typeVal}</option>
                ))}
              </select>
              {errors.type && <p className={errorStyle}>{errors.type.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Item Specifications & Overview</label>
            <textarea rows={4} {...register("description")} placeholder="Provide detailed operational logs, historical structural defects, and documentation parameters..." className={`${inputStyle} resize-none`} />
            {errors.description && <p className={errorStyle}>{errors.description.message}</p>}
          </div>
        </div>

      
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F5F7FB]">
            <ImageIcon size={18} className="text-[#2F6FED]" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#0F172A]">Asset Galleries</h2>
          </div>

          <div className="relative border-2 border-dashed rounded-xl p-6 border-[#E2E8F0] hover:border-[#2F6FED] transition-all text-center">
            <input type="file" multiple accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <p className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Select Multiple Demonstration Assets</p>
            <p className="text-[9px] text-[#94A3B8] uppercase mt-1">Image sizing modifiers apply instantly upon file upload drop targeting.</p>
          </div>
          {errors.images && <p className={errorStyle}>{errors.images.message}</p>}

       
          {watchedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {watchedImages.map((imgField, idx) => (
                <div key={imgField.id} className={`relative rounded-xl border p-2 transition-all group ${imgField.isPrimary ? "border-[#2F6FED] bg-[#2F6FED]/5" : "border-[#E2E8F0]"}`}>
                  <img src={imgField.url} alt="Item attachment aspect preview" className="w-full h-28 object-cover rounded-lg bg-slate-50" />
                  
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button type="button" onClick={() => setPrimaryImageIndex(idx)} className={`p-1.5 rounded-md text-white shadow transition-all ${imgField.isPrimary ? "bg-[#10B981]" : "bg-black/70 hover:bg-black"}`}>
                      <CheckCircle2 size={13} />
                    </button>
                    <button type="button" onClick={() => removeImageField(idx)} className="p-1.5 rounded-md bg-[#EF4444] text-white shadow hover:bg-[#DC2626] transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="mt-2">
                    <input {...register(`images.${idx}.altText`)} placeholder="Optional Alt Text" className="w-full bg-white border border-[#E2E8F0] px-2 py-1.5 rounded-md text-[11px] focus:outline-none" />
                  </div>

                  {imgField.isPrimary && (
                    <div className="absolute bottom-14 left-4 bg-[#2F6FED] text-white text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">Primary Display</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee size={17} className="text-[#2F6FED]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Bidding Configurations</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Opening Starting Bid</label>
                <input type="number" {...register("startingPrice")} className={inputStyle} placeholder="₹0 Base" />
                {errors.startingPrice && <p className={errorStyle}>{errors.startingPrice.message}</p>}
              </div>
              <div>
                <label className={labelStyle}>Reserve Floor Margin</label>
                <input type="number" {...register("reservePrice")} className={inputStyle} placeholder="₹ Minimum" />
                {errors.reservePrice && <p className={errorStyle}>{errors.reservePrice.message}</p>}
              </div>
            </div>
            <div>
              <label className={labelStyle}>Minimum Scale Increment Step</label>
              <input type="number" {...register("minimumIncrement")} className={inputStyle} placeholder="₹ Step value limit" />
              {errors.minimumIncrement && <p className={errorStyle}>{errors.minimumIncrement.message}</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Percent size={17} className="text-[#2F6FED]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Premiums & Protections</h2>
            </div>
            <div>
              <label className={labelStyle}>Buyer Premium Scale Percentage</label>
              <input type="number" step="0.01" {...register("buyerPremiumPercent")} className={inputStyle} placeholder="0% - 100% Volume Bounds" />
              {errors.buyerPremiumPercent && <p className={errorStyle}>{errors.buyerPremiumPercent.message}</p>}
            </div>
            <div>
              <label className={labelStyle}>Sniping Protection Extension Windows</label>
              <input type="number" {...register("snipingProtectionMinutes")} className={inputStyle} placeholder="Minutes scale limit (Max 60)" />
              {errors.snipingProtectionMinutes && <p className={errorStyle}>{errors.snipingProtectionMinutes.message}</p>}
            </div>
          </div>
        </div>

      
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-[#F5F7FB]">
            <Calendar size={17} className="text-[#2F6FED]" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Scheduling Timelines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Opening Window Execution Start</label>
              <input type="datetime-local" {...register("startTime")} className={inputStyle} />
              {errors.startTime && <p className={errorStyle}>{errors.startTime.message}</p>}
            </div>
            <div>
              <label className={labelStyle}>Closing Window Termination End</label>
              <input type="datetime-local" {...register("endTime")} className={inputStyle} />
              {errors.endTime && <p className={errorStyle}>{errors.endTime.message}</p>}
            </div>
          </div>
        </div>

      
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-[#F5F7FB]">
            <Truck size={17} className="text-[#2F6FED]" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Logistics & Transit Dispatches</h2>
          </div>
          <div>
            <label className={labelStyle}>Flat Parcel Shipping Cost</label>
            <input type="number" {...register("shippingCost")} className={inputStyle} placeholder="₹ Domestic dispatch limit costs" />
            {errors.shippingCost && <p className={errorStyle}>{errors.shippingCost.message}</p>}
          </div>
          <div>
            <label className={labelStyle}>Shipping Terms Conditions Specifications</label>
            <textarea rows={2} {...register("shippingTerms")} placeholder="Specify handling constraints, international clearing thresholds, cargo couriers..." className={`${inputStyle} resize-none`} />
            {errors.shippingTerms && <p className={errorStyle}>{errors.shippingTerms.message}</p>}
          </div>
        </div>

       
        <div className="flex flex-col items-center gap-6 mt-12">
          <button type="submit" disabled={isFormSubmitting} className="w-full md:w-auto bg-[#2F6FED] text-white px-20 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#2557C8] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50">
            {isFormSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Syncing Cloud Storage CDN Pools...</span>
              </>
            ) : "Publish Lot Specifications"}
          </button>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Multi-Tenant System Note: Asset updates pass admin inspection routines automatically.</span>
          </div>
        </div>
      </form>

     
      {activeCropIndex !== null && cropQueue[activeCropIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0F172A]">Image Cropping Workspace</h3>
                <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5">Asset Processing Node: {activeCropIndex + 1} of {cropQueue.length}</p>
              </div>
              <button type="button" onClick={() => advanceOrCloseCropModal()} className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-black">Skip Image</button>
            </div>

           
            <div className="relative flex-1 bg-neutral-900 min-h-[350px] max-h-[500px]">
              <Cropper
                image={cropQueue[activeCropIndex].rawUrl}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3} // Locked aspect scale constraint matching modern item list displays
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            
            <div className="p-6 bg-white border-t border-[#E2E8F0] space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-[#475569]">
                  <span>Scaling Magnification</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input type="range" value={zoom} min={1} max={3} step={0.1} aria-label="Zoom" onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#2F6FED]" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={saveActiveCropSelection} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all">
                  Apply Dimension Mask
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};



export default CreateAuctionPage