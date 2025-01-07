import { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../utils/axios';

const ChangePasswordForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await axiosInstance.put('/users/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            setSuccess('Password changed successfully');
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Close the form after a short delay
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            
            {error && (
                <div className="text-red-600 text-sm">{error}</div>
            )}
            
            {success && (
                <div className="text-green-600 text-sm">{success}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Current Password
                </label>
                <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    New Password
                </label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isLoading ? 'Changing...' : 'Change Password'}
                </button>
            </div>
        </form>
    );
};

// Add PropTypes validation
ChangePasswordForm.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default ChangePasswordForm;