import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { verifyOTP, sendOTP } from '../../features/auth/authSlice';

const OTPVerification = ({ email, onClose }) => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            try {
                await dispatch(verifyOTP({ email, otp })).unwrap();
                onClose();
            } catch (error) {
                console.error('Verification failed:', error);
            }
        }
    };

    const handleResendCode = async () => {
        try {
            await dispatch(sendOTP(email)).unwrap();
            setTimer(300); // Reset timer to 5 minutes
            setCanResend(false);
            setOtp(''); // Clear OTP input
        } catch (error) {
            console.error('Failed to resend code:', error);
        }
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Email Verification
                </h2>
                <p className="text-gray-600">
                    Please enter the verification code sent to
                    <br />
                    <span className="font-medium text-gray-900">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit code"
                        className="block w-full text-center text-2xl tracking-widest py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {isError && (
                    <div className="text-sm text-red-600 text-center">
                        {message}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={otp.length !== 6 || isLoading}
                        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    <div className="text-center">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Resend Verification Code
                            </button>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Resend code in {formatTime(timer)}
                            </p>
                        )}
                    </div>
                </div>
            </form>

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

OTPVerification.propTypes = {
    email: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default OTPVerification;