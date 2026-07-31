import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaArrowRight, FaBell, FaCalendarAlt, FaBars } from 'react-icons/fa';
import moment from 'moment';
import Cookies from 'js-cookie';
import { DateContext } from '../contexts/DateContext';
import userprofile from '../components/userprofile.png';
import { useUser } from '../contexts/UserContext';

interface NotificationItem {
  id: string;
  text: string;
  read: boolean;
}

interface NavbarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: () => void;
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { startDateTime, endDateTime, handleDateChange } = useContext(DateContext)!;
  const [tempStartDateTime, setTempStartDateTime] = useState(startDateTime);
  const [tempEndDateTime, setTempEndDateTime] = useState(endDateTime);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { username } = useUser();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempStartDateTime(e.target.value);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEndDateTime(e.target.value);
  };

  const closeStartPicker = () => {
    setIsStartPickerOpen(false);
  };

  const closeEndPicker = () => {
    setIsEndPickerOpen(false);
  };

  useEffect(() => {
  setTempStartDateTime(
    moment(startDateTime).format("YYYY-MM-DDTHH:mm")
  );
  setTempEndDateTime(
    moment(endDateTime).format("YYYY-MM-DDTHH:mm")
  );
}, [startDateTime, endDateTime]);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !profileRef.current?.contains(event.target as Node) &&
        !notificationRef.current?.contains(event.target as Node) &&
        !datePickerRef.current?.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications(startDateTime, endDateTime);
  }, [startDateTime, endDateTime]);

  const fetchNotifications = async (start: string, end: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/apdtest?startDateTime=${start}&endDateTime=${end}`
      );
      const data = await response.json();

      let formatted: NotificationItem[] = [];


      if (data?.peakDemandAboveThreshold) {
        formatted = formatted.concat(
          data.peakDemandAboveThreshold.map((entry: any) => ({
            id: `pd-${entry.id}`,
            text: `⚡ Apparent Power → ${entry.total_kVA} kVA at ${moment(entry.minute).format(
              "YYYY-MM-DD HH:mm"
            )} crossing 596 → Lower Ceiling`,
            read: false,
          }))
        );
      }


      if (data?.dgActivations) {
        formatted = formatted.concat(
          data.dgActivations.map((entry: any, index: number) => ({
            id: `dg-${index}`,
            text: `🔄 DG ${entry.status} (Meter ${entry.meter}) at ${moment(entry.timestamp).format(
              "YYYY-MM-DD HH:mm"
            )}, kWh: ${entry.kWh}`,
            read: false,
          }))
        );
      }

      formatted.sort((a, b) => {
        const aTime = moment(a.text.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/));
        const bTime = moment(b.text.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/));
        return bTime.valueOf() - aTime.valueOf();
      });

      setNotifications(formatted);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = () => {
  handleDateChange({
    startDateTime: moment(tempStartDateTime).format("YYYY-MM-DD HH:mm:ss"),
    endDateTime: moment(tempEndDateTime).format("YYYY-MM-DD HH:mm:ss"),
  });
};


  const handleLogout = async() => {
    try {
      Cookies.remove('sessionId', { domain: '.elementsenergies.com', path: '/'});
      Cookies.remove('token', { domain: '.elementsenergies.com', path: '/'});

      window.location.href = 'https://elementsenergies.com/login';


    }
    catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <>
    {loading && (
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="bg-white border border-gray-300 rounded-xl px-6 py-5 flex flex-col items-center shadow-lg">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3"></div>
        <p className="text-gray-800 text-sm font-medium tracking-wide">Fetching data...</p>
      </div>
    </div>
    )}
    <div className='bg-white w-full h-full flex flex-end p-3 justify-end space-x-3 items-center shadow-md'>
      <button
        onClick={onMenuClick}
        className="md:hidden mr-auto p-2 text-gray-600 hover:text-gray-900"
        aria-label="Open menu"
      >
        <FaBars className="text-lg" />
      </button>
      <div className='custom-dsm:hidden space-x-3'>
                <label className="text-sm text-gray-600">Start</label>
                <input
                  type="datetime-local"
                  value={tempStartDateTime}
                  onChange={(e) => setTempStartDateTime(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
      </div>
      <div className="custom-dsm:flex items-center hidden space-x-2">
        <button
          onClick={() => setIsStartPickerOpen(true)}
          className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          <FaCalendarAlt className="text-gray-600 text-xs" />
          <span className="text-xs text-gray-700">
            {moment(tempStartDateTime).format('DD MMM, HH:mm')}
          </span>
        </button>
      </div>
      {isStartPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md">
            <label className="text-sm text-gray-600 block">Select Start Date</label>
            <input
              type="datetime-local"
              value={tempStartDateTime}
              onChange={handleStartChange}
              className="border rounded px-2 py-1 text-sm w-full"
            />
            <button
              onClick={closeStartPicker}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className='custom-dsm:hidden space-x-3'>
                <label className="text-sm text-gray-600">End</label>
                <input
                  type="datetime-local"
                  value={tempEndDateTime}
                  onChange={(e) => setTempEndDateTime(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
      </div>
      <div className="custom-dsm:flex items-center hidden space-x-2">
        <button
          onClick={() => setIsEndPickerOpen(true)}
          className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          <FaCalendarAlt className="text-gray-600 text-xs" />
          <span className="text-xs text-gray-700">
            {moment(tempEndDateTime).format('DD MMM, HH:mm')}
          </span>
        </button>
      </div>
      {isEndPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md">
            <label className="text-sm text-gray-600 block">Select End Date</label>
            <input
              type="datetime-local"
              value={tempEndDateTime}
              onChange={handleEndChange}
              className="border rounded px-2 py-1 text-sm w-full"
            />
            <button
              onClick={closeEndPicker}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
         <button
  onClick={handleSubmit}
  disabled={loading}
  aria-busy={loading}
  className={`px-4 py-2 rounded-md text-sm flex items-center justify-center transition
    ${loading ? 'bg-blue-500 opacity-60 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
>
  <FaArrowRight />
</button>

        <div ref={notificationRef} className="relative">
          <div onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfileDropdown(false);
          }} className="cursor-pointer relative">
            <FaBell className="text-xl text-gray-600 hover:text-blue-500" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-[-60px] mt-4 w-72 bg-white shadow-lg rounded-lg py-3 z-50">
              <p className="px-4 py-2 text-sm font-semibold text-gray-800">Notifications</p>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
                {notifications.map((notif) => (
                  <p
                    key={notif.id}
                    className={`px-4 py-2 text-sm cursor-pointer ${notif.read ? "text-gray-500" : "text-black font-medium"}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    {notif.text}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <div onClick={() => {
            setShowProfileDropdown(!showProfileDropdown);
            setShowNotifications(false);
          }} className="cursor-pointer">
            <img src={userprofile} alt="User" className="w-10 h-10 rounded-full" />
          </div>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 py-4">
              <div className="flex flex-col items-center">
                <img src={userprofile} alt="Profile" className="w-14 h-14 rounded-full mb-2" />
                <p className="text-gray-800 font-medium">Hi, {username}</p>
                <p className="text-xs text-gray-500">{moment().format('DD MMM, HH:mm')}</p>
              </div>
              <hr className="my-2" />
              <p className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Help</p>
              <p className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                Log Out
              </p>
            </div>
          )}
        </div>
    </div>
    </>
  );
};

export default Navbar;
