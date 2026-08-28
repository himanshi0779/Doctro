import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { AppContext } from "../../AppContext";
import { assets } from "../../assets/assets";

const DoctorDashboard = () => {
  const {
    dToken,
    dashData,
    getDashData,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { currency, slotDateFormat } = useContext(AppContext);
  const [loadingActionId, setLoadingActionId] = useState(null);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken, getDashData]);

  // Action handlers that sync dashboard data
  const handleCancel = async (appointmentId) => {
    if (loadingActionId) return;
    setLoadingActionId(appointmentId);
    await cancelAppointment(appointmentId);
    await getDashData(); // Refresh summary metrics and latest list
    setLoadingActionId(null);
  };

  const handleComplete = async (appointmentId) => {
    if (loadingActionId) return;
    setLoadingActionId(appointmentId);
    await completeAppointment(appointmentId);
    await getDashData(); // Refresh summary metrics and latest list
    setLoadingActionId(null);
  };

  // Loading Skeleton State
  if (!dashData) {
    return (
      <div className="m-4 sm:m-5 animate-pulse">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[180px] h-24 bg-gray-100 rounded-xl border border-gray-200"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl border border-gray-200 mt-6" />
      </div>
    );
  }

  const cards = [
    {
      icon: assets.earning_icon,
      label: "Earnings",
      value: `${currency}${dashData.earnings ?? 0}`,
    },
    {
      icon: assets.appointments_icon,
      label: "Appointments",
      value: dashData.appointments ?? 0,
    },
    {
      icon: assets.patients_icon,
      label: "Patients",
      value: dashData.patients ?? 0,
    },
  ];

  return (
    <div className="m-4 sm:m-5 max-w-6xl">
      {/* Metric Summary Cards */}
      <div className="flex flex-wrap gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-[180px] flex items-center gap-3.5 bg-white p-4.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <img className="w-10 sm:w-12 shrink-0" src={card.icon} alt={card.label} />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {card.value}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Bookings Section */}
      <div className="bg-white mt-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <img src={assets.list_icon} alt="list" className="w-5 sm:w-6" />
          <p className="font-semibold text-gray-800 text-sm sm:text-base">
            Latest Bookings
          </p>
        </div>

        <div className="flex flex-col divide-y divide-gray-100">
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.map((item, index) => {
              const patient = item.userData || {};
              const isProcessing = loadingActionId === item._id;

              return (
                <div
                  key={item._id || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center px-4 sm:px-6 py-3.5 gap-3 sm:gap-4 hover:bg-gray-50/80 transition-colors"
                >
                  <img
                    className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0"
                    src={patient.image || assets.upload_area}
                    alt={patient.name || "Patient"}
                  />

                  <div className="flex-1 min-w-0 text-sm">
                    <p className="font-semibold text-gray-800 truncate">
                      {patient.name || "Unknown Patient"}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {slotDateFormat(item.slotDate)}, {item.slotTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-auto">
                    {item.cancelled ? (
                      <span className="text-red-500 bg-red-50 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancel(item._id)}
                          disabled={isProcessing}
                          title="Cancel appointment"
                          className="p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <img
                            className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer"
                            src={assets.cancel_icon}
                            alt="Cancel"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleComplete(item._id)}
                          disabled={isProcessing}
                          title="Complete appointment"
                          className="p-1 rounded-full hover:bg-emerald-50 transition-colors disabled:opacity-50"
                        >
                          <img
                            className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer"
                            src={assets.tick_icon}
                            alt="Complete"
                          />
                        </button>
                      </div>
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

export default DoctorDashboard;