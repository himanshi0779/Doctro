import React from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col md:flex-row bg-primary rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 overflow-hidden'>
      
      {/* -------- Left Side ------ */}
      <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 flex flex-col justify-center'>
        <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white leading-tight'>
          <p className='mt-4'>Book Appointment</p>
          <p>With 100+ Trusted Doctors</p>
        </div>
      </div>

      {/* -------- Right Side ------ */}
      <div className='hidden md:flex md:w-1/2 lg:w-[370px] justify-end items-end relative'>
        <img
          className='w-full max-w-md object-contain'
          src={assets.appointment_img}
          alt='Doctor Appointment'
        />
      </div>
    </div>
  );
};

export default Banner;
