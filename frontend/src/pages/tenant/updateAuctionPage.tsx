import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import Cropper, { type Point, type Area } from "react-easy-crop";
import {
  Gavel, Image as ImageIcon, Calendar, Percent, IndianRupee, Truck, Info, Loader2, Trash2, CheckCircle2, AlertOctagon
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { updateAuctionItemSchema, AuctionType, AuctionItemStatus } from "../../types/auctionItem.dto";
import type { UpdateAuctionItemDTO } from "../../types/auctionItem.dto";
import uploadservice from "../../services/uploadservice";
import auctionItemMangementService from "../../services/auctionItemMangement.service";

interface ICropQueueItem {
  id: string;
  rawUrl: string;
  file: File;
}

interface IFormImage {
  id?: string;
  url: string;
  isPrimary: boolean;
  altText?: string;
}

const TenantEditAuctionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [itemStatus, setItemStatus] = useState<string | null>(null);

  const [cropQueue, setCropQueue] = useState<ICropQueueItem[]>([]);
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<UpdateAuctionItemDTO>({
    resolver: yupResolver(updateAuctionItemSchema) as unknown as Resolver<UpdateAuctionItemDTO>,
    defaultValues: { images: [] }
  });

  // Type inference fix for useFieldArray
  const { fields: attachedImages, append: appendImageField, remove: removeImageField } = useFieldArray({
    control,
    name: "images"
  });

  const watchedImages = (watch("images") || []) as IFormImage[];

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!id) return;
      try {
        setIsDataLoading(true);
        const result = await auctionItemMangementService.getAuction(id);

        if (result.success && result.data) {
          const item = result.data;

          setItemStatus(item.status);
          if (item.rejectionReason) {
            setRejectionReason(item.rejectionReason);
          }

          const formatToDateTimeLocal = (dateStr: string) => {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().slice(0, 16);
          };

          reset({
            title: item.title,
            description: item.description,
            type: item.type as AuctionType,
            startingPrice: item.startingPrice,
            reservePrice: item.reservePrice,
            minimumIncrement: item.minimumIncrement,
            buyerPremiumPercent: item.buyerPremiumPercent,
            snipingProtectionMinutes: item.snipingProtectionMinutes,
            shippingCost: item.shippingCost,
            shippingTerms: item.shippingTerms,
            startTime: formatToDateTimeLocal(item.startTime),
            endTime: formatToDateTimeLocal(item.endTime),
            images: item.images.map(img => ({
              id: img.id,
              url: img.url,
              isPrimary: img.isPrimary,
              altText: img.altText || ""
            }))
          });
        } else {
          toast.error(result.message || "Unable to retrieve listing metadata.");
          navigate("/tenant/dashboard");
        }
      } catch {
        toast.error("Critical communications error cataloging current parameters.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [id, reset, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    const newQueueItems = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      rawUrl: URL.createObjectURL(file),
      file,
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
    const image = new Image();
    image.src = activeItem.rawUrl;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas rendering context generation crashed");

    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas generation returned null data stream"));
        const finalFile = new File([blob], activeItem.file.name, { type: activeItem.file.type });
        resolve(finalFile);
      }, activeItem.file.type);
    });
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

  const saveActiveCropSelection = async () => {
    if (activeCropIndex === null || !croppedAreaPixels) return;
    const activeItem = cropQueue[activeCropIndex];

    try {
      const finishedCroppedFile = await processCroppedBlob(activeItem, croppedAreaPixels);
      const frontendPreviewUrl = URL.createObjectURL(finishedCroppedFile);

      appendImageField({
        id: activeItem.id,
        url: frontendPreviewUrl,
        isPrimary: attachedImages.length === 0,
        altText: ""
      });

      advanceOrCloseCropModal();
    } catch {
      toast.error("Image optimization failed. Please retry.");
    }
  };

  const setPrimaryImageIndex = (targetIndex: number) => {
    watchedImages.forEach((_, index: number) => {
      setValue(`images.${index}.isPrimary`, index === targetIndex);
    });
  };

  const onSubmit = async (data: UpdateAuctionItemDTO) => {
    if (!id) return;
    try {
      setIsFormSubmitting(true);

      const imagesArray = (data.images || []) as IFormImage[];
      const activeFields = attachedImages;

      const secureUploadPipelines = imagesArray.map(async (img, idx) => {
        const isNewLocalPreview = img.url.startsWith("blob:");

        if (!isNewLocalPreview) {
          return {
            id: img.id || activeFields[idx]?.id || crypto.randomUUID(),
            url: img.url,
            isPrimary: img.isPrimary || false,
            altText: img.altText || `${data.title || "Asset"} viewport ${idx}`
          };
        }

        const res = await fetch(img.url);
        const blob = await res.blob();
        const fileInstance = new File([blob], `item_photo_${idx}.jpg`, { type: blob.type });

        const secureCdnUrl = await uploadservice.uploadSecurely(fileInstance);
        return {
          id: img.id || activeFields[idx]?.id || crypto.randomUUID(),
          url: secureCdnUrl,
          isPrimary: img.isPrimary || false,
          altText: img.altText || `${data.title || "Asset"} viewport ${idx}`
        };
      });

      const uploadedImagesPayload = await Promise.all(secureUploadPipelines);

      const finalAuctionPayload = {
        ...data,
        images: uploadedImagesPayload
      };

      const result = await auctionItemMangementService.updateAuction(id, finalAuctionPayload);

      if (result.success) {
        toast.success(itemStatus === AuctionItemStatus.REJECTED
          ? "Item parameters updated and resubmitted successfully!"
          : "Auction specifications updated successfully!"
        );

        imagesArray.forEach((img) => {
          if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
        });

        navigate(-1);
      } else {
        toast.error(result.message || "Failed to update auction");
      }
    } catch {
      toast.error("Failed to update auction configuration parameters.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-xl text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]/20 focus:border-[#2F6FED] transition-all placeholder:text-[#94A3B8]";
  const labelStyle = "block text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1";
  const errorStyle = "text-[#EF4444] text-[9px] font-bold uppercase mt-1";

  // Safe helper function for rendering RHF field errors without ReactNode compiler errors
  const renderError = (error: unknown) => {
    if (!error) return null;
    if (typeof error === "object" && "message" in error && typeof error.message === "string") {
      return <p className={errorStyle}>{error.message}</p>;
    }
    return null;
  };

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-[#2F6FED]" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#475569]">Hydrating System Data Layers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 px-6 pt-10 font-sans">

      {itemStatus === AuctionItemStatus.REJECTED && rejectionReason && (
        <div className="mb-8 border-2 border-[#EF4444] bg-[#FEF2F2] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <AlertOctagon className="text-[#EF4444] shrink-0 mt-0.5" size={22} />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#991B1B]">Listing Rejection Audit Log</h3>
            <p className="text-xs font-semibold text-[#B91C1C] mt-1 bg-white/60 p-3 rounded-lg border border-[#FEE2E2] font-mono">
              &quot;{rejectionReason}&quot;
            </p>
            <p className="text-[10px] font-bold uppercase text-[#7F1D1D] mt-3 tracking-wider">
              Note: Updating item parameters and re-publishing will clear flags and cue structural verification pipelines.
            </p>
          </div>
        </div>
      )}

      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
          {itemStatus === AuctionItemStatus.REJECTED ? "Resubmit Lot Parameters" : "Modify Auction Specifications"}
        </h1>
        <p className="text-[#475569] mt-2 text-[11px] font-medium uppercase tracking-wider">
          Adjust parameters, shift tracking boundaries, or expand multi-tenant production assets.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F5F7FB]">
            <Gavel size={18} className="text-[#2F6FED]" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#0F172A]">Listing Content Parameters</h2>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Auction Lot Title</label>
            <input {...register("title")} placeholder="Ex: Vintage Leather Chronograph Watch" className={inputStyle} />
            {renderError(errors.title)}
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
              {renderError(errors.type)}
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Item Specifications & Overview</label>
            <textarea rows={4} {...register("description")} className={`${inputStyle} resize-none`} />
            {renderError(errors.description)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F5F7FB]">
            <ImageIcon size={18} className="text-[#2F6FED]" />
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#0F172A]">Asset Galleries</h2>
          </div>

          <div className="relative border-2 border-dashed rounded-xl p-6 border-[#E2E8F0] hover:border-[#2F6FED] transition-all text-center">
            <input type="file" multiple accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <p className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Add Alternative Demonstration Assets</p>
            <p className="text-[9px] text-[#94A3B8] uppercase mt-1">New selections enter optimization nodes before mounting payload arrays.</p>
          </div>
          {renderError(errors.images)}

          {watchedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {watchedImages.map((imgField: IFormImage, idx: number) => (
                <div key={imgField.id || idx} className={`relative rounded-xl border p-2 transition-all group ${imgField.isPrimary ? "border-[#2F6FED] bg-[#2F6FED]/5" : "border-[#E2E8F0]"}`}>
                  <img src={imgField.url} alt="Item configuration layout" className="w-full h-28 object-cover rounded-lg bg-slate-50" />

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
                <input type="number" {...register("startingPrice")} className={inputStyle} />
                {renderError(errors.startingPrice)}
              </div>
              <div>
                <label className={labelStyle}>Reserve Floor Margin</label>
                <input type="number" {...register("reservePrice")} className={inputStyle} />
                {renderError(errors.reservePrice)}
              </div>
            </div>
            <div>
              <label className={labelStyle}>Minimum Scale Increment Step</label>
              <input type="number" {...register("minimumIncrement")} className={inputStyle} />
              {renderError(errors.minimumIncrement)}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Percent size={17} className="text-[#2F6FED]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">Premiums & Protections</h2>
            </div>
            <div>
              <label className={labelStyle}>Buyer Premium Scale Percentage</label>
              <input type="number" step="0.01" {...register("buyerPremiumPercent")} className={inputStyle} />
              {renderError(errors.buyerPremiumPercent)}
            </div>
            <div>
              <label className={labelStyle}>Sniping Protection Extension Windows</label>
              <input type="number" {...register("snipingProtectionMinutes")} className={inputStyle} />
              {renderError(errors.snipingProtectionMinutes)}
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
              {renderError(errors.startTime)}
            </div>
            <div>
              <label className={labelStyle}>Closing Window Termination End</label>
              <input type="datetime-local" {...register("endTime")} className={inputStyle} />
              {renderError(errors.endTime)}
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
            <input type="number" {...register("shippingCost")} className={inputStyle} />
            {renderError(errors.shippingCost)}
          </div>
          <div>
            <label className={labelStyle}>Shipping Terms Conditions Specifications</label>
            <textarea rows={2} {...register("shippingTerms")} className={`${inputStyle} resize-none`} />
            {renderError(errors.shippingTerms)}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 mt-12">
          <button type="submit" disabled={isFormSubmitting} className="w-full md:w-auto bg-[#2F6FED] text-white px-20 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#2557C8] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50">
            {isFormSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Publishing Updates to Cluster Networks...</span>
              </>
            ) : itemStatus === AuctionItemStatus.REJECTED ? "Resubmit for System Inspection" : "Commit Specification Updates"}
          </button>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Multi-Tenant System Note: Modifications pass back down inspection logs instantly.</span>
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
                aspect={4 / 3}
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

export default TenantEditAuctionPage;