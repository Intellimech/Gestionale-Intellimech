import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline'; 
import { useState, useContext, useEffect } from 'react'
import axios from 'axios'; // Importa axios per le richieste HTTP

import { UserContext } from '../../module/userContext';

import { toast, Toaster } from 'react-hot-toast'; // Importa react-hot-toast

const SettingsPage = () => {
  
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

  const { user } = useContext(UserContext);

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
  const [generalSettings, setGeneralSettings] = useState({
      companyName: user?.companyName,
      email: user?.email,
    });
  const handlePasswordChangeConfirm = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('La nuova password e la conferma password non corrispondono.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/changepassword`, {
        email: generalSettings.email,
        password: newPassword,
      });

      if (response.status === 200) {
        toast.success('Password modificata con successo!');
      } else {
        toast.error('Modifica della password fallita.');
      }
    } catch (error) {
      console.error('Errore durante la modifica della password:', error);
      toast.error('Si è verificato un errore durante la modifica della password.');
    }

    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSupportRequestConfirm = () => {
    // Qui puoi aggiungere la logica per inviare la richiesta di supporto
    toast.success('Richiesta di supporto inviata con successo!');
    setSupportMessage('');
    setShowSupportModal(false);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
       <Toaster position="top-right" reverseOrder={false} /> {/* Aggiungi Toaster */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Impostazioni</h1>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">

        {/* Impostazioni Generali */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informazioni Generali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome Azienda</label>
              <input
                id="companyName"
                type="text"
                value={generalSettings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
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
                  value={user.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
                  placeholder="Email"
                  readOnly
                />
              </div>
            </div>
          </div>
        </section>

        {/* Impostazioni di Sicurezza */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Impostazioni di Sicurezza</h2>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Password Attuale</label>
              <input
                id="currentPassword"
                type={'password'}
                value={user.p}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
                placeholder="Password Attuale"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 pt-6"
              >
                <EyeIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nuova Password</label>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
                placeholder="Nuova Password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                
              </button>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Conferma Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
                placeholder="Conferma Password"
              />
            </div>
            <button
              type="button"
              onClick={handlePasswordChange}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Modifica Password
            </button>
          </div>
        </section>

        {/* Contatta Supporto */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contatta Supporto</h2>
          <textarea
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
            rows="4"
            placeholder="Inserisci il tuo messaggio qui..."
          />
          <button
            type="button"
            onClick={handleSupportRequest}
            className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Invia Messaggio
          </button>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Salva Modifiche
          </button>
        </div>

      </form>

      {/* Modali */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onConfirm={() => {
          setGeneralSettings({ ...generalSettings, email: newEmail });
          setNewEmail('');
          setShowEmailModal(false);
        }}
        title="Conferma Aggiornamento Email"
        message={`Sei sicuro di voler aggiornare la tua email a ${newEmail}?`}
      />

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordChangeConfirm}
        title="Conferma Modifica Password"
        message="Sei sicuro di voler cambiare la tua password?"
      />

      <Modal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onConfirm={() => {
          alert('Richiesta di supporto inviata con successo!');
          setSupportMessage('');
          setShowSupportModal(false);
        }}
        title="Conferma Invio Richiesta di Supporto"
        message="Sei sicuro di voler inviare la tua richiesta di supporto?"
      />
    </div>
  );
};

// Componente Modal rimane invariato
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
            className="bg-gray-300 text-center text-xs font-bold  text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="ml-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;