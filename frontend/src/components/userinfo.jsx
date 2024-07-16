import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from '../module/userContext'

function isToday(date) {
  const today = new Date();
  const daten = new Date(date);
  console.log(daten.getDate() === today.getDate() &&
  daten.getMonth() === today.getMonth())
  return daten.getDate() === today.getDate() &&
    daten.getMonth() === today.getMonth();
}

export default function UserInfo({ userdata }) {
  // get user info
  const [Propic, setPropic] = useState(null);
  const { user } = useContext(UserContext);

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Profilo</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni personali sull'utente</p>
      </div>
      <div className="border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-900">Full name</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user && `${user.name} ${user.surname}`}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-900">Email address</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user && <a href={`mailto:${user.email}`}>{user.email}</a>}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-900">Birthdate</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user && user.birthdate && (
                <>
                  {new Date(user.birthdate).toLocaleDateString()}{' '}
                  {isToday(user.birthdate) && <span>🎂</span>}
                </>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-900">Ruolo</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user?.role}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-900">Gruppo</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user?.group}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-900">Sottogruppo</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user?.subgroup}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
