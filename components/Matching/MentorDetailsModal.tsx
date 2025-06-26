'use client';

import React, { useState } from 'react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mentor.displayName} - Full Profile</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <h4 className="font-semibold mb-1">Industries</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.industries.map((ind, i) => (
              <Badge key={i}>{ind}</Badge>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-1">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((exp, i) => (
              <Badge key={i} variant="secondary">
                {exp}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-1">Professional Background</h4>
          <p className="whitespace-pre-line">{mentor.professionalBackground}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Availability</h4>
          {localAvailability && localAvailability.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-auto">
              {localAvailability.map((slot, i) => {
                const status = slot.status ?? 'available';
                const isAvailable = status === 'available';

                return (
                  <div
                    key={i}
                    className={`p-3 border rounded flex justify-between items-center ${
                      isAvailable ? 'border-green-500' : 'border-red-400 bg-red-100'
                    }`}
                  >
                    <div>
                      <p>
                        <strong>{slot.date}</strong> {slot.startTime} - {slot.endTime}
                      </p>
                      <p className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {status.toUpperCase()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={!isAvailable || bookingInProgress}
                      onClick={() => handleBookSlot(slot)}
                    >
                      {isAvailable ? 'Book' : 'Booked'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No availability information.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
