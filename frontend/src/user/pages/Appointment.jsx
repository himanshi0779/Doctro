import React, { useContext, useState, useEffect, useCallback } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(UserContext);

  const navigate = useNavigate();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch Doctor details from Context
  const fetchDocInfo = useCallback(() => {
    const info = doctors.find((doc) => doc._id === docId);
    setDocInfo(info || null);
  }, [doctors, docId]);

  // 2. Generate Available Time Slots (7-day window)
  const getAvailableSlots = useCallback(() => {
    if (!docInfo) return;

    let today = new Date();
    let allSlots = [];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date(today);
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0); // Clinic closes at 9:00 PM

      // Adjust start time for today vs upcoming days
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() >= 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;

        // Safe check for slots_booked
        const slotsBooked = docInfo.slots_booked || {};
        const isSlotAvailable = !(
          slotsBooked[slotDate] && slotsBooked[slotDate].includes(formattedTime)
        );

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
            slotDate,
          });
        }

        // Advance slot by 30 mins
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      allSlots.push(timeSlots);
    }

    setDocSlots(allSlots);
  }, [docInfo]);

  // 3. Book Appointment Handler
  const bookAppointment = async () => {
    const activeToken = token || localStorage.getItem("token");

    if (!activeToken) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }

    // Guard: Validate slot selection
    if (!docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
      return toast.warn("No slots available on this selected day.");
    }

    if (!slotTime) {
      return toast.warn("Please select a time slot.");
    }

    setLoading(true);
    try {
      const selectedSlot = docSlots[slotIndex][0];
      const slotDate = selectedSlot.slotDate;

      // Correct headers: sending "token" and standard Bearer authorization
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        {
          headers: {
            token: activeToken,
            Authorization: `Bearer ${activeToken}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Appointment booked successfully!");
        getDoctorsData(); // Refresh doctor catalog slots
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [fetchDocInfo]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo, getAvailableSlots]);

  return (
    docInfo && (
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-6">
        {/* Doctor Info Card */}
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            className="bg-primary w-full sm:max-w-72 rounded-lg object-cover shadow-sm"
            src={docInfo.image}
            alt={docInfo.name}
          />

          <div className="flex-1 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <p className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="Verified" />
            </p>

            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <span className="py-0.5 px-2.5 border text-xs rounded-full font-medium bg-gray-50">
                {docInfo.experience}
              </span>
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
                About <img src={assets.info_icon} alt="Info" />
              </p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {docInfo.about}
              </p>
            </div>

            <p className="text-gray-600 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-900 font-semibold">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots Section */}
        <div className="mt-8">
          <p className="font-semibold text-gray-800 text-lg">Booking Slots</p>

          {/* Days Selector */}
          <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => {
                // Determine day/date label even if day slots are empty
                const slotDayDate = new Date();
                slotDayDate.setDate(slotDayDate.getDate() + index);

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSlotIndex(index);
                      setSlotTime(""); // Reset selected time on day change
                    }}
                    className={`min-w-[68px] text-center py-4 rounded-2xl cursor-pointer transition-all ${
                      slotIndex === index
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "border border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                    }`}
                  >
                    <p className="text-xs font-semibold">
                      {daysOfWeek[slotDayDate.getDay()]}
                    </p>
                    <p className="text-base font-bold mt-1">
                      {slotDayDate.getDate()}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Time Selector */}
          <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
            {docSlots[slotIndex] && docSlots[slotIndex].length > 0 ? (
              docSlots[slotIndex].map((item, index) => (
                <p
                  key={index}
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm px-5 py-2 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                    slotTime === item.time
                      ? "bg-primary text-white shadow-sm"
                      : "border border-gray-300 text-gray-600 hover:border-gray-400 bg-white"
                  }`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-2">
                No appointment slots available for this day.
              </p>
            )}
          </div>

          {/* Book Action Button */}
          <button
            onClick={bookAppointment}
            disabled={loading}
            className="bg-primary hover:bg-opacity-95 text-white text-sm font-medium px-12 py-3 rounded-full mt-6 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Booking..." : "Book an Appointment"}
          </button>
        </div>

        {/* Related Doctors Carousel/Grid */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;