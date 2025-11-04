
// Supabase Client Configuration
const SUPABASE_URL = 'https://jdxtokdjcilpdreqbbwo.supabase.co'; // Replace with your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeHRva2RqY2lscGRyZXFiYndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTcyNTUsImV4cCI6MjA3NzEzMzI1NX0.8plafNVZau4spigXb-8ILMWBctTNmSO3HhGFl-kds3s'; // Replace with your key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


//  // Function to fetch data from the 'profiles' table
//  async function fetchProfiles() {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')   // Exact table name
//         .select('*')
//         .limit(5);          // Adjust limit as needed

//       if (error) {
//         console.error('Supabase Error:', error);
//       } else if (!data || data.length === 0) {
//         console.log('No data found in profiles table.');
//       } else {
//         console.log('Profiles Data:', data);
//       }
//     } catch (err) {
//       console.error('Unexpected Error:', err);
//     }
//   }

//   // Call the function to fetch data
//   fetchProfiles();