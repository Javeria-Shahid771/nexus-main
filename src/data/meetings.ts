import { AvailabilitySlot, MeetingRequest } from '../types';

export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: 'slot-1',
    userId: '1', // entrepreneur
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    isBooked: true,
  },
  {
    id: 'slot-2',
    userId: '1',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    isBooked: false,
  },
  {
    id: 'slot-3',
    userId: '1',
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    isBooked: false,
  }
];

export const meetingRequests: MeetingRequest[] = [
  {
    id: 'req-1',
    senderId: '3', // investor
    receiverId: '1', // entrepreneur
    slotId: 'slot-1',
    status: 'accepted',
    message: 'Looking forward to hearing your pitch!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-2',
    senderId: '4', // another investor
    receiverId: '1',
    slotId: 'slot-2',
    status: 'pending',
    message: 'Would love to discuss your recent traction.',
    createdAt: new Date().toISOString(),
  }
];
