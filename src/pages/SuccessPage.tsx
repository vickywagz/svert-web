import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

export default function SuccessPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDate] = useState(new Date());

  // Paystack sends reference in URL params
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');

  useEffect(() => {
    // clear any remaining cart state
    window.scrollTo(0, 0);
  }, []);

  const formattedDate = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[orderDate.getMonth()]} ${orderDate.getDate()}, ${orderDate.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-8 px-4">
      <div className="w-full max-w-lg space-y-4">

        {/* Success card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          {/* Checkmark icon */}
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-text-primary mb-2">
            Payment Successful!
          </h1>
          <p className="text-text-secondary text-sm">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        {/* Order status card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-text-secondary tracking-wider mb-3">
            ORDER STATUS
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm font-semibold text-primary">Paid</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Order Date</p>
            <p className="text-sm font-semibold text-text-primary">
              {formattedDate()}
            </p>
          </div>
          {reference && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-text-secondary mb-1">
                Payment Reference
              </p>
              <p className="text-xs font-mono text-primary break-all">
                {reference}
              </p>
            </div>
          )}
        </div>

        {/* Access info card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-text-secondary tracking-wider mb-3">
            ACCESS INFO
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-bg rounded-lg flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">
              Check your email for order confirmation
            </p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => navigate(`/m/${username}`)}
          className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-base hover:bg-primary-light transition-colors shadow-lg"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate(`/m/${username}`)}
          className="w-full py-3 flex items-center justify-center gap-2 text-primary font-semibold text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Store
        </button>

        {/* Powered by */}
        <p className="text-center text-xs text-text-secondary pb-4">
          Powered by{' '}
          <span className="text-primary font-semibold">Svert</span>
        </p>
      </div>
    </div>
  );
}