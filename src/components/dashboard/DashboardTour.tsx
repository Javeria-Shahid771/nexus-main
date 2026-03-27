import React, { useState, useEffect } from 'react';
import { Joyride } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';

export const DashboardTour: React.FC = () => {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem(`tour_seen_${user?.id}`);
    // Adding a short timeout ensures the UI is fully rendered before tour begins
    if (!hasSeenTour) {
      setTimeout(() => setRun(true), 500);
    }
  }, [user]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(`tour_seen_${user?.id}`, 'true');
    }
  };

  const steps: any[] = [
    {
      target: '#action-modules-section',
      content: 'Welcome to your power tools! Use these modules to manage meetings, calls, documents, and funding.',
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '#tour-calendar-btn',
      content: 'Access your calendar to manage availability and view upcoming meetings.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-video-btn',
      content: 'Start video calls and share your screen with your connections.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-docs-btn',
      content: 'Review and e-sign term sheets or other important documents.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-wallet-btn',
      content: 'View your financial dashboard to accept funding flows and manage transactions.',
      placement: 'bottom',
      disableBeacon: true,
    }
  ];

  return (
    <Joyride
      {...({
        steps,
        run,
        continuous: true,
        callback: handleJoyrideCallback
      } as any)}
    />
  );
};
