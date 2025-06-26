import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

interface AvailableTimeSlot {
  start: string;
  end: string;
}

// Initialize the service-account authenticated client
const getCalendarClient = () => {
  const client = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  
  return google.calendar({
    version: 'v3',
    auth: client as any
  });
};

/**
 * Get mentor's busy time and derive available slots.
 */
export const getMentorAvailability = async (
  mentorEmail: string,
  startDate: string, // ISO
  endDate: string
): Promise<AvailableTimeSlot[]> => {
  try {
    const calendar = getCalendarClient();
    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate,
        timeMax: endDate,
        items: [{ id: mentorEmail }],
      },
    });

    const busy = data.calendars?.[mentorEmail]?.busy || [];

    // In a real app, you'd invert busy to available across working hours
    return busy.map(slot => ({
      start: slot.start!,
      end: slot.end!,
    }));
  } catch (err) {
    console.error('Error retrieving availability', err);
    throw new Error('Failed to get availability');
  }
};

/**
 * Create a meeting event between mentor and immigrant.
 */
export const createMeeting = async (
  mentorEmail: string,
  immigrantEmail: string,
  startTime: string,
  endTime: string,
  summary: string,
  description: string
): Promise<{ eventId: string; meetLink: string }> => {
  try {
    const calendar = getCalendarClient();
    const { data: e } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: startTime, timeZone: 'America/Toronto' },
        end:   { dateTime: endTime, timeZone: 'America/Toronto' },
        attendees: [
          { email: mentorEmail },
          { email: immigrantEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${mentorEmail}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    return {
      eventId: e.id!,
      meetLink: e.hangoutLink || '',
    };
  } catch (err) {
    console.error('Error creating meeting', err);
    throw new Error('Failed to create meeting');
  }
};
