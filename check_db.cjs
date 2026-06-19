const fetch = require('node-fetch');
const url = 'https://lcuojjmgkgzfferoollp.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdW9qam1na2d6ZmZlcm9vbGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjQxNTcsImV4cCI6MjA5NDc0MDE1N30.s7GFxIkE_e4ZigR0Sar3un_6u7zUzPaTSeRVcbmGKjw';

(async () => {
  // Sign in as receptionist
  const res = await fetch(url + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'apikey': anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'recepcion@gmail.com', password: '123456' })
  });
  const data = await res.json();
  
  if (!data.access_token) {
    console.log('Sign in failed:', JSON.stringify(data));
    return;
  }
  
  console.log('✓ Signed in as recepcion@gmail.com');
  console.log('User ID:', data.user.id);
  console.log('Banned:', data.user.banned_until || 'no');
  
  const headers = { 'apikey': anonKey, 'Authorization': 'Bearer ' + data.access_token };

  // Query profile
  const profile = await (await fetch(url + '/rest/v1/profiles?select=*&id=eq.' + data.user.id, { headers })).json();
  console.log('\nProfile:', JSON.stringify(profile, null, 2));

  // Try to query checkins
  const checkins = await (await fetch(url + '/rest/v1/checkins?select=id,status&limit=5', { headers })).json();
  console.log('\nCheckins:', JSON.stringify(checkins, null, 2));
  console.log('Checkins error:', checkins.error || 'none');

  // Try to query rooms
  const rooms = await (await fetch(url + '/rest/v1/rooms?select=id,number&limit=5', { headers })).json();
  console.log('\nRooms:', JSON.stringify(rooms, null, 2));
  console.log('Rooms error:', rooms.error || 'none');

  // Try to query guests
  const guests = await (await fetch(url + '/rest/v1/guests?select=id,full_name&limit=5', { headers })).json();
  console.log('\nGuests:', JSON.stringify(guests, null, 2));
  console.log('Guests error:', guests.error || 'none');

  // Try to query invoices
  const invoices = await (await fetch(url + '/rest/v1/invoices?select=id,serie,numero&limit=5', { headers })).json();
  console.log('\nInvoices:', JSON.stringify(invoices, null, 2));
  console.log('Invoices error:', invoices.error || 'none');

  // Try to query fiscal config
  const fiscal = await (await fetch(url + '/rest/v1/hotel_fiscal_config?select=*&limit=5', { headers })).json();
  console.log('\nFiscal config:', JSON.stringify(fiscal, null, 2));
  console.log('Fiscal error:', fiscal.error || 'none');
})().catch(e => console.error(e));
