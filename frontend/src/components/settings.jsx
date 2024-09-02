import React, { useState } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline'; // Assicurati di avere questi icone installati

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: '',
    email: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (field, value) => {
    setGeneralSettings({ ...generalSettings, [field]: value });
  };

  const handleEmailUpdate = () => {
    setShowEmailModal(true);
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handleSupportRequest = () => {
    setShowSupportModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">

       {/* General Settings */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">General Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              id="companyName"
              type="text"
              value={generalSettings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4]  focus:border-[#7fb7d4]  sm:text-sm"
              placeholder="Consorzio Intellimech"
              readOnly
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center space-x-2">
              <input
                id="email"
                type="email"
                value={generalSettings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4]  focus:border-[#7fb7d4]  sm:text-sm"
                placeholder="Email"
                readOnly
              />
            </div>
          </div>
        </div>
      </section>


        {/* Security Settings */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4]  focus:border-[#7fb7d4]  sm:text-sm"
                placeholder="Current Password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 pt-6"
              >
                {showCurrentPassword ? (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4]  focus:border-[#7fb7d4]  sm:text-sm"
                placeholder="New Password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
               
              </button>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4]  focus:border-[#7fb7d4]  sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
            <button
              type="button"
              onClick={handlePasswordChange}
              className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700"
            >
              Change Password
            </button>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h2>
          <textarea
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4]  focus:border-[#7fb7d4]  sm:text-sm"
            rows="4"
            placeholder="Enter your message here..."
          />
          <button
            type="button"
            onClick={handleSupportRequest}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700"
          >
            Send Message
          </button>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4] "
          >
            Save Changes
          </button>
        </div>

      </form>

      {/* Modals */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onConfirm={() => {
          setGeneralSettings({ ...generalSettings, email: newEmail });
          setNewEmail('');
          setShowEmailModal(false);
        }}
        title="Confirm Email Update"
        message={`Are you sure you want to update your email to ${newEmail}?`}
      />

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={() => {
          // Handle password change logic
          console.log('Password changed:', newPassword);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordModal(false);
        }}
        title="Confirm Password Change"
        message="Are you sure you want to change your password?"
      />

      <Modal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onConfirm={() => {
          // Handle support request logic
          console.log('Support request sent:', supportMessage);
          setSupportMessage('');
          setShowSupportModal(false);
        }}
        title="Confirm Support Request"
        message="Are you sure you want to send this support request?"
      />
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="ml-2 bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
