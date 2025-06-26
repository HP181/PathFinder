'use client';

import React, { useState, useEffect } from 'react';
import { useRecruiterStore } from '@/lib/Store/RecruiterStore';
import { createOrUpdateProfile, RecruiterProfile, getUserProfile } from '@/lib/Firebase/Firestore';
import { useAuthStore } from '@/lib/Store/Auth-Store';

export function RecruiterProfileForm() {
  const { user } = useAuthStore();
  const { profile, updateProfile } = useRecruiterStore();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    linkedIn: '',
    position: '',
    companyName: '',
    companyWebsite: '',
    companyIndustry: '',
    location: '',
    companyDescription: '',
  });

  useEffect(() => {
    if (!user?.uid) return;

    const loadProfile = async () => {
      const recruiterProfile = await getUserProfile(user.uid) as RecruiterProfile;
      if (recruiterProfile) {
        setFormData({
          displayName: recruiterProfile.displayName || '',
          email: recruiterProfile.email || '',
          phone: recruiterProfile.phone || '',
          linkedIn: recruiterProfile.linkedIn || '',
          position: recruiterProfile.position || '',
          companyName: recruiterProfile.companyName || '',
          companyWebsite: recruiterProfile.companyWebsite || '',
          companyIndustry: recruiterProfile.companyIndustry || '',
          location: recruiterProfile.location || '',
          companyDescription: recruiterProfile.companyDescription || '',
        });
      }
    };

    loadProfile();
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        linkedIn: profile.linkedIn || '',
        position: profile.position || '',
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        companyIndustry: profile.companyIndustry || '',
        location: profile.location || '',
        companyDescription: profile.companyDescription || '',
      });
    }
  }, [profile]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    if (profile) {
      if (user?.uid) {
        const temp = profile as RecruiterProfile;
        temp.uid = user.uid
        console.log("profile", temp);
        await createOrUpdateProfile(temp);
        alert('Profile saved successfully!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Recruiter Info</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="displayName" value={formData.displayName} onChange={handleChange} placeholder="Full Name" className="p-2 border rounded" />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="p-2 border rounded" />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="p-2 border rounded" />
        <input name="linkedIn" value={formData.linkedIn} onChange={handleChange} placeholder="LinkedIn (optional)" className="p-2 border rounded" />
        <input name="position" value={formData.position} onChange={handleChange} placeholder="Your Position at Company" className="p-2 border rounded" />
      </div>

      <h2 className="text-xl font-semibold pt-4">Company Info</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" className="p-2 border rounded" />
        <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="Company Website" className="p-2 border rounded" />
        <input name="companyIndustry" value={formData.companyIndustry} onChange={handleChange} placeholder="Industry (e.g., Tech, Finance)" className="p-2 border rounded" />
        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (City, Country)" className="p-2 border rounded" />
      </div>

      <div>
        <label className="block font-medium mb-1">About the Company</label>
        <textarea
          name="companyDescription"
          value={formData.companyDescription}
          onChange={handleChange}
          rows={4}
          placeholder="Brief description about the company"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
}
