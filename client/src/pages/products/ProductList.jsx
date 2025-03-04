import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProducts, setFilters, resetFilters } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import axiosInstance from '../../utils/axios';

const ProductList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { products, isLoading, filters, totalPages, currentPage } = useSelector(
        (state) => state.products
    );
    const { user } = useSelector((state) => state.auth);
    
    // Add categories state
    const [categories, setCategories] = useState([]);
    const [localFilters, setLocalFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Fetch products and categories when component mounts
    useEffect(() => {
        dispatch(getProducts({ page: currentPage, ...filters }));

        // Fetch categories
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [dispatch, currentPage, filters]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        dispatch(setFilters(localFilters));
        dispatch(getProducts({ page: 1, ...localFilters }));
    };

    const handleResetFilters = () => {
        setLocalFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: ''
        });
        dispatch(resetFilters());
        dispatch(getProducts({ page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(getProducts({ page: newPage, ...filters }));
        }
    };

    const navigateToProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleAddToCartClick = (product) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (product.variants && product.variants.length > 0) {
            setSelectedProduct(product);
            setSelectedVariant(product.variants[0]);
            setShowVariantModal(true);
        } else {
            // If no variants, add directly to cart
            handleAddToCart(product, product.variants[0], 1);
        }
    };

    const handleAddToCart = async (product, variant, qty) => {
        try {
            await dispatch(addToCart({
                product_id: product._id,
                variant_id: variant.sku,
                quantity: qty
            })).unwrap();
            
            setShowVariantModal(false);
            setSelectedProduct(null);
            setSelectedVariant(null);
            setQuantity(1);
            
            
        } catch (error) {
            alert(error.message || 'Failed to add product to cart');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className="md:w-1/4">
                    <div className="bg-white p-4 rounded-lg shadow sticky top-4">
                        <h2 className="text-lg font-semibold mb-4">Filters</h2>
                        
                        {/* Search */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                name="search"
                                value={localFilters.search}
                                onChange={handleInputChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Search products..."
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={localFilters.category}
                                onChange={handleInputChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price Range
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={localFilters.minPrice}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Min Price"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={localFilters.maxPrice}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Max Price"
                                />
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={handleApplyFilters}
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="md:w-3/4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div 
                                key={product._id} 
                                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div 
                                    className="cursor-pointer" 
                                    onClick={() => navigateToProduct(product._id)}
                                >
                                    <img
                                        src={product.images[0]?.url || '/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-300"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2 hover:text-indigo-600">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 mb-2 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {product.categories.map((categoryId) => {
                                                const category = categories.find(c => c._id === categoryId);
                                                return category ? (
                                                    <span
                                                        key={categoryId}
                                                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                                                    >
                                                        {category.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 pt-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-600 font-bold">${product.price}</span>
                                        <button
                                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors duration-300"
                                            onClick={() => handleAddToCartClick(product)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show message if no products found */}
                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-xl text-gray-600">No products found</h3>
                        </div>
                    )}

                    {/* Pagination */}
                    {products.length > 0 && (
                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Variant Selection Modal */}
            {showVariantModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">{selectedProduct.name}</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Variant
                            </label>
                            <select
                                className="w-full border rounded-md p-2"
                                value={selectedVariant?.sku || ''}
                                onChange={(e) => {
                                    const variant = selectedProduct.variants.find(
                                        v => v.sku === e.target.value
                                    );
                                    setSelectedVariant(variant);
                                }}
                            >
                                {selectedProduct.variants.map((variant) => (
                                    <option 
                                        key={variant.sku} 
                                        value={variant.sku}
                                        disabled={variant.stock === 0}
                                    >
                                        {variant.size} - {variant.color}
                                        {variant.stock === 0 ? ' (Out of Stock)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedVariant?.stock || 1}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 border rounded-md p-2"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                onClick={() => {
                                    setShowVariantModal(false);
                                    setSelectedProduct(null);
                                    setSelectedVariant(null);
                                    setQuantity(1);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={() => handleAddToCart(selectedProduct, selectedVariant, quantity)}
                                disabled={!selectedVariant || selectedVariant.stock === 0}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;