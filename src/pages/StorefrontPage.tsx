import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStorefront } from "../services/api";
import { useCart } from "../context/useCart";
import type { Merchant, Product } from "../types";

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { addToCart, totalItems, items, totalAmount, updateQuantity, removeFromCart } = useCart();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);

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

  // get unique categories from products
  const categories = [
    'All',
    ...new Set(
      merchant.products
        .filter(p => p.category !== null)
        .map(p => p.category!.name)
    ),
  ];

  // filter by both search and category
  const filteredProducts = merchant.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        </div>
        {/* Search bar */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-gray-50"
          />
        </div>
        {/* Category filter tabs */}
        {categories.length > 1 && (
          <div className="max-w-lg mx-auto px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-secondary border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No results found
            </h3>
            <p className="text-text-secondary text-sm">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart drawer */}
      {showCart && totalItems > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-20 px-4">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-text-primary">Your Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-text-secondary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.photoUrl ? (
                      <img
                        src={item.product.photoUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-primary">
                      ₦{Number(item.product.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-text-primary font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center ml-1"
                    >
                      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="text-sm text-text-secondary">Total</span>
              <span className="text-sm font-bold text-primary">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
          <div className="max-w-lg mx-auto flex gap-2">
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-white border border-primary rounded-2xl py-4 px-4 flex items-center gap-2 shadow-lg"
            >
              <span className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItems}
              </span>
            </button>
            <button
              onClick={() => {
                setShowCart(false);
                navigate(`/m/${username}/checkout`, {
                  state: { merchantId: merchant.id },
                });
              }}
              className="flex-1 bg-primary text-white rounded-2xl py-4 flex items-center justify-between px-6 shadow-lg hover:bg-primary-light transition-colors"
            >
              <span className="font-semibold text-base">CONTINUE</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Powered by footer */}
      <div className="text-center py-6">
        <p className="text-text-secondary text-xs">
          Powered by{' '}
          <span className="text-primary font-semibold">Svert</span>
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
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.photoUrl ? (
          <img
            src={product.photoUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category badge on image */}
        {product.category && (
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {product.category.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-text-primary text-sm leading-tight mb-1">
          {product.name}
        </h3>
        {/* Description */}
        {product.description && (
          <p className="text-text-secondary text-xs mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-sm">
            ₦{Number(product.price).toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              added ? "bg-success scale-90" : "bg-primary hover:bg-primary-light"
            }`}
          >
            {added ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-16H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}