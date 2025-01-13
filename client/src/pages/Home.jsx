import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../features/products/productSlice';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.products);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    dispatch(getProducts({ limit: 6 }));
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, 6));
    }
  }, [products]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative bg-gray-900 h-[600px]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/hero.jpg"
            alt="Hero background"
            className="w-full h-full object-cover object-center opacity-50"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center text-white space-y-8">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Welcome to Our Store
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Discover our amazing collection of products with great deals and exclusive offers.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-indigo-600 px-8 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors"
              >
                Shop Now
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="bg-white text-gray-900 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Categories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-4 text-gray-500">Check out our most popular items</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <img
                    src={product.images[0]?.url || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-indigo-600">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800"
          >
            View All Products
            <svg
              className="ml-2 w-5 h-5"
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
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 text-indigo-600">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over $100</p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 text-indigo-600">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">30-day money-back guarantee</p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 text-indigo-600">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Shopping</h3>
              <p className="text-gray-600">100% secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;