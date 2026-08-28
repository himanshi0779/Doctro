import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../context/AdminContext.jsx';
import { AppContext } from '../../AppContext.jsx';
import { assets } from '../../assets/assets.js';

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken, getDashData]);

  // Handle appointment cancellation with live refresh
  const handleCancel = async (appointmentId) => {
    if (cancellingId) return;
    setCancellingId(appointmentId);
    await cancelAppointment(appointmentId);
    await getDashData(); // Refresh summary metrics and latest list
    setCancellingId(null);
  };

  // Skeleton Loader for smooth initial render
  if (!dashData) {
    return (
      <div className="m-4 sm:m-6 flex flex-col gap-6 animate-pulse max-w-6xl">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[160px] h-24 bg-gray-100 rounded-xl border border-gray-200"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl border border-gray-200" />
      </div>
    );
  }

  const statCards = [
    { icon: assets.doctor_icon, count: dashData.doctors ?? 0, label: 'Doctors' },
    { icon: assets.appointments_icon, count: dashData.appointments ?? 0, label: 'Appointments' },
    { icon: assets.patients_icon, count: dashData.patients ?? 0, label: 'Patients' },
  ];

  return (
    <div className="m-4 sm:m-6 flex flex-col gap-6 max-w-6xl">
      {/* Metric Summary Cards */}
      <div className="flex flex-wrap gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-[160px] flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <img className="w-10 sm:w-12 shrink-0" src={card.icon} alt={card.label} />
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.count}</p>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Bookings Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <img src={assets.list_icon} alt="List" className="w-5 sm:w-6" />
          <p className="font-semibold text-gray-800 text-sm sm:text-base">Latest Bookings</p>
        </div>

        <div className="flex flex-col divide-y divide-gray-100">
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.map((item, index) => {
              const doctor = item.docData || {};
              const isCancelling = cancellingId === item._id;

              return (
                <div
                  key={item._id || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center px-5 sm:px-6 py-4 hover:bg-gray-50/80 transition-colors gap-3 sm:gap-4"
                >
                  <img
                    className="rounded-full w-11 h-11 object-cover bg-indigo-50 border border-gray-200 shrink-0"
                    src={doctor.image || assets.upload_area}
                    alt={doctor.name || 'Doctor'}
                  />

                  <div className="flex-1 min-w-0 text-sm">
                    <p className="text-gray-800 font-semibold truncate">
                      {doctor.name || 'Unknown Doctor'}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                      {slotDateFormat(item.slotDate)}, {item.slotTime}
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0 ml-auto flex items-center">
                    {item.cancelled ? (
                      <span className="text-red-500 bg-red-50 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCancel(item._id)}
                        disabled={isCancelling}
                        title="Cancel appointment"
                        className="p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <img
                          className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer"
                          src={assets.cancel_icon}
                          alt="Cancel"
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No recent bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;