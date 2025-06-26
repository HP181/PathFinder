'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MentorProfile, AvailabilitySlot, setMentorAvailability } from '@/lib/Firebase/Firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MentorDetailsModalProps {
  mentor: MentorProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MentorDetailsModal({ mentor, isOpen, onClose }: MentorDetailsModalProps) {
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [localAvailability, setLocalAvailability] = useState<AvailabilitySlot[]>(mentor?.availability ?? []);

  // Sync localAvailability when mentor prop changes
  React.useEffect(() => {
    setLocalAvailability(mentor?.availability ?? []);
  }, [mentor]);

  if (!mentor) return null;

  // Handle booking a slot: update slot status to 'booked'
  const handleBookSlot = async (slot: AvailabilitySlot) => {
    if (bookingInProgress) return;

    setBookingInProgress(true);

    try {
      const updatedAvailability: AvailabilitySlot[] = localAvailability.map((s) =>
        s.date === slot.date && s.startTime === slot.startTime && s.endTime === slot.endTime
          ? { ...s, status: 'booked' as 'booked' }
          : s
      );

      setLocalAvailability(updatedAvailability);
      await setMentorAvailability(mentor.uid, updatedAvailability);

      toast.success(`Booked ${slot.date} ${slot.startTime} - ${slot.endTime}`);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book slot. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  // Create portal to render modal outside of container constraints
  const modalContent = (
    <>
      {/* Custom Glass Modal Overlay - PORTAL RENDERED */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            margin: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content - Centered */}
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden z-10">
            {/* Glass Container */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30 blur"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                
                {/* Modal Header */}
                <div className="relative p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 rounded-xl backdrop-blur-sm border border-cyan-400/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                          {mentor.displayName}
                        </h2>
                        <p className="text-gray-300">Mentor Profile & Booking</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="h-5 w-5 text-gray-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="relative p-6 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Industries Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide flex items-center">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                        Industries
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {mentor.industries.map((ind, i) => (
                          <span key={i} className="bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-sm px-3 py-1 rounded-lg">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expertise Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.map((exp, i) => (
                          <span key={i} className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-sm px-3 py-1 rounded-lg">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Professional Background Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide flex items-center">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                        Professional Background
                      </h4>
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                        <p className="text-gray-100 leading-relaxed whitespace-pre-line">
                          {mentor.professionalBackground}
                        </p>
                      </div>
                    </div>

                    {/* Availability Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wide flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                        Available Sessions
                      </h4>
                      {localAvailability && localAvailability.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-auto">
                          {localAvailability.map((slot, i) => {
                            const status = slot.status ?? 'available';
                            const isAvailable = status === 'available';

                            return (
                              <div
                                key={i}
                                className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                                  isAvailable 
                                    ? 'bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/15' 
                                    : 'bg-red-500/10 border-red-400/30 opacity-60'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-white font-medium">
                                      {slot.date}
                                    </p>
                                    <p className="text-gray-200 text-sm">
                                      {slot.startTime} - {slot.endTime}
                                    </p>
                                    <p className={`text-xs font-medium mt-1 ${
                                      isAvailable ? 'text-emerald-300' : 'text-red-300'
                                    }`}>
                                      {status.toUpperCase()}
                                    </p>
                                  </div>
                                  <button
                                    disabled={!isAvailable || bookingInProgress}
                                    onClick={() => handleBookSlot(slot)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      isAvailable && !bookingInProgress
                                        ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-100 border border-emerald-500/40 cursor-pointer transform hover:scale-105'
                                        : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                                    }`}
                                  >
                                    {bookingInProgress ? (
                                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      isAvailable ? 'Book Session' : 'Booked'
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center">
                          <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-300">No availability information available.</p>
                          <p className="text-gray-400 text-sm mt-1">The mentor hasn't set their schedule yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="relative p-6 border-t border-white/20">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-200 hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Cursor Styling */}
      <style jsx global>{`
        button, a, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }
        
        button:disabled, .cursor-not-allowed {
          cursor: not-allowed !important;
        }

        .hover\\:scale-105:hover {
          cursor: pointer !important;
        }
        
        /* Ensure modal appears above everything */
        .z-\\[9999\\] {
          z-index: 9999 !important;
        }
      `}</style>
    </>
  );

  // Use React Portal to render outside of container constraints
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}