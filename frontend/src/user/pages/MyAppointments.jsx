import React, { useContext, useEffect, useState, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatDate = (slotDate) => {
    if (!slotDate) return "";
    const [day, month, year] = slotDate.split("_");
    return `${day} ${months[Number(month)]} ${year}`;
  };

  // Helper for consistent auth headers
  const getAuthHeaders = useCallback(() => {
    const activeToken = token || localStorage.getItem("token");
    return {
      headers: {
        token: activeToken,
        Authorization: `Bearer ${activeToken}`,
      },
    };
  }, [token]);

  // 1. Fetch user appointments
  const getUserAppointments = useCallback(async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/appointments`,
        getAuthHeaders()
      );

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get Appointments Error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl, getAuthHeaders]);

  // 2. Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        getAuthHeaders()
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel Appointment Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 3. Verify Razorpay Payment Signature
  const initPay = (order) => {
    const options = {
      key: import.meta.env?.VITE_RAZORPAY_KEY_ID || "rzp_test_ejY2TL7KEDEFjj",
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Consultation Fee Payment",
      order_id: order.id,
      receipt: order.receipt,

      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verifyRazorpay`,
            response,
            getAuthHeaders()
          );

          if (data.success) {
            toast.success("Payment Successful");
            getUserAppointments();
            navigate("/my-appointments");
          } else {
            toast.error(data.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Verify Payment Error:", error);
          toast.error(error.response?.data?.message || "Payment Failed");
        }
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      toast.error("Razorpay SDK failed to load. Please check your network.");
    }
  };

  // 4. Initiate Razorpay Order
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        getAuthHeaders()
      );

      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Initiate Payment Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Safe Address Formatter
  const renderAddress = (address) => {
    if (!address) return <p className="text-xs text-gray-400">Address not provided</p>;
    
    // Case A: Address is an object with line1, line2
    if (typeof address === "object" && address.line1) {
      return (
        <>
          <p className="text-xs">{address.line1}</p>
          {address.line2 && <p className="text-xs">{address.line2}</p>}
        </>
      );
    }

    // Case B: Address is a string
    if (typeof address === "string") {
      return <p className="text-xs">{address}</p>;
    }

    // Case C: Legacy string format "line1:...,line2:..."
    if (address.info) {
      const parts = address.info.split(",");
      return (
        <>
          <p className="text-xs">{parts[0]?.replace("line1:", "").trim()}</p>
          <p className="text-xs">{parts[1]?.replace("line2:", "").trim()}</p>
        </>
      );
    }

    return null;
  };

  useEffect(() => {
    getUserAppointments();
  }, [getUserAppointments]);

  return (
    <div className="px-3 sm:px-0 max-w-5xl mx-auto pb-12">
      <h1 className="pb-3 mt-10 font-medium text-zinc-700 border-b text-xl">
        My Appointments
      </h1>

      <div className="mt-4">
        {loading ? (
          <p className="text-zinc-500 mt-4">Loading appointments...</p>
        ) : appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div
              className="flex flex-col sm:flex-row gap-4 py-4 border-b items-start sm:items-center"
              key={item._id || index}
            >
              {/* Doctor Image */}
              <div>
                <img
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg object-cover bg-indigo-50"
                  src={item.docData?.image}
                  alt={item.docData?.name || "Doctor"}
                />
              </div>

              {/* Doctor Details */}
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold text-lg">
                  {item.docData?.name}
                </p>
                <p className="text-sm text-zinc-500">{item.docData?.speciality}</p>

                <p className="mt-2 font-medium text-neutral-700">Address:</p>
                {renderAddress(item.docData?.address)}

                <p className="text-xs mt-2">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {formatDate(item.slotDate)} | {item.slotTime}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-2 sm:mt-0 sm:min-w-44 w-full sm:w-auto">
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <button className="py-2 border rounded bg-indigo-50 text-indigo-600 font-medium cursor-default">
                    Paid
                  </button>
                )}

                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    onClick={() => appointmentRazorpay(item._id)}
                    className="py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded transition-all duration-200"
                  >
                    Pay Online
                  </button>
                )}

                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="py-2 border border-zinc-300 text-stone-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded transition-all duration-200"
                  >
                    Cancel appointment
                  </button>
                )}

                {item.cancelled && !item.isCompleted && (
                  <button className="py-2 border border-red-400 rounded text-red-500 cursor-not-allowed bg-red-50/40">
                    Appointment cancelled
                  </button>
                )}

                {item.isCompleted && (
                  <button className="py-2 border border-green-500 rounded text-green-600 cursor-not-allowed bg-green-50/40">
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-zinc-500 mt-4">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;