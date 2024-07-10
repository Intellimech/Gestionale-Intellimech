import { useState, useContext, useEffect } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import Notify from '../components/notification'
import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import NotificationList from '../components/notificationlist'
import Scrollbar from 'tailwind-scrollbar'
import { UserContext } from '../module/userContext'
import { Outlet } from 'react-router-dom'
import UniversalSearch from '../components/universalsearch'

const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout() {
  const { user } = useContext(UserContext)
  const [navbarOpen, setNavbarOpen] = useState(false)

  const [thereIsNotification, setThereIsNotification] = useState(user?.notification?.length > 0)
  const [showNotify, setShowNotify] = useState(false)
  const [universalsearchopen, setUniversalsearchopen] = useState(false)
  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyMessage, setNotifyMessage] = useState('')
  const [notifyType, setNotifyType] = useState('')

  const [showNotifySidebar, setShowNotifySidebar] = useState(false)
  const [notifySidebarTitle, setNotifySidebarTitle] = useState('')
  const [notifySidebarChildren, setNotifySidebarChildren] = useState('')

  const handleNotificationSidebar = (title, children) => {
    setNotifySidebarTitle(title)
    setNotifySidebarChildren(children)
    setShowNotifySidebar(true)
  }

  return (
    <>
      <Notify setShow={setShowNotify} show={showNotify} title={notifyTitle} message={notifyMessage} type={notifyType} />
      <Sidebar open={showNotifySidebar} setOpen={setShowNotifySidebar} title={notifySidebarTitle} children={notifySidebarChildren}/>
      <UniversalSearch open={universalsearchopen} setOpen={setUniversalsearchopen} />
      <div>
        <Dialog className="relative z-50 lg:hidden" open={navbarOpen} onClose={setNavbarOpen}>
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" className="-m-2.5 p-2.5" onClick={() => setNavbarOpen(false)}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <Navbar />
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="
            flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 
            scrollbar-none
          ">
            <Navbar />
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setNavbarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className='h-6 w-6' aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="relative flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
                {/* Use `search-field` to open the universal search */}
                <input
                  id="search-field"
                  className="h-full w-full border-0 bg-transparent pl-8 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  onClick={() => setUniversalsearchopen(true)}
                  readOnly
                />
              </form>

              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500" onClick={() => handleNotificationSidebar('Notifiche', <NotificationList/>)}>
                  <span className="sr-only">View notifications</span>
                  <BellIcon className={`h-6 w-6${thereIsNotification ? ' animate-pulse animate-bounce' : ''}`} aria-hidden="true" />
                </button>

                {/* Separator */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full bg-gray-50"
                      src={user?.propic}
                      alt=""
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                        {user?.name} {user?.surname}
                      </span>
                      <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        {({ focus }) => (
                          <a
                            href={item.href}
                            className={classNames(
                              focus ? 'bg-gray-50' : '',
                              'block px-3 py-1 text-sm leading-6 text-gray-900',
                            )}
                          >
                            {item.name}
                          </a>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{<Outlet />}</div>
          </main>
        </div>
      </div>
    </>
  )
}
