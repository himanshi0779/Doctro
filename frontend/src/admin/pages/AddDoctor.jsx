import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('1 Year');
  const [fees, setFees] = useState('');
  const [about, setAbout] = useState('');
  const [speciality, setSpeciality] = useState('General Physician');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [loading, setLoading] = useState(false);

  const { backendUrl, aToken, getAllDoctors } = useContext(AdminContext);

  // Manage memory cleanup for image previews
  useEffect(() => {
    if (!docImg) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(docImg);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [docImg]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!docImg) return toast.error('Please upload a doctor picture');

    const activeToken = aToken || localStorage.getItem('aToken');
    if (!activeToken) return toast.error('Unauthorized. Please log in as Admin.');

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', docImg);
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password.trim());
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about.trim());
      formData.append('speciality', speciality);
      formData.append('degree', degree.trim());
      formData.append('address', JSON.stringify({ line1: address1.trim(), line2: address2.trim() }));

      const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: {
          atoken: activeToken,
          token: activeToken,
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (data.success) {
        toast.success(data.message || 'Doctor added successfully');
        if (getAllDoctors) getAllDoctors();

        // Reset form
        setDocImg(null);
        setName('');
        setEmail('');
        setPassword('');
        setExperience('1 Year');
        setFees('');
        setAbout('');
        setSpeciality('General Physician');
        setDegree('');
        setAddress1('');
        setAddress2('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Add Doctor Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-4 sm:m-6 w-full flex justify-center">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Add Doctor</h2>

        {/* Image upload */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 text-gray-600">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-50 border border-gray-200 object-cover hover:opacity-80 transition"
              src={previewUrl || assets.upload_area}
              alt="Doctor Preview"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            accept="image/*"
            hidden
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Upload doctor picture</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, or WEBP up to 5MB</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Doctor Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Dr. Full Name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Doctor Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="doctor@prescripto.com"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Set Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Minimum 8 characters"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Experience</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF] bg-white"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1} Year`}>
                    {`${i + 1} Year${i > 0 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Consultation Fee</label>
              <input
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                type="number"
                min="0"
                placeholder="Fee amount"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Speciality</label>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF] bg-white"
              >
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Education / Degree</label>
              <input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                type="text"
                placeholder="e.g. MBBS, MD, MS"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Clinic Address</label>
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                type="text"
                placeholder="Address Line 1"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF] mb-2"
                required
              />
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                type="text"
                placeholder="Address Line 2"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
              />
            </div>
          </div>
        </div>

        {/* About Doctor */}
        <div className="flex flex-col gap-1 mt-6">
          <label className="text-xs font-semibold text-gray-700">About Doctor</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Write a brief professional overview..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F65FF]"
            rows={4}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full sm:w-auto bg-[#5F65FF] hover:bg-[#4a54cc] text-white font-medium px-8 py-2.5 rounded-full transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Adding Doctor...' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;