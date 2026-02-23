import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'real-estate-scraper',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
