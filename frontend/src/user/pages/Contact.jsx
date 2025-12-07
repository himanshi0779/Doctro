import React from 'react';
import { assets } from '../../assets/assets';

const Contact = () => {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20">

      {/* Title */}
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          CONTACT <span className="text-gray-700 font-semibold">US</span>
        </p>
      </div>

      {/* Main Section */}
      <div className="my-10 flex flex-col md:flex-row gap-10 md:gap-16 mb-28 text-sm items-center">

        {/* Image */}
        <img
          className="w-full md:max-w-[360px] rounded-lg"
          src={assets.contact_image}
          alt="Contact"
        />

        {/* Text Content */}
        <div className="flex flex-col justify-center gap-6 md:w-1/2 text-gray-600">

          <p className="font-semibold text-lg text-gray-700">Our Office</p>

          <p className="text-gray-500 leading-6">
            54709 Willms Station <br /> Suite 350, Washington, USA
          </p>

          <p className="text-gray-500 leading-6">
            Tel: (415) 555-0132 <br />
            Email: greatstackdev@gmail.com
          </p>

          <p className="font-semibold text-lg text-gray-700">
            Careers at DOCTRO
          </p>

          <p className="text-gray-500">
            Learn more about our teams and job openings.
          </p>

          <button
            className="
              border border-black px-8 py-3 text-sm rounded-md 
              hover:bg-black hover:text-white 
              transition-all duration-300
            "
          >
            Explore Jobs
          </button>
        </div>

      </div>
    </div>
  );
};

export default Contact;
