import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useContext } from 'react'
import { UserContext } from '../../module/userContext'
import axios from 'axios'

export default function ChangePassword({ openChangePass, setOpenChangePass }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { user } = useContext(UserContext)

  useEffect(() => {
    console.log(password)
    if (password !== confirmPassword && confirmPassword !== '') {
      setErrorMessage('Le password non corrispondono.')
    } else {
      setErrorMessage('')
    }
  }, [password, confirmPassword])

  const handleChangePassword = () => {
    if (password !== confirmPassword) {
      setErrorMessage('Le password non corrispondono.')
    } else {
      if(password === '' || confirmPassword === '') {
        setErrorMessage('Tutti i campi sono obbligatori.')
      } else {
        axios.post(`${process.env.REACT_APP_API_URL}/auth/changepassword`, { password: password, email: user?.email })
          .then(() => {
            setOpenChangePass(false)
          })
          .catch((error) => {
            console.error('Error changing password:', error)
            setErrorMessage('Errore durante il cambio password.')
          })
      }
    }
  }

  return (
    <Dialog open={openChangePass} onClose={() => {}} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-0">
        <div className="flex min-h-full items-center justify-center text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-8 pb-8 pt-10 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-10 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="text-center">
                <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                  Cambio Password
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    E' necessario cambiare la password per continuare.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-center">
                <input type="password" 
                       className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]" 
                       placeholder="Nuova Password"
                       onChange={(e) => setPassword(e.target.value)}
                />              
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-center">
                <input type="password" 
                       className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]" 
                       placeholder="Conferma Password"
                       onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {errorMessage && (
              <div className="mt-4 text-center text-[#7fb7d4]">
                {errorMessage}
              </div>
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex w-full justify-center rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7fb7d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fb7d4]"
              >
                Cambia Password
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
