import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { AppContext } from "../../AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  // Handlers with action guard
  const handleCancel = async (appointmentId) => {
    if (actionLoadingId) return;
    setActionLoadingId(appointmentId);
    await cancelAppointment(appointmentId);
    setActionLoadingId(null);
  };

  const handleComplete = async (appointmentId) => {
    if (actionLoadingId) return;
    setActionLoadingId(appointmentId);
    await completeAppointment(appointmentId);
    setActionLoadingId(null);
  };

  return (
    <div className="w-full max-w-6xl m-4 sm:m-5">
      <p className="mb-3 text-lg sm:text-xl font-semibold text-gray-800">
        All Appointments
      </p>

      <div className="bg-white border border-gray-200 rounded-xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto shadow-sm">
        {/* Header for desktop screens */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_1fr_1fr_2.5fr_1fr_1.5fr] gap-2 py-3.5 px-6 border-b border-gray-200 font-medium text-gray-600 bg-gray-50/50">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p className="text-center">Action</p>
        </div>

        {/* Appointment Rows */}
        {appointments && appointments.length > 0 ? (
          appointments
            .slice()
            .reverse()
            .map((item, index) => {
              const patient = item.userData || {};
              const isActionInProgress = actionLoadingId === item._id;

              return (
                <div
                  key={item._id || index}
                  className="flex flex-col sm:flex-row sm:grid sm:grid-cols-[0.5fr_2.5fr_1fr_1fr_2.5fr_1fr_1.5fr] items-start sm:items-center gap-3 sm:gap-2 px-4 sm:px-6 py-3.5 border-b border-gray-100 hover:bg-gray-50/80 transition-colors text-gray-600 text-sm"
                >
                  {/* Row Number */}
                  <p className="hidden sm:block font-medium text-gray-400">
                    {index + 1}
                  </p>

                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0"
                      src={patient.image || assets.upload_area}
                      alt={patient.name || "Patient"}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {patient.name || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-gray-400 sm:hidden">
                        Age: {patient.dob ? calculateAge(patient.dob) : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        item.payment
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {item.payment ? "Online" : "CASH"}
                    </span>
                  </div>

                  {/* Age (Desktop) */}
                  <p className="hidden sm:block">
                    {patient.dob ? calculateAge(patient.dob) : "N/A"}
                  </p>

                  {/* Date & Time */}
                  <p className="text-gray-700 font-medium sm:font-normal">
                    {slotDateFormat(item.slotDate)}, {item.slotTime}
                  </p>

                  {/* Fees */}
                  <p className="font-medium text-gray-800">
                    {currency}
                    {item.amount}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-start sm:justify-center gap-2 mt-1 sm:mt-0">
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
                        {/* Cancel Action */}
                        <button
                          type="button"
                          onClick={() => handleCancel(item._id)}
                          disabled={isActionInProgress}
                          title="Cancel appointment"
                          className="p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <img
                            className="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer"
                            src={assets.cancel_icon}
                            alt="Cancel"
                          />
                        </button>

                        {/* Complete Action */}
                        <button
                          type="button"
                          onClick={() => handleComplete(item._id)}
                          disabled={isActionInProgress}
                          title="Complete appointment"
                          className="p-1 rounded-full hover:bg-emerald-50 transition-colors disabled:opacity-50"
                        >
                          <img
                            className="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-base font-medium">No appointments booked yet</p>
            <p className="text-xs text-gray-400 mt-1">
              New patient bookings will appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;