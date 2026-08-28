import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext.jsx';
import { assets } from '../../assets/assets.js';
import { AppContext } from '../../AppContext.jsx';

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, getAllAppointments]);

  const handleCancel = async (appointmentId) => {
    if (cancellingId) return;
    setCancellingId(appointmentId);
    await cancelAppointment(appointmentId);
    setCancellingId(null);
  };

  return (
    <div className='w-full max-w-6xl m-4 sm:m-5'>
      <h2 className='mb-4 text-lg sm:text-xl font-semibold text-gray-800'>All Appointments</h2>

      {/* Main Container */}
      <div className='bg-white border border-gray-200 rounded-xl text-sm shadow-sm overflow-hidden'>
        
        {/* Desktop Table View */}
        <div className='hidden sm:block overflow-x-auto'>
          <div className='grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1.5fr] gap-2 py-3.5 px-6 border-b border-gray-200 font-medium text-gray-600 bg-gray-50/50'>
            <p>#</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p className='text-center'>Actions</p>
          </div>

          {appointments && appointments.length > 0 ? (
            appointments.slice().reverse().map((item, index) => {
              const patient = item.userData || {};
              const doctor = item.docData || {};
              const isCancelling = cancellingId === item._id;

              return (
                <div
                  key={item._id || index}
                  className='grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1.5fr] items-center gap-2 px-6 py-3.5 border-b border-gray-100 hover:bg-gray-50/80 transition-colors text-gray-600'
                >
                  {/* Row Number */}
                  <p className='font-medium text-gray-400'>{index + 1}</p>

                  {/* Patient Info */}
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <img
                      className='w-8 h-8 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0'
                      src={patient.image || assets.upload_area}
                      alt={patient.name || 'Patient'}
                    />
                    <p className='font-medium text-gray-800 truncate'>
                      {patient.name || 'Unknown Patient'}
                    </p>
                  </div>

                  {/* Age */}
                  <p>{patient.dob ? calculateAge(patient.dob) : 'N/A'}</p>

                  {/* Date & Time */}
                  <p className='text-gray-700'>
                    {slotDateFormat(item.slotDate)}, {item.slotTime}
                  </p>

                  {/* Doctor Info */}
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <img
                      className='w-8 h-8 rounded-full object-cover bg-indigo-50 border border-gray-200 shrink-0'
                      src={doctor.image || assets.upload_area}
                      alt={doctor.name || 'Doctor'}
                    />
                    <p className='font-medium text-gray-800 truncate'>
                      {doctor.name || 'Unknown Doctor'}
                    </p>
                  </div>

                  {/* Fees */}
                  <p className='font-medium text-gray-800'>
                    {currency}{item.amount}
                  </p>

                  {/* Actions */}
                  <div className='flex items-center justify-center'>
                    {item.cancelled ? (
                      <span className='text-red-500 bg-red-50 border border-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className='text-emerald-600 bg-emerald-50 border border-emerald-200 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                        Completed
                      </span>
                    ) : (
                      <button
                        type='button'
                        onClick={() => handleCancel(item._id)}
                        disabled={isCancelling}
                        title='Cancel appointment'
                        className='p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50'
                      >
                        <img
                          className='w-7 h-7 cursor-pointer'
                          src={assets.cancel_icon}
                          alt='Cancel'
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className='py-16 text-center text-gray-400 text-sm'>
              No appointments found across the platform.
            </div>
          )}
        </div>

        {/* Mobile Card List View */}
        <div className='flex flex-col sm:hidden divide-y divide-gray-200'>
          {appointments && appointments.length > 0 ? (
            appointments.slice().reverse().map((item, index) => {
              const patient = item.userData || {};
              const doctor = item.docData || {};
              const isCancelling = cancellingId === item._id;

              return (
                <div key={item._id || index} className='p-4 flex flex-col gap-3'>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-gray-500'>#{index + 1}</p>
                    <div>
                      {item.cancelled ? (
                        <span className='text-red-500 bg-red-50 border border-red-200 text-xs font-medium px-2 py-0.5 rounded-full'>
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className='text-emerald-600 bg-emerald-50 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-full'>
                          Completed
                        </span>
                      ) : (
                        <button
                          type='button'
                          onClick={() => handleCancel(item._id)}
                          disabled={isCancelling}
                          className='p-1 rounded-full hover:bg-red-50 disabled:opacity-50'
                        >
                          <img
                            className='w-7 h-7 cursor-pointer'
                            src={assets.cancel_icon}
                            alt='Cancel'
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className='flex items-center gap-3'>
                    <img
                      className='w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200'
                      src={patient.image || assets.upload_area}
                      alt={patient.name || 'Patient'}
                    />
                    <div>
                      <p className='font-semibold text-gray-800'>{patient.name || 'Unknown Patient'}</p>
                      <p className='text-xs text-gray-500'>
                        Age: {patient.dob ? calculateAge(patient.dob) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <p className='text-xs text-gray-600'>
                    <span className='font-medium text-gray-700'>Date & Time:</span>{' '}
                    {slotDateFormat(item.slotDate)}, {item.slotTime}
                  </p>

                  {/* Doctor Info */}
                  <div className='flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100'>
                    <img
                      className='w-9 h-9 rounded-full object-cover bg-indigo-50 border border-gray-200'
                      src={doctor.image || assets.upload_area}
                      alt={doctor.name || 'Doctor'}
                    />
                    <div className='text-xs'>
                      <p className='font-medium text-gray-800'>{doctor.name || 'Unknown Doctor'}</p>
                      <p className='text-gray-500'>{doctor.speciality || 'General'}</p>
                    </div>
                  </div>

                  <p className='text-xs font-medium text-gray-700'>
                    Fees: <span className='font-bold text-gray-900'>{currency}{item.amount}</span>
                  </p>
                </div>
              );
            })
          ) : (
            <div className='py-12 text-center text-gray-400 text-sm'>
              No appointments found across the platform.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AllAppointments;