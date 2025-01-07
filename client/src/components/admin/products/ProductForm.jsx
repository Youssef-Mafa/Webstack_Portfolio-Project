import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProductForm = ({ product, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categories: [],
    variants: [{ sku: '', size: '', color: '', stock: 0 }],
    images: [{ url: '', is_primary: true }]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        categories: product.categories || [],
        variants: product.variants || [{ sku: '', size: '', color: '', stock: 0 }],
        images: product.images || [{ url: '', is_primary: true }]
      });
    }
  }, [product]);

  const validate = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Product name is required';
      case 'price':
        return value > 0 ? '' : 'Price must be greater than 0';
      case 'description':
        return value.trim() ? '' : 'Description is required';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validate(name, value)
    }));
  };

  const handleCategorySearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm)
  );

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((image, i) =>
        i === index ? { ...image, [field]: value } : image
      )
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', size: '', color: '', stock: 0 }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', is_primary: false }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validate('name', formData.name),
      price: validate('price', formData.price),
      description: validate('description', formData.description)
    };

    // Validate variants
    const hasValidVariants = formData.variants.every(variant => 
      variant.sku && variant.size && variant.color && variant.stock >= 0
    );

    if (!hasValidVariants) {
      newErrors.variants = 'All variant fields must be filled out';
    }

    // Validate images
    const hasValidImages = formData.images.every(image => image.url);
    if (!hasValidImages) {
      newErrors.images = 'All image URLs must be filled out';
    }

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h2 className="text-xl font-bold">
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && touched.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.price && touched.price ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.price && touched.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Categories
        </label>
        
        {/* Category Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleCategorySearch}
            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
          {filteredCategories.map((category) => (
            <div key={category._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`category-${category._id}`}
                checked={formData.categories.includes(category._id)}
                onChange={() => handleCategoryToggle(category._id)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label 
                htmlFor={`category-${category._id}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>

        {/* Selected Categories Preview */}
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-2">Selected Categories:</p>
          <div className="flex flex-wrap gap-2">
            {formData.categories.map((categoryId) => {
              const category = categories.find(c => c._id === categoryId);
              return category ? (
                <span
                  key={categoryId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(categoryId)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Variants */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Variants</h3>
          <button
            type="button"
            onClick={addVariant}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Add Variant
          </button>
        </div>
        
        {errors.variants && (
          <p className="text-sm text-red-500 mb-2">{errors.variants}</p>
        )}

        <div className="space-y-4">
          {formData.variants.map((variant, index) => (
            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Size"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                  min="0"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {formData.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Images</h3>
          <button
            type="button"
            onClick={addImage}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Add Image
          </button>
        </div>

        {errors.images && (
          <p className="text-sm text-red-500 mb-2">{errors.images}</p>
        )}
        
        <div className="space-y-4">
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-md">
              <input
                type="text"
                placeholder="Image URL"
                value={image.url}
                onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <label className="flex items-center">
                <input
                  type="radio"
                  name="primary_image"
                  checked={image.is_primary}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      images: prev.images.map((img, i) => ({
                        ...img,
                        is_primary: i === index
                      }))
                    }));
                  }}
                  className="mr-2"
                />
                Primary
              </label>
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

ProductForm.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    categories: PropTypes.arrayOf(PropTypes.string),
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        sku: PropTypes.string,
        size: PropTypes.string,
        color: PropTypes.string,
        stock: PropTypes.number
      })
    ),
    images: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        is_primary: PropTypes.bool
      })
    )
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ProductForm;