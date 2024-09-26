import React, { useState } from 'react';

// Modal component
const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  // State hooks for form data
  const [generalSettings, setGeneralSettings] = useState({
    companyName: '',
    email: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Handle input changes
  const handleChange = (field, value) => {
    setGeneralSettings({ ...generalSettings, [field]: value });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('General Settings:', generalSettings);
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
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-8">

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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Company Name"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Email"
                />
                <button
                  type="button"
                  onClick={handleEmailUpdate}
                  className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* User Preferences */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Preferences</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
              <select
                id="theme"
                value={generalSettings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="notifications"
                type="checkbox"
                checked={generalSettings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 text-sm font-medium text-gray-700">Enable Notifications</label>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="New Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
          <button
            type="button"
            onClick={handleSupportRequest}
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700"
          >
            Contact Support
          </button>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
          console.log('Password changed:', password);
          setPassword('');
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
          console.log('Support request sent');
          setShowSupportModal(false);
        }}
        title="Contact Support"
        message="Your request has been sent to support."
      />

    </div>
  );
};

export default SettingsPage;
