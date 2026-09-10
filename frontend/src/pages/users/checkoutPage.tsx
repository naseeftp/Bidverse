import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { CheckoutDetailsResponseDTO } from "../../types/chekout.dto";
import checkoutService from "../../services/checkout.service";
import toast from "react-hot-toast";
import {
  HiOutlineMapPin as MapPinIcon,
  HiOutlinePlus as PlusIcon,
  HiOutlineCheckCircle as CheckCircleIcon,
  HiOutlineClock as ClockIcon,
  HiOutlineShieldCheck as ShieldCheckIcon,
  HiOutlineArrowPath as ArrowPathIcon
} from "react-icons/hi2";
import orderService from "../../services/order.service";
import { openRazorpayCheckout } from "../../utils/razorpay";
import paymentService from "../../services/payment.service";

const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<CheckoutDetailsResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCheckoutDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await checkoutService.getCheckoutDetails(id);
      if (response.success && response.data) {
        setDetails(response.data);

        const addresses = response.data.addresses || [];
        const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to fetch Checkout details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCheckoutDetails();
  }, [fetchCheckoutDetails]);

  const handleAddNewAddress = () => {
    navigate("/addresses", { state: { returnTo: `/check-out/${id}` } });
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (!details || !id) return;

    setIsSubmitting(true);
    try {
      const response = await orderService.placeOrder({
        paymentRequestId: id,
        addressId: selectedAddressId
      })
        if (!response.success || !response.data) {
            toast.error(response.message || "Failed to initiate payment");
            setIsSubmitting(false);
            return;
        }
        openRazorpayCheckout(
            {
                orderId: response.data.orderId,
                amount: response.data.amount,
                currency: response.data.currency,
                keyId: response.data.keyId
            },
            async (paymentResponse) => {
                try {
                    await paymentService.verifyPayment({
                        razorpayOrderId: paymentResponse.razorpay_order_id,
                        razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        razorpaySignature: paymentResponse.razorpay_signature,
                    });
                    toast.success("Payment successful! Order placed.");
                    navigate("/my-orders"); 
                } catch {
                    toast.error("Payment verification failed.");
                } finally {
                    setIsSubmitting(false);
                }
            },
            () => {
                setIsSubmitting(false);
            }
        );

    } catch {
      toast.error("Payment initialization failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex flex-col items-center justify-center p-6">
        <ArrowPathIcon className="w-10 h-10 text-[#C9653B] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#1F1F1F]">Loading checkout details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-xl border border-[#E6E0DA] max-w-md w-full shadow-sm">
          <h2 className="text-lg font-bold text-[#1F1F1F]">Checkout Information Unavailable</h2>
          <p className="text-xs text-[#6B6B6B] mt-2 mb-6">
            We couldn't retrieve the payment request details. It may have expired or already been processed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-[#C9653B] text-white font-bold text-xs rounded-lg hover:bg-[#b0542e] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { paymentRequest, auctionItem, addresses, pricing } = details;
  const currencySymbol = pricing.currency === "INR" ? "₹" : "$";

  return (
    <div className="min-h-screen bg-[#FFF9F4] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-[#E6E0DA] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F]">
              Checkout
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Complete your auction win payment to initiate shipping
            </p>
          </div>

          {paymentRequest.dueDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
              <ClockIcon className="w-4 h-4 text-amber-600" />
              <span>Due Date: {new Date(paymentRequest.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-[#E6E0DA] shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-4">
                Won Auction Item
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={auctionItem.imageUrl}
                  alt={auctionItem.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-[#E6E0DA] bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1F1F1F]">
                    {auctionItem.title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-2 leading-relaxed">
                    {auctionItem.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-max">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Reserve Met & Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E6E0DA] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#1F1F1F]">
                    Select Delivery Address
                  </h2>
                  <p className="text-xs text-[#6B6B6B]">
                    Choose where you want your item delivered
                  </p>
                </div>
                {addresses.length > 0 && (
                  <button
                    onClick={handleAddNewAddress}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9653B] hover:text-[#b0542e] transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-[#E6E0DA] rounded-xl bg-[#FFF9F4]/50">
                  <MapPinIcon className="w-10 h-10 text-[#6B6B6B] mx-auto mb-2 opacity-60" />
                  <h3 className="text-sm font-bold text-[#1F1F1F]">
                    No delivery addresses found
                  </h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 mb-4 max-w-xs mx-auto">
                    You need to add a shipping address before completing your payment.
                  </p>
                  <button
                    onClick={handleAddNewAddress}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9653B] text-white rounded-lg text-xs font-bold hover:bg-[#b0542e] transition-all shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id;
                    return (
                      <label
                        key={address.id}
                        className={`block relative rounded-xl border p-4 cursor-pointer transition-all ${isSelected
                            ? "border-[#C9653B] bg-[#FFF9F4]/40 ring-1 ring-[#C9653B]"
                            : "border-[#E6E0DA] bg-white hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingAddress"
                            value={address.id}
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 h-4 w-4 text-[#C9653B] border-[#E6E0DA] focus:ring-[#C9653B]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[#1F1F1F]">
                                {address.recipientName}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[#6B6B6B] font-medium capitalize">
                                {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs px-2 py-0.5 rounded bg-[#C9653B]/10 text-[#C9653B] font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                              {address.fullAddress},{" "}
                              {address.landMark ? `${address.landMark}, ` : ""}
                              {address.city}, {address.state} - {address.pincode},{" "}
                              {address.country}
                            </p>
                            <p className="text-xs text-[#1F1F1F] mt-1 font-medium">
                              Phone: {address.phone}
                              {address.altPhone ? ` | Alt: ${address.altPhone}` : ""}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl p-6 border border-[#E6E0DA] shadow-sm sticky top-8">
              <h2 className="text-base font-bold text-[#1F1F1F] border-b border-[#E6E0DA] pb-3 mb-4">
                Payment Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Winning Bid Amount</span>
                  <span className="font-semibold text-[#1F1F1F]">
                    {currencySymbol}{pricing.itemAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#1F1F1F]">
                    {pricing.shippingCost === 0
                      ? "FREE"
                      : `${currencySymbol}${pricing.shippingCost.toLocaleString()}`}
                  </span>
                </div>

                <div className="border-t border-[#E6E0DA] pt-3 mt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-[#1F1F1F]">Total Amount</span>
                    <p className="text-xs text-[#6B6B6B]">Includes applicable taxes</p>
                  </div>
                  <span className="text-2xl font-black text-[#C9653B]">
                    {currencySymbol}{pricing.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!selectedAddressId || isSubmitting}
                type="button"
                className={`w-full mt-6 py-3 px-4 rounded-xl font-bold text-white text-sm shadow-md transition-all flex items-center justify-center gap-2 ${!selectedAddressId || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-[#C9653B] hover:bg-[#b0542e] active:scale-[0.99]"
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Pay {currencySymbol}{pricing.totalAmount.toLocaleString()} Now</span>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-[#E6E0DA] flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Encrypted & Secured Payment Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;