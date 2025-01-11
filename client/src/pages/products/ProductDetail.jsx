import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import axiosInstance from '../../utils/axios';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedProduct, isLoading } = useSelector((state) => state.products);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [categoryNames, setCategoryNames] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        dispatch(getProductById(id));
    }, [dispatch, id]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/categories');
                const categoryMap = response.data.reduce((acc, category) => {
                    acc[category._id] = category.name;
                    return acc;
                }, {});
                setCategoryNames(categoryMap);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            if (selectedProduct.variants?.length > 0) {
                setSelectedVariant(selectedProduct.variants[0]);
            }
            if (selectedProduct.images?.length > 0) {
                setSelectedImage(selectedProduct.images[0].url);
            }
        }
    }, [selectedProduct]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (selectedVariant?.stock || 0)) {
            setQuantity(value);
        }
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        setQuantity(1); // Reset quantity when variant changes
    };

    const handleAddToCart = async () => {
        try {
            await dispatch(addToCart({
                product_id: selectedProduct._id,
                variant_id: selectedVariant.sku,
                quantity
            })).unwrap();
            alert('Product added to cart successfully!');
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

    if (!selectedProduct) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
                <button
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                    onClick={() => navigate('/products')}
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Product Images */}
                <div className="md:w-1/2">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img
                            src={selectedImage || selectedProduct.images?.[0]?.url || '/placeholder.jpg'}
                            alt={selectedProduct.name}
                            className="w-full h-96 object-cover"
                        />
                        {/* Thumbnail Images */}
                        <div className="flex gap-2 p-4 overflow-x-auto">
                            {selectedProduct.images?.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={`${selectedProduct.name} ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 
                                        ${selectedImage === image.url ? 'border-indigo-600' : 'border-transparent'}`}
                                    onClick={() => setSelectedImage(image.url)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="md:w-1/2">
                    <nav className="text-sm mb-4">
                        <button
                            onClick={() => navigate('/products')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Products
                        </button>
                        {' / '}
                        <span className="text-gray-900">{selectedProduct.name}</span>
                    </nav>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {selectedProduct.name}
                    </h1>

                    <div className="text-2xl text-indigo-600 font-bold mb-4">
                        ${selectedProduct.price}
                    </div>

                    <p className="text-gray-600 mb-6">
                        {selectedProduct.description}
                    </p>

                    {/* Variants */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Variants</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProduct.variants.map((variant) => (
                                    <button
                                        key={variant.sku}
                                        className={`px-4 py-2 rounded-md ${
                                            selectedVariant?.sku === variant.sku
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => handleVariantChange(variant)}
                                        disabled={variant.stock === 0}
                                    >
                                        {variant.size} - {variant.color}
                                        {variant.stock === 0 && ' (Out of Stock)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity
                        </label>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1 border rounded-md hover:bg-gray-100"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={selectedVariant?.stock || 1}
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                onClick={() => setQuantity(prev => Math.min(selectedVariant?.stock || 1, prev + 1))}
                                className="px-3 py-1 border rounded-md hover:bg-gray-100"
                                disabled={quantity >= (selectedVariant?.stock || 1)}
                            >
                                +
                            </button>
                            <span className="text-sm text-gray-500">
                                {selectedVariant?.stock} available
                            </span>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 
                            disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    {/* Categories */}
                    {selectedProduct.categories?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProduct.categories.map((categoryId, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {categoryNames[categoryId] || 'Loading...'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;