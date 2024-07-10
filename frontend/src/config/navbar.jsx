import axios from 'axios';
import { HomeIcon, CalendarIcon, ArchiveBoxIcon, FolderIcon, DocumentDuplicateIcon, ChartPieIcon, UsersIcon, TagIcon, CheckBadgeIcon, ClockIcon, CalendarDaysIcon, DocumentTextIcon, Squares2X2Icon, BanknotesIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const logout = () => {
  const token = Cookies.get('token');
  if (!token) {
    console.log("No token");
  } else {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {}, { headers: headers })
      .then((response) => {
        Cookies.remove('token');
        localStorage.clear();
        window.location.href = '/';
      })
      .catch((error) => {
        Cookies.remove('token');
        localStorage.clear();
        window.location.href = '/';
      });
  }
};



      const userNavigation = [
        { name: 'Your profile', href: '/profile' },
        { name: 'Sign out', onClick: () => logout()},
      ]
    
      const fullnavigation = [
        { 
          showedname: "Dashboard", 
          options: [
            { name: 'Dashboard', href: '/homepage', icon: HomeIcon, current: false, permissionss: 'dashboard' },
            { name: 'Rendicontazione', href: '/reporting', icon: ClockIcon, current: false, permissionss: 'calendar' },
            { name: 'Calendario', href: '/calendar', icon: CalendarDaysIcon, current: false, permissionss: 'projects' },
          ], 
        },
        {
          showedname: "Analitycs",
          options: [
            { name: 'Report', href: '/report', icon: ChartPieIcon, current: false, permissionss: 'report' },
          ],
        },
        { 
          showedname: "Project Orders", 
          options: [
            { name: 'Offerte', href: '/offer', icon: DocumentTextIcon, current: false, permissionss: 'offerte' },
            { name: 'Commesse', href: '/orders', icon: Squares2X2Icon, current: false, permissionss: 'commesse' },
            { name: 'Archivio Commesse', href: '/orders/archive', icon: ArchiveBoxIcon, current: false, permissionss: 'archiviocommesse' },
          ], 
        },
        { 
          showedname: "Costs", 
          options: [
            { name: 'Acquisti', href: '#', icon: ShoppingCartIcon, current: false, permissionss: 'acquisti' },
          ], 
        },
        { 
          showedname: "Registry", 
          options: [
            { name: 'Costi', href: '#', icon: BanknotesIcon, current: false, permissionss: 'costi' },
            { name: 'Fornitori', href: '#', icon: FolderIcon, current: false, permissionss: 'fornitori' },
            { name: 'Clienti', href: '#', icon: UsersIcon, current: false, permissionss: 'clienti' },
            { name: 'Prodotti', href: '#', icon: DocumentDuplicateIcon, current: false, permissionss: 'prodotti' },
          ], 
        },
        { 
          showedname: "Management", 
          options: [
            { name: 'Users', href: '/users', icon: UsersIcon, current: false, permissionss: 'users' },
            { name: 'Role', href: '#', icon: TagIcon , current: false, permissionss: 'role' },
            { name: 'Permissionss', href: '#', icon: CheckBadgeIcon, current: false, permissionss: 'permissionss' },
          ], 
        },
      ];
    
  export { userNavigation, fullnavigation };