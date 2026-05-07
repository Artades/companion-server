export type AppEvents = {
  'event.created': {
    eventId: string;
    creatorId: string;
  };

  'event.updated': {
    eventId: string;
    updatedBy: string;
  };

  'event.cancelled': {
    eventId: string;
    cancelledBy: string;
  };

  'event.invitation.sent': {
    eventId: string;
    senderId: string;
    receiverId: string;
  };
};
