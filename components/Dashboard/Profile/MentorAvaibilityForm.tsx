'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/Firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

type AvailabilitySlot = {
  date: string;
  startTime: string;
  endTime: string;
  status?: 'available' | 'booked'; // added status
};

export const MentorAvailabilityForm: React.FC = () => {
  const user = auth.currentUser;
  const mentorUid = user?.uid;

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability from Firestore
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!mentorUid) return setError('User not authenticated');
      setLoading(true);
      try {
        const docRef = doc(db, 'profiles', mentorUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.availability)) {
            setAvailability(data.availability);
          } else {
            setAvailability([]);
          }
        }
      } catch (err) {
        setError('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [mentorUid]);

  const updateAvailabilityInFirestore = async (slots: AvailabilitySlot[]) => {
    if (!mentorUid) return;
    const docRef = doc(db, 'profiles', mentorUid);
    await updateDoc(docRef, {
      availability: slots,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSlot = async () => {
    if (!mentorUid) return setError('User not authenticated');
    if (!date || !startTime || !endTime) return setError('Please fill all fields');
    if (startTime >= endTime) return setError('Start time must be before end time');

    setError(null);
    const newSlot: AvailabilitySlot = { date, startTime, endTime, status: 'available' };

    try {
      const updated = [...availability, newSlot];
      await updateAvailabilityInFirestore(updated);
      setAvailability(updated);
      setDate('');
      setStartTime('');
      setEndTime('');
    } catch (e) {
      setError('Failed to add availability');
    }
  };

  const handleRemoveSlot = async (slot: AvailabilitySlot) => {
    if (!mentorUid) return setError('User not authenticated');

    try {
      const filtered = availability.filter(
        (s) =>
          !(
            s.date === slot.date &&
            s.startTime === slot.startTime &&
            s.endTime === slot.endTime
          )
      );
      await updateAvailabilityInFirestore(filtered);
      setAvailability(filtered);
    } catch (e) {
      setError('Failed to remove availability');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Manage Availability</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading && <p>Loading availability...</p>}

      <div className="mb-4">
        <label>
          Date:{' '}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-1"
          />
        </label>
      </div>

      <div className="mb-4 flex space-x-4">
        <label>
          Start Time:{' '}
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-1"
          />
        </label>
        <label>
          End Time:{' '}
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-1"
          />
        </label>
      </div>

      <button
        onClick={handleAddSlot}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Availability
      </button>

      <hr className="my-6" />

      <h3 className="text-lg font-semibold mb-2">Existing Availability</h3>
      {availability.length === 0 && <p>No availability added yet.</p>}

      <ul>
        {availability.map((slot, idx) => {
  const status = slot.status ?? 'available';
  const statusColor = status === 'available' ? 'text-green-600' : 'text-red-600';

  return (
    <li
      key={`${slot.date}-${slot.startTime}-${slot.endTime}-${idx}`}
      className="flex justify-between items-center mb-2"
    >
      <span>
        {slot.date} | {slot.startTime} - {slot.endTime}{' '}
        <span className={`ml-2 font-semibold ${statusColor}`}>
          [{status.toUpperCase()}]
        </span>
      </span>
      {status !== 'booked' && (
        <button
          onClick={() => handleRemoveSlot(slot)}
          className="text-red-600 hover:underline"
        >
          Remove
        </button>
      )}
    </li>
  );
})}

      </ul>
    </div>
  );
};
