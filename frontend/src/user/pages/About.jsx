import React from 'react';
import { assets } from '../../assets/assets';

const About = () => {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-10">
      
      {/* Title */}
      <div className="text-center text-2xl text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      {/* Top Section */}
      <div className="my-10 flex flex-col md:flex-row gap-10 md:gap-12">
        <img
          className="w-full md:max-w-[360px] rounded-lg"
          src={assets.about_image}
          alt="About Doctro"
        />

        <div className="flex flex-col justify-center gap-6 text-sm text-gray-600 md:w-2/3">
          <p>
            Welcome to Doctro, your trusted partner in managing your healthcare
            needs conveniently and efficiently. At Doctro, we understand the
            challenges individuals face when it comes to scheduling doctor appointments
            and managing their health records.
          </p>

          <p>
            Doctro is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior service.
            Whether you're booking your first appointment or managing ongoing care,
            Doctro is here to support you every step of the way.
          </p>

          <b className="text-gray-800">Our Vision</b>

          <p>
            Our vision at Doctro is to create a seamless healthcare experience for
            every user. We aim to bridge the gap between patients and healthcare
            providers, making it easier for you to access the care you need, when you
            need it.
          </p>
        </div>
      </div>

      {/* Why Choose Us Title */}
      <div className="text-xl my-6">
        <p>
          WHY <span className="text-gray-700 font-semibold">CHOOSE US</span>
        </p>
      </div>

      {/* Why Choose Us Boxes */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          gap-6
        "
      >
        <div className="
          border 
          px-8 md:px-12 
          py-8 
          flex flex-col 
          gap-4 
          text-gray-600 
          text-[15px] 
          rounded-lg
          hover:bg-blue-500 
          hover:text-white 
          transition-all 
          duration-300 
          cursor-pointer
        ">
          <b className="text-base">EFFICIENCY:</b>
          <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>

        <div className="
          border 
          px-8 md:px-12 
          py-8 
          flex flex-col 
          gap-4 
          text-gray-600 
          text-[15px] 
          rounded-lg
          hover:bg-blue-500 
          hover:text-white 
          transition-all 
          duration-300 
          cursor-pointer
        ">
          <b className="text-base">CONVENIENCE:</b>
          <p>Access to a network of trusted healthcare professionals in your area.</p>
        </div>

        <div className="
          border 
          px-8 md:px-12 
          py-8 
          flex flex-col 
          gap-4 
          text-gray-600 
          text-[15px] 
          rounded-lg
          hover:bg-blue-500 
          hover:text-white 
          transition-all 
          duration-300 
          cursor-pointer
        ">
          <b className="text-base">PERSONALIZATION:</b>
          <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
