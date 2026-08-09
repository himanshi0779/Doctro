import React from "react";
import { specialityData } from "../../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <div className="w-full flex justify-center">
      <div
        className="max-w-5xl w-full flex flex-col items-center gap-4 py-16 text-gray-800 dark:text-gray-100 px-4"
        id="speciality"
      >
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-center">
          Find by Speciality
        </h1>

        <p className="text-sm text-center sm:w-1/2 md:w-1/3 text-gray-600 dark:text-gray-400">
          Simply browse through our extensive list of trusted doctors, schedule
          your appointment hassle-free.
        </p>

        {/* Scroll Container */}
        <div
          className="
            flex gap-6 sm:gap-10 py-4
            w-full
            overflow-x-auto
            scrollbar-none
            px-4 sm:px-6
            justify-start md:justify-center
          "
        >
          {specialityData.map((item, index) => (
            <Link
              key={index}
              to={`/doctors/${item.speciality}`}
              onClick={() => window.scrollTo(0, 0)}
              className="
                flex flex-col items-center text-center
                flex-shrink-0
                cursor-pointer hover:-translate-y-2 transition-all duration-300
                w-20 sm:w-24
              "
            >
              <img
                className="w-16 sm:w-20 mb-2 object-contain"
                src={item.image}
                alt={item.speciality}
              />
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-normal">
                {item.speciality}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialityMenu;