import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { AppContext } from "../../AppContext";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const {
    dToken,
    profileData,
    setProfileData,
    getProfileData,
    updateProfileData,
  } = useContext(DoctorContext);

  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken, getProfileData]);

  if (!profileData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4 sm:p-8">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></span>
          <p className="text-sm sm:text-base font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  // Safe Address Extractor
  const getLine1 = () => {
    if (typeof profileData.address === "object" && profileData.address?.line1) {
      return profileData.address.line1;
    }
    if (profileData.address?.info) {
      return profileData.address.info.split(",")[0]?.replace("line1:", "").trim() || "";
    }
    return "";
  };

  const getLine2 = () => {
    if (typeof profileData.address === "object" && profileData.address?.line2) {
      return profileData.address.line2;
    }
    if (profileData.address?.info) {
      return profileData.address.info.split(",")[1]?.replace("line2:", "").trim() || "";
    }
    return "";
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        fees: Number(profileData.fees),
        available: profileData.available,
        address: {
          line1: getLine1(),
          line2: getLine2(),
        },
      };

      const success = await updateProfileData(payload);
      if (success) {
        setIsEdit(false);
      }
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6">
      {/* Profile Card */}
      <div className="flex flex-col md:flex-row gap-5 sm:gap-6 lg:gap-8 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
        {/* Profile Image */}
        <div className="flex justify-center md:justify-start shrink-0">
          <img
            className="w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 object-cover rounded-xl bg-indigo-50 border border-gray-100 shadow-inner"
            src={profileData.image}
            alt={profileData.name}
          />
        </div>

        {/* Details Container */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
              {profileData.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1.5 text-gray-600 text-xs sm:text-sm">
              <p className="font-medium">
                {profileData.degree} - {profileData.speciality}
              </p>
              <span className="py-0.5 px-2.5 border border-gray-300 text-xs rounded-full bg-gray-50 font-medium whitespace-nowrap">
                {profileData.experience}
              </span>
            </div>

            {/* About Section */}
            <div className="mt-4 text-left">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wider md:normal-case">
                About:
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed break-words">
                {profileData.about || "No bio added yet."}
              </p>
            </div>
          </div>

          {/* Dynamic Settings: Fees & Availability */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 pt-4 border-t border-gray-100">
            {/* Fees */}
            <div className="text-xs sm:text-sm text-gray-700 font-medium flex items-center gap-2">
              <span className="shrink-0">Appointment Fee:</span>
              {isEdit ? (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-800">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    value={profileData.fees ?? ""}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: Number(e.target.value),
                      }))
                    }
                    className="border border-gray-300 rounded-lg px-2.5 py-1 w-20 sm:w-24 text-xs sm:text-sm focus:ring-2 focus:ring-[#5F6FFF] outline-none"
                  />
                </div>
              ) : (
                <span className="text-gray-900 font-bold text-xs sm:text-sm">
                  {currency} {profileData.fees}
                </span>
              )}
            </div>

            {/* Availability Checkbox */}
            <div className="flex items-center gap-2 select-none">
              <input
                type="checkbox"
                id="doc-available"
                checked={!!profileData.available}
                disabled={!isEdit}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    available: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-[#5F6FFF] rounded border-gray-300 focus:ring-[#5F6FFF] cursor-pointer disabled:cursor-not-allowed"
              />
              <label
                htmlFor="doc-available"
                className={`text-xs sm:text-sm font-medium ${
                  isEdit ? "text-gray-700 cursor-pointer" : "text-gray-500 cursor-default"
                }`}
              >
                Available for bookings
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Actions Box */}
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-5">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wider md:normal-case">
            Clinic Address:
          </p>
          {isEdit ? (
            <div className="flex flex-col gap-2.5 w-full max-w-md">
              <input
                type="text"
                placeholder="Address Line 1"
                value={getLine1()}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: {
                      ...(typeof prev.address === "object" ? prev.address : {}),
                      line1: e.target.value,
                    },
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#5F6FFF] outline-none"
              />
              <input
                type="text"
                placeholder="Address Line 2"
                value={getLine2()}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: {
                      ...(typeof prev.address === "object" ? prev.address : {}),
                      line2: e.target.value,
                    },
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#5F6FFF] outline-none"
              />
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-0.5">
              <p className="break-words">{getLine1() || "Line 1 not specified"}</p>
              <p className="break-words">{getLine2() || "Line 2 not specified"}</p>
            </div>
          )}
        </div>

        {/* Edit / Save Actions */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {isEdit ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto text-center px-6 py-2.5 bg-[#5F6FFF] hover:bg-[#4c5cf0] text-white text-xs sm:text-sm font-medium rounded-full transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEdit(false);
                  getProfileData();
                }}
                disabled={loading}
                className="w-full sm:w-auto text-center px-6 py-2.5 border border-gray-300 text-gray-600 text-xs sm:text-sm font-medium rounded-full hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEdit(true)}
              className="w-full sm:w-auto text-center px-6 py-2.5 border border-[#5F6FFF] text-[#5F6FFF] hover:bg-[#5F6FFF] hover:text-white text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;