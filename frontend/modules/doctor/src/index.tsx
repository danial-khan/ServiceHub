import React, { useState } from 'react';
import { DoctorListScreen } from './screens/DoctorListScreen';
import { DoctorDetailScreen } from './screens/DoctorDetailScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { Doctor } from './data';

type Screen = 'list' | 'detail' | 'appointments';

interface DoctorModuleProps {
  onBack: () => void;
}

export const DoctorModule: React.FC<DoctorModuleProps> = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentScreen('detail');
  };

  const handleBookingComplete = () => {
    setCurrentScreen('appointments');
  };

  const handleBack = () => {
    if (currentScreen === 'detail') {
      setCurrentScreen('list');
    } else if (currentScreen === 'appointments') {
      setCurrentScreen('list');
    } else {
      onBack();
    }
  };

  return (
    <>
      {currentScreen === 'list' && (
        <DoctorListScreen
          onDoctorSelect={handleDoctorSelect}
          onNavigateToAppointments={() => setCurrentScreen('appointments')}
        />
      )}
      {currentScreen === 'detail' && selectedDoctor && (
        <DoctorDetailScreen
          doctor={selectedDoctor}
          onBack={handleBack}
          onBookingComplete={handleBookingComplete}
        />
      )}
      {currentScreen === 'appointments' && (
        <AppointmentsScreen onBack={handleBack} />
      )}
    </>
  );
};

export const getNavigator = () => DoctorModule;

export default DoctorModule;
