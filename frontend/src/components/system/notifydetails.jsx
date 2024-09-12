import { EyeIcon, CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { Transition } from '@headlessui/react';


export default function NotifyDetails({ key, notification, removeNotification }) {

    return (
          <div className="mt-5 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  ) : notification.type === 'error' ? (
                    <XMarkIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                  ) : notification.type === 'warning' ? (
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                  ) : notification.type === 'info' ? (
                    <MegaphoneIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                  ) : null}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => removeNotification(notification.id_notify)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
    );
}
