import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Define an interface for available time slots
interface AvailableTimeSlot {
  start: string;
  end: string;
}

// Initialize the Google Calendar client
const getCalendarClient = () => {
  const client = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  
  // Fix the calendar initialization by using the correct type signature
  return google.calendar({ 
    version: 'v3', 
    auth: client as any // Type assertion to bypass type error
  });
};

// Get mentor availability
export const getMentorAvailability = async (
  mentorEmail: string,
  startDate: string,
  endDate: string
): Promise<AvailableTimeSlot[]> => {
  try {
    const calendar = getCalendarClient();
    
    // Get the mentor's free/busy information
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate,
        timeMax: endDate,
        items: [{ id: mentorEmail }],
      },
    });
    
    // Extract the busy times
    const busyTimes = response.data.calendars?.[mentorEmail]?.busy || [];
    
    // Convert busy times to available time slots
    // This is a simplified example - you would need more complex logic for real-world use
    const availableSlots: AvailableTimeSlot[] = [];
    
    // TODO: Implement more complex availability calculation
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting mentor availability:', error);
    throw new Error('Failed to get mentor availability');
  }
};

// Create a meeting
export const createMeeting = async (
  mentorEmail: string,
  immigrantEmail: string,
  startTime: string,
  endTime: string,
  summary: string,
  description: string
): Promise<string> => {
  try {
    const calendar = getCalendarClient();
    
    // Create the calendar event
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: 'America/Toronto',
        },
        end: {
          dateTime: endTime,
          timeZone: 'America/Toronto',
        },
        attendees: [
          { email: mentorEmail },
          { email: immigrantEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      },
      conferenceDataVersion: 1,
    });
    
    // Return the event ID and Google Meet link
    return event.data.hangoutLink || '';
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw new Error('Failed to create meeting');
  }
};