import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaUpload, FaTrash } from "react-icons/fa";
import uploadservice from "../../services/uploadservice";
import orderService from "../../services/order.service";
import { ReturnReason } from "../../types/order.dto";

interface Props {
    orderId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const RejectOrderModal: React.FC<Props> = ({ orderId, onClose, onSuccess }) => {
    const [reason, setReason] = useState<ReturnReason | "">("");
    const [description, setDescription] = useState("");
    const [proofFiles, setProofFiles] = useState<{ file: File; previewUrl: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selected = Array.from(e.target.files).map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        setProofFiles((prev) => [...prev, ...selected]);
        e.target.value = "";
    };

    const removeProof = (idx: number) => {
        URL.revokeObjectURL(proofFiles[idx].previewUrl);
        setProofFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (!reason) return toast.error("Select a reason");
        if (description.trim().length < 10) return toast.error("Please describe the issue (min 10 chars)");
        if (proofFiles.length === 0) return toast.error("Upload at least one proof image");

        setIsSubmitting(true);
        try {
            const uploadedUrls = await Promise.all(
                proofFiles.map((p) => uploadservice.uploadSecurely(p.file))
            );

            const response = await orderService.submitReturn(orderId, {
                reason,
                description: description.trim(),
                proofs: uploadedUrls
            });

            if (response.success) {
                toast.success(response.message);
                proofFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                onSuccess();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error("Failed to submit return request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-[#E6E0DA] rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-base font-black uppercase tracking-wide text-[#1F1F1F]">
                        Request Return
                    </h3>
                    <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1F1F1F] p-1 cursor-pointer">
                        <FaTimes size={14} />
                    </button>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                        Reason
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value as ReturnReason)}
                        className="w-full border border-[#E2E8F0] px-3 py-2.5 rounded-lg text-sm"
                    >
                        <option value="">Select a reason</option>
                        {Object.values(ReturnReason).map((r) => (
                            <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                        Describe the issue
                    </label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's wrong with the item?"
                        className="w-full border border-[#E2E8F0] px-3 py-2.5 rounded-lg text-sm resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                        Proof Photos
                    </label>
                    <div className="relative border-2 border-dashed rounded-xl p-4 border-[#E2E8F0] hover:border-[#C9653B] transition-all text-center">
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FaUpload className="mx-auto text-[#94A3B8] mb-1" size={16} />
                        <p className="text-[10px] font-bold text-[#475569] uppercase">Upload photos as evidence</p>
                    </div>

                    {proofFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {proofFiles.map((p, idx) => (
                                <div key={idx} className="relative">
                                    <img src={p.previewUrl} className="w-full h-16 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeProof(idx)}
                                        className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1"
                                    >
                                        <FaTrash size={8} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E6E0DA]">
                    <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg border border-[#E6E0DA] text-xs font-bold uppercase text-[#6B6B6B]">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-rose-700 text-white text-xs font-black uppercase disabled:opacity-50">
                        {isSubmitting ? "Submitting..." : "Submit Return Request"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectOrderModal;