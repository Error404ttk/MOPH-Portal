import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent');
      if (consent !== 'true') {
        setShowBanner(true);
      }
    } catch (error) {
      console.error("Could not access localStorage: ", error);
      // If localStorage is not available, we probably shouldn't show the banner
      // as we can't save the consent. Or, always show it.
      // For now, we'll default to not showing it if localStorage is blocked.
      setShowBanner(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie_consent', 'true');
      setShowBanner(false);
    } catch (error) {
      console.error("Could not write to localStorage: ", error);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <p className="text-sm mb-2 md:mb-0 md:mr-4">
          เว็บไซต์นี้มีการใช้คุกกี้เพื่อปรับปรุงการให้บริการ หากต้องการข้อมูลเพิ่มเติมเกี่ยวกับการใช้คุกกี้ของเรา โปรดดู <a href="https://sarapeehospital.go.th/downloads/document/139/1699324732.pdf" className="underline hover:text-gray-300">นโยบายความเป็นส่วนตัว</a>
        </p>
        <button 
          onClick={handleAccept}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
          aria-label="Accept cookies"
        >
          ยอมรับ
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
