'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import requestAccountDeletion from '@/libs/actions/user/request-account-deletion';
import getUserByPhoneOrEmail from '@/libs/actions/user/get-user-by-phone-or-email';

export default function DeleteAccountPage() {
  const [step, setStep] = useState('verify'); // 'verify', 'confirm', 'delete'
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [contactInfo, setContactInfo] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    // Validate input
    if (!contactInfo.trim()) {
      setError(`Please enter your ${verificationMethod}`);
      setIsProcessing(false);
      return;
    }

    // Basic validation
    if (verificationMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactInfo)) {
        setError('Please enter a valid email address');
        setIsProcessing(false);
        return;
      }
    } else {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(contactInfo.replace(/[\s\-\(\)]/g, ''))) {
        setError('Please enter a valid phone number');
        setIsProcessing(false);
        return;
      }
    }

    try {
    const user = await getUserByPhoneOrEmail(contactInfo);
    if (user) {
        // Move to confirmation step    
        setStep('confirm');
    } 
    } catch (err) {
        switch (typeof err) {
            case 'string':
                setError(err);
                break;
        
            default:
                setError('Verification failed. Please try again.');
                break;
        }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmationText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
        await requestAccountDeletion(contactInfo);
      // Account deleted successfully
      alert('Request submitted for review. You will receive an email within 24 hours to confirm your action.');
      router.push('/');
    } catch (err) {
        switch (typeof err) {
            case 'string':
                setError(err);
                break;
            default:
                setError('An error occurred while requesting to delete account. Try Again');
                break;
        }
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (step === 'verify') {
      router.replace('/');
      return;
    }

    if (step === 'confirm') {
      setStep('verify');
      setConfirmationText('');
    } else {
      router.back();
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Delete Account
          </h1>
          <p className="text-gray-600">
            {step === 'verify' 
              ? 'Please verify your identity to proceed'
              : 'This action cannot be undone. All your data will be permanently removed.'
            }
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'verify' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              1
            </div>
            <div className="w-12 h-1 bg-gray-300 mx-2"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 'verify' && (
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose verification method:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={verificationMethod === 'email'}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email Address</span>
                </label>
                {/* <label className="flex items-center"> //todo: Enable this for Phone number
                  <input
                    type="radio"
                    value="phone"
                    checked={verificationMethod === 'phone'}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Phone Number</span>
                </label> */}
              </div>
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your {verificationMethod === 'email' ? 'email address' : 'phone number'}:
              </label>
              <input
                type={verificationMethod === 'email' ? 'email' : 'tel'}
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={verificationMethod === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
                disabled={isProcessing}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Identity verified for: {contactInfo}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: Account Deletion
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>All your personal data will be permanently deleted</li>
                      <li>Your account cannot be recovered</li>
                      <li>Any active subscriptions will be cancelled</li>
                      <li>You will lose access to all associated services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Final confirmation required:</strong> Type "DELETE" below to permanently delete your account.
              </p>
            </div>

            <div>
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Type DELETE here"
                disabled={isProcessing}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessing || confirmationText !== 'DELETE'}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete My Account'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}