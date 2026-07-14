import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation  } from "react-router-dom";
import { useCart } from "../context/useCart";

import {
  sendOtp,
  verifyOtp,
  createOrder,
  initiatePayment,
} from "../services/api";

export default function CheckoutPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const location = useLocation();
const merchantId = (location.state as { merchantId: string })?.merchantId;

  // redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate(`/m/${username}`);
    }
  }, [items, navigate, username]);

  // countdown timer
  useEffect(() => {
    if (!otpSent || otpVerified) return;
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpSent, otpVerified, countdown]);

  const formatCountdown = () => {
    const m = Math.floor(countdown / 60)
      .toString()
      .padStart(2, "0");
    const s = (countdown % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendOtp = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSendingOtp(true);
    try {
      await sendOtp(customerEmail);
      setOtpSent(true);
      setCountdown(120);
    } catch {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // auto verify when all filled
    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setVerifyingOtp(true);
    setError("");
    try {
      await verifyOtp(customerEmail, code);
      setOtpVerified(true);
    } catch {
      setError("Invalid or expired code. Please try again.");
      setOtpCode(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!customerName || !customerEmail || !customerAddress) {
      setError("Please fill in all fields");
      return;
    }
    if (!otpVerified) {
      setError("Please verify your email first");
      return;
    }

    setError("");
    setPlacingOrder(true);

    try {
      const order = await createOrder({
        customerName,
        customerEmail,
        customerAddress,
        otpVerified: true,
         merchantId,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      });

      const payment = await initiatePayment(order.id);
      clearCart();
      window.location.href = payment.authorization_url;
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const canPay =
    customerName && customerEmail && customerAddress && otpVerified;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/m/${username}`)}
            className="text-primary"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="font-bold text-text-primary text-lg">Checkout</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Checkout form card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Secure Checkout
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* Full name */}
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Email + verify */}
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-1 block">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtpCode(["", "", "", "", "", ""]);
                }}
                placeholder="john@example.com"
                disabled={otpVerified}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"
              />
              {!otpVerified && (
                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp || (otpSent && countdown > 0)}
                  className="px-4 py-3 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary-bg transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sendingOtp
                    ? "..."
                    : otpSent && countdown > 0
                      ? "Resend"
                      : "Verify Email"}
                </button>
              )}
              {otpVerified && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-600 text-sm font-semibold">
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* OTP input */}
          {otpSent && !otpVerified && (
            <div className="mb-4 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-secondary tracking-wider">
                  VERIFICATION CODE
                </span>
                <span className="text-xs font-semibold text-primary">
                  {formatCountdown()}
                </span>
              </div>
              <div className="flex gap-2 justify-center mb-3">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 border-2 border-gray-200 rounded-lg text-center text-lg font-bold focus:outline-none focus:border-primary"
                  />
                ))}
              </div>
              {verifyingOtp && (
                <p className="text-center text-sm text-text-secondary">
                  Verifying...
                </p>
              )}
              <p className="text-center text-xs text-text-secondary">
                We've sent a 6-digit code to your email. Please enter it above.
              </p>
            </div>
          )}

          {/* Delivery address */}
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-1 block">
              Delivery Address
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="123 Commerce Way, Suite 400, City, Country"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Security note */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex gap-2 items-start">
            <svg
              className="w-4 h-4 text-primary mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs text-green-700">
              Your payment information is encrypted and processed securely. We
              never store your card details.
            </p>
          </div>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-lg font-bold text-text-primary">
              Order Summary
            </h2>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.product.photoUrl ? (
                    <img
                      src={item.product.photoUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary text-sm">
                    {item.product.name}
                  </p>
                  <p className="text-text-secondary text-xs">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-text-primary text-sm">
                  ₦
                  {(
                    Number(item.product.price) * item.quantity
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary text-sm">Subtotal</span>
              <span className="text-text-primary text-sm font-medium">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="font-bold text-text-primary">Total</span>
              <span className="font-bold text-primary text-lg">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Confirm & Pay button */}
        <button
          onClick={handleConfirmAndPay}
          disabled={!canPay || placingOrder}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            canPay && !placingOrder
              ? "bg-primary text-white hover:bg-primary-light shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {placingOrder ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Confirm & Pay</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
