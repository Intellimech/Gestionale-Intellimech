import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
import NotifyDetails from "./notifydetails";
import { UserContext } from "../module/userContext";
import { set } from "date-fns";

export default function NotificationList({ notification }) {
    const [notifications, setNotifications] = useState([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        setNotifications(user.notification);
    }
    , []);
    const removeNotification = (id) => {
        setNotifications(notifications.filter(notification => notification.id_notify !== id));
        console.log(`Notification with id ${id} removed`);
        //TODO - set notification as viewed
    };

    return (
        <div className="relative mt-6 flex-1 px-4 sm:px-6">
            <div>
                {notifications.length === 0 && (
                    <div className="flex items-center justify-center">
                        <p className="text-gray-400">Nessuna notifica</p>
                    </div>
                )} 
                {notifications.map((notification) => (
                    <NotifyDetails
                        key={notification.id_notify}
                        notification={notification}
                        removeNotification={removeNotification}
                        autoHide={false}
                    />
                ))}
            </div>
        </div>
    );
}
