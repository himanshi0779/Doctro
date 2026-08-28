import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { assets } from '../../assets/assets';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext);
  const [loadingDocId, setLoadingDocId] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken, getAllDoctors]);

  const handleToggle = async (docId) => {
    if (loadingDocId) return;
    setLoadingDocId(docId);
    await changeAvailability(docId);
    setLoadingDocId(null);
  };

  return (
    <div className='m-4 sm:m-6 max-w-7xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-lg sm:text-2xl font-bold text-gray-800'>All Doctors</h1>
        <p className='text-xs sm:text-sm text-gray-500 font-medium'>
          Total: <span className='text-gray-800 font-bold'>{doctors.length}</span>
        </p>
      </div>

      {doctors && doctors.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {doctors.map((item) => {
            const isToggling = loadingDocId === item._id;

            return (
              <div
                key={item._id}
                className='border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between group'
              >
                {/* Doctor Image Container */}
                <div className='w-full h-52 bg-indigo-50/60 flex items-center justify-center overflow-hidden border-b border-gray-100 group-hover:bg-indigo-100/50 transition-colors'>
                  <img
                    src={item.image || assets.upload_area}
                    alt={item.name}
                    className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>

                {/* Doctor Details */}
                <div className='p-4.5 flex flex-col gap-1.5'>
                  <p className='text-gray-800 text-base font-semibold truncate'>
                    {item.name}
                  </p>
                  <p className='text-gray-500 text-xs font-medium truncate'>
                    {item.speciality}
                  </p>
                  <p className='text-xs text-gray-400'>
                    Experience: <span className='text-gray-600 font-medium'>{item.experience}</span>
                  </p>

                  {/* Availability Toggle */}
                  <label
                    htmlFor={`avail-${item._id}`}
                    className={`flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100 cursor-pointer select-none ${
                      isToggling ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <input
                      id={`avail-${item._id}`}
                      type='checkbox'
                      checked={!!item.available}
                      onChange={() => handleToggle(item._id)}
                      className='w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer accent-indigo-600'
                    />
                    <span className='text-xs font-medium text-gray-700'>
                      {item.available ? (
                        <span className='text-emerald-600 font-semibold'>Available for Bookings</span>
                      ) : (
                        <span className='text-gray-400'>Unavailable</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400'>
          <p className='text-base font-semibold text-gray-600'>No doctors onboarded yet</p>
          <p className='text-xs text-gray-400 mt-1'>
            Click "Add Doctor" from the sidebar to onboard your first doctor.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;