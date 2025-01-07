import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile, reset } from '../../features/profile/profileSlice';
import ChangePasswordForm from './ChangePasswordForm';
import OrderHistory from './OrderHistory';

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.profile
    );
    const { user } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        addresses: []
    });
    const [newAddress, setNewAddress] = useState({
        street_address: '',
        city: '',
        zip_code: ''
    });

    useEffect(() => {
        if (user) {
            dispatch(getProfile());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || '',
                email: profile.email || '',
                full_name: profile.full_name || '',
                addresses: profile.addresses || []
            });
        }
    }, [profile]);

    useEffect(() => {
        if (isError) {
            alert(message);
        }

        if (isSuccess && !isLoading) {
            setIsEditing(false);
        }

        dispatch(reset());
    }, [isError, isSuccess, isLoading, message, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        if (formData.addresses.length >= 2) {
            alert('Maximum of 2 addresses allowed');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            addresses: [...prev.addresses, newAddress]
        }));
        setNewAddress({
            street_address: '',
            city: '',
            zip_code: ''
        });
    };

    const handleRemoveAddress = (index) => {
        setFormData((prev) => ({
            ...prev,
            addresses: prev.addresses.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProfile(formData));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            Change Password
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Addresses
                            </h2>
                            
                            {/* Existing Addresses */}
                            <div className="space-y-4 mb-6">
                                {formData.addresses.map((address, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                                    >
                                        <div>
                                            <p>{address.street_address}</p>
                                            <p className="text-sm text-gray-600">
                                                {address.city}, {address.zip_code}
                                            </p>
                                        </div>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAddress(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add New Address Form */}
                            {isEditing && formData.addresses.length < 2 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-md font-medium text-gray-900 mb-4">
                                        Add New Address
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <input
                                                type="text"
                                                name="street_address"
                                                value={newAddress.street_address}
                                                onChange={handleAddressChange}
                                                placeholder="Street Address"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="city"
                                                value={newAddress.city}
                                                onChange={handleAddressChange}
                                                placeholder="City"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="zip_code"
                                                value={newAddress.zip_code}
                                                onChange={handleAddressChange}
                                                placeholder="ZIP Code"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <button
                                                type="button"
                                                onClick={handleAddAddress}
                                                className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                                            >
                                                Add Address
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    {isEditing && (
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="mt-8">
                <OrderHistory />
            </div>

            {/* Password Change Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;