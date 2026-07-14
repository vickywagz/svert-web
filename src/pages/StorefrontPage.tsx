import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStorefront } from "../services/api";
import { useCart } from "../context/useCart";
import type { Merchant, Product } from "../types";

export default function StorefrontPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;
    getStorefront(username)
      .then(setMerchant)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Store not found
          </h1>
          <p className="text-text-secondary">
            This store doesn't exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {merchant.businessName[0].toUpperCase()}
              </span>
            </div>
            <h1 className="font-semibold text-text-primary text-base">
              {merchant.businessName}
            </h1>
          </div>
          <button className="p-2 text-text-secondary hover:text-primary transition-colors">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Merchant hero */}
        <div className="bg-primary-bg rounded-2xl my-4 p-6 text-center">
          <h2 className="text-xl font-bold text-primary mb-2">
            Discover {merchant.businessName}
          </h2>
          <p className="text-text-secondary text-sm">
            Browse and shop quality products from {merchant.businessName}
          </p>
        </div>

        {/* Products grid */}
        {merchant.products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No products yet
            </h3>
            <p className="text-text-secondary text-sm">
              This store hasn't added any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {merchant.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() =>
                navigate(`/m/${username}/checkout`, {
                  state: { merchantId: merchant.id },
                })
              }
              className="w-full bg-primary text-white rounded-2xl py-4 flex items-center justify-between px-6 shadow-lg hover:bg-primary-light transition-colors"
            >
              <span className="bg-white text-primary text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                {totalItems}
              </span>
              <span className="font-semibold text-base">ITEMS</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">CONTINUE</span>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Powered by footer */}
      <div className="text-center py-6">
        <p className="text-text-secondary text-xs">
          Powered by <span className="text-primary font-semibold">Svert</span>
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Product image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.photoUrl ? (
          <img
            src={product.photoUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-300"
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

      {/* Product info */}
      <div className="p-3">
        <h3 className="font-semibold text-text-primary text-sm leading-tight mb-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-sm">
            ₦{Number(product.price).toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              added
                ? "bg-success scale-90"
                : "bg-primary hover:bg-primary-light"
            }`}
          >
            {added ? (
              <svg
                className="w-4 h-4 text-white"
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
            ) : (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-16H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
