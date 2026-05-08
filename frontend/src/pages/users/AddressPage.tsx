import React, { useState } from "react";
import { useForm } from 'react-hook-form'
import { yupResolver } from "@hookform/resolvers/yup";
import addressService from "../../services/address.service";
import { X } from "lucide-react";
import { addressFormSchema } from "../../types/address.dto";
import type { addAddressDTO } from "../../types/address.dto";
import toast from "react-hot-toast";

const AddressPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(addressFormSchema),
        defaultValues: {
            isDefault: false
        }
    })
    const AddAddress = async (data: addAddressDTO) => {
        try {
            const result = await addressService.addAddress(data)
            if (result.success) {
                toast.success(result.message)
                setIsModalOpen(false)
                reset()
            } else {
                toast.error(result.message)
            }
        } catch {
            toast.error('Failed to add Address')
        }
    }
    return (
        <div className="p-6 bg-[#FFF9F4] min-h-screen">

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-[#1F1F1F]">Your Addresses</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#C9653B] text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-sm"
                >
                    Add Address +
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#E6E0DA]">

                        <div className="p-6 border-b border-[#E6E0DA] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#1F1F1F]">Add New Shipping Address</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#6B6B6B] hover:text-[#1F1F1F]">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(AddAddress)} className="p-8 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Recipient Name</label>
                                    <input {...register("recipientName")} className={`w-full p-3 border ${errors.recipientName ? 'border-red-400' : 'border-[#E6E0DA]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9653B]`} placeholder="John Doe" />
                                    {errors.recipientName && <p className="text-[#991B1B] text-xs mt-1">{errors.recipientName.message}</p>}
                                </div>


                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Primary Phone</label>
                                    <input {...register("phone")} className="w-full p-3 border border-[#E6E0DA] rounded-lg" placeholder="10 digits" />
                                    {errors.phone && <p className="text-[#991B1B] text-xs mt-1">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Alternative Phone (Optional)</label>
                                    <input {...register("altPhone")} className="w-full p-3 border border-[#E6E0DA] rounded-lg" placeholder="10 digits" />
                                </div>


                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Street Address</label>
                                    <textarea {...register("fullAddress")} rows={2} className="w-full p-3 border border-[#E6E0DA] rounded-lg" placeholder="House No, Building, Street Name" />
                                    {errors.fullAddress && <p className="text-[#991B1B] text-xs mt-1">{errors.fullAddress.message}</p>}
                                </div>


                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Pincode</label>
                                    <input {...register("pincode")} className="w-full p-3 border border-[#E6E0DA] rounded-lg" />
                                    {errors.pincode && <p className="text-[#991B1B] text-xs mt-1">{errors.pincode.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">City</label>
                                    <input {...register("city")} className="w-full p-3 border border-[#E6E0DA] rounded-lg" />
                                    {errors.city && <p className="text-[#991B1B] text-xs mt-1">{errors.city.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">State</label>
                                    <input
                                        {...register("state")}
                                        className={`w-full p-3 border ${errors.state ? 'border-red-400' : 'border-[#E6E0DA]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9653B]`}
                                        placeholder="California"
                                    />
                                    {errors.state && <p className="text-[#991B1B] text-xs mt-1">{errors.state.message}</p>}
                                </div>


                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Country</label>
                                    <input
                                        {...register("country")}
                                        className={`w-full p-3 border ${errors.country ? 'border-red-400' : 'border-[#E6E0DA]'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9653B]`}
                                        placeholder="USA"
                                    />
                                    {errors.country && <p className="text-[#991B1B] text-xs mt-1">{errors.country.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#6B6B6B] mb-1">Label</label>
                                    <select
                                        {...register("label")}
                                        className={`w-full p-3 border ${errors.label ? 'border-red-400' : 'border-[#E6E0DA]'} rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#C9653B]`}
                                    >
                                       
                                        <option value="home">Home</option>
                                        <option value="office">Office</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.label && <p className="text-[#991B1B] text-xs mt-1">{errors.label.message}</p>}
                                </div>


                                <div className="flex items-center gap-2 mt-8">
                                    <input type="checkbox" {...register("isDefault")} id="isDefault" className="accent-[#C9653B] w-4 h-4" />
                                    <label htmlFor="isDefault" className="text-sm font-bold text-[#1F1F1F]">Set as default address</label>
                                </div>
                            </div>


                            <div className="mt-10 flex gap-4 border-t border-[#E6E0DA] pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-lg font-bold text-[#6B6B6B] border border-[#E6E0DA] hover:bg-[#FFF9F4]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 rounded-lg font-bold text-white bg-[#C9653B] shadow-md hover:opacity-95"
                                >
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddressPage
