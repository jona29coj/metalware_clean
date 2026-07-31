import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Profile from './sections/Profile';
import Files from './sections/Files';
import BuildingOverview from './sections/Monitor/BuildingOverview';
import Diesel from './sections/Monitor/Diesel';
import Zones from './sections/Monitor/Zones';
import Emd from './dcomponents/Emd';
import Dgd from './dcomponents/Dgd';
import EDashboard from './sections/Dashboard/EDashboard';
import IOEBatteryControl from './sections/IOEBattery';
import LTOControl from './sections/LTOControl';
import UPSControl from './sections/UPSControl';
import Settings from './sections/Settings';
import { DateProvider } from './contexts/DateContext';
import PeakDemandView from './components/PeakDemandView';
import PeakAnalysis from './components/PeakAnalysis';
import { UserProvider } from './contexts/UserContext';
import Reports from './components/Reports';
import Cookies from 'js-cookie';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1250);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          setIsAuthenticated(true);
        }else {
          window.location.href = 'https://elementsenergies.com/login';
        }
      }
      catch (error) {
        window.location.href = 'https://elementsenergies.com/login';
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const sendHeartbeat = () => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/heartbeat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.error('Heartbeat failed:', error);
      });
    };

    sendHeartbeat();
    const intervalId = setInterval(sendHeartbeat, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1250);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <DateProvider>
        <BrowserRouter>
          <ScrollToTop />
          {isAuthenticated && (
            <div className="min-h-screen flex bg-gray-100">
              <div
                className={
                  isMobile
                    ? `bg-white shadow-md transition-transform duration-300 fixed top-0 left-0 h-full w-64 max-w-[80%] transform ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                      }`
                    : `bg-white shadow-md transition-all duration-300 fixed top-0 left-0 h-full ${
                        isCollapsed ? 'w-[9%]' : 'w-[15.5%]'
                      }`
                }
                style={{ zIndex: 50 }}
              >
                <Sidebar
                  isCollapsed={isMobile ? false : isCollapsed}
                  setIsCollapsed={toggleSidebar}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </div>
              {isMobile && isMobileMenuOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
                  style={{ zIndex: 45 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              <UserProvider>
              <div
                className={
                  isMobile
                    ? 'fixed top-0 left-0 w-full h-[55px]'
                    : `fixed top-0 h-[55px] transition-all duration-300 ${
                        isCollapsed ? 'left-[9%] w-[91%]' : 'left-[15.5%] w-[84.5%]'
                      }`
                }
                style={{ zIndex: 40 }}
              >
                <Navbar
                  isCollapsed={isCollapsed}
                  setIsCollapsed={toggleSidebar}
                  onMenuClick={() => setIsMobileMenuOpen((prev) => !prev)}
                />
              </div>
              </UserProvider>

              <div
                key={refreshKey}
                className={
                  isMobile
                    ? 'flex-1 flex flex-col min-h-screen overflow-hidden max-w-full ml-0'
                    : `flex-1 flex flex-col min-h-screen overflow-hidden max-w-full transition-all duration-300 ${
                        isCollapsed ? 'ml-[9%]' : 'ml-[15.5%]'
                      }`
                }
              >
                <div className="flex-1 overflow-auto max-w-full mt-[52px]">
                  <Routes>
                    <Route path="/dashboard" element={<EDashboard />} />
                    <Route path="/" element={<EDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/files" element={<Files />} />
                    <Route path="/monitor/overview" element={<BuildingOverview />} />
                    <Route path="/monitor/zones" element={<Zones />} />
                    <Route path="/monitor/diesel" element={<Diesel />} />
                    <Route path="/monitor/peakanalysis" element={<PeakAnalysis />} />
                    <Route path="/meter/:id" element={<Emd />} />
                    <Route path="/control/ltobattery" element={<LTOControl />} />
                    <Route path="/control/ioebattery" element={<IOEBatteryControl />} />
                    <Route path="/control/upsbattery" element={<UPSControl />} />
                    <Route path="/monitor/generator/:id" element={<Dgd />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/alerts" element={<PeakDemandView />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </div>
              </div>
            </div>
          )}
        </BrowserRouter>
    </DateProvider>
  );
};

export default App;
