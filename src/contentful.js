// import { createClient } from 'contentful';

const client = createClient({
  space: '55d4qvuj8ah',
  accessToken: 'e4BFBJQiuGHI2ZIrKdxgmaUXNCmRUi46jSwQjbw0pUg'
});

export async function getAnnouncement() {
  const entry = await client.getEntry('YOUR_ENTRY_ID');
  return entry.fields.announcementText;
}