import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xujunngpywpmyuvnludl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1anVubmdweXdwbXl1dm5sdWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTQyODcsImV4cCI6MjA5MDQ3MDI4N30.vZNMEd8e-UR_EmwM8qqZ4pIu2Wn22K8OBnBDrTdSsdI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
