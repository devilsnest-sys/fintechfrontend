import React, { useEffect, useRef, useState } from 'react';
import AppSettings from '../../service/App.settings';
interface SessionManagerProps {
  sessionExpireTime?: number; 
  openSessionExpiredDialog: () => void; 
}

const SessionManager: React.FC<SessionManagerProps> = ({
  openSessionExpiredDialog,
}) => {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const sessionStartTimeRef = useRef(
    localStorage.getItem('sessionExpiredTime') || new Date().toISOString()
  );

  useEffect(() => {
    if (!localStorage.getItem('sessionExpiredTime')) {
      localStorage.setItem('sessionExpiredTime', sessionStartTimeRef.current);
    }

    const diffMinutes = () => {
      const startTime = new Date(sessionStartTimeRef.current).getTime();
      const currentTime = new Date().getTime();
      return Math.round((currentTime - startTime) / 60000);
    };

    const checkSession = () => {
      sessionStartTimeRef.current = localStorage.getItem('sessionExpiredTime') || new Date().toISOString();
  
      if (diffMinutes() >= AppSettings.sessionExpireTime && !isSessionModalOpen) {
        setIsSessionModalOpen(true);
        openSessionExpiredDialog();
      }
    };

    const resetIdleTime = () => {
      if (diffMinutes() < AppSettings.sessionExpireTime) {
        const newTime = new Date().toISOString();
        sessionStartTimeRef.current = newTime;
        localStorage.setItem('sessionExpiredTime', newTime);
      }
    };

    const interval = setInterval(checkSession, 1000);

    const activityEvents = [
      'mousemove', 'keypress', 'mousedown', 'touchstart',
      'scroll', 'wheel', 'keydown', 'keyup', 'touchmove'
    ];
    activityEvents.forEach(event =>
      document.addEventListener(event, resetIdleTime)
    );

    return () => {
      clearInterval(interval);
      activityEvents.forEach(event =>
        document.removeEventListener(event, resetIdleTime)
      );
    };
  }, [isSessionModalOpen, AppSettings.sessionExpireTime, openSessionExpiredDialog]);

  return null; // Or you can render a hidden modal here if desired
};

export default SessionManager;
