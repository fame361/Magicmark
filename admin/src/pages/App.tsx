import React from 'react';
import HomePageModern from './HomePageModern';
import LicenseGuard from '../components/LicenseGuard';

const App: React.FC = () => {
  return (
    <LicenseGuard>
      <HomePageModern />
    </LicenseGuard>
  );
};

export default App;
