import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Point strictly to the staging environment file
dotenv.config({ path: '.env.staging' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(supabaseUrl, supabaseKey);

const teamMembers = [
    { name: 'Zaid', role: 'Creative Director', email: 'zaid@rfrncs.com' },
    { name: 'Brenden', role: 'Head of Production', email: 'brenden@rfrncs.com' },
    { name: 'Pratik', role: 'Lead Developer', email: 'pratik@rfrncs.com' },
    { name: 'Vihaan', role: 'Founder & CEO', email: 'vihaan@rfrncs.com' },
    { name: 'Aarav', role: 'New Hire - Business Dev', email: 'aarav@rfrncs.com' },
];

const assignees = teamMembers.map(t => t.name);

const demoLeads = [
    { companyName: 'Reliance Retail', poc: 'Mukesh Ambani Jr.', value: 2500000, status: 'Hot Lead', source: 'Apollo', assigned_to: 'Vihaan' },
    { companyName: 'Tata Motors', poc: 'Ratan Sharma', value: 1800000, status: 'Negotiation', source: 'Referral', assigned_to: 'Zaid' },
    { companyName: 'Nykaa', poc: 'Falguni Nayar', value: 900000, status: 'Cold Lead', source: 'Website', assigned_to: 'Brenden' },
    { companyName: 'Zomato', poc: 'Deepinder Goyal', value: 1200000, status: 'Hot Lead', source: 'Apollo', assigned_to: 'Pratik' },
    { companyName: 'Boat Lifestyle', poc: 'Aman Gupta', value: 750000, status: 'Cold Lead', source: 'Seamless', assigned_to: 'Aarav' },
    { companyName: 'Mamaearth', poc: 'Varun Alagh', value: 600000, status: 'Cold Lead', source: 'Website', assigned_to: 'Zaid' },
    { companyName: 'Lenskart', poc: 'Peyush Bansal', value: 1500000, status: 'Negotiation', source: 'Referral', assigned_to: 'Vihaan' },
    { companyName: 'PharmEasy', poc: 'Dharmil Sheth', value: 950000, status: 'Hot Lead', source: 'Apollo', assigned_to: 'Brenden' },
    { companyName: 'Sugar Cosmetics', poc: 'Vineeta Singh', value: 500000, status: 'Cold Lead', source: 'Seamless', assigned_to: 'Pratik' },
    { companyName: 'Urban Company', poc: 'Abhiraj Bhal', value: 2000000, status: 'Closed', source: 'Referral', assigned_to: 'Vihaan' },
    { companyName: 'CarDekho', poc: 'Amit Jain', value: 1100000, status: 'Negotiation', source: 'Apollo', assigned_to: 'Aarav' },
    { companyName: 'Dream11', poc: 'Harsh Jain', value: 3000000, status: 'Hot Lead', source: 'Referral', assigned_to: 'Zaid' },
    { companyName: 'Cred', poc: 'Kunal Shah', value: 1750000, status: 'Cold Lead', source: 'Website', assigned_to: 'Brenden' },
    { companyName: 'Razorpay', poc: 'Harshil Mathur', value: 2200000, status: 'Closed', source: 'Apollo', assigned_to: 'Pratik' },
    { companyName: 'Meesho', poc: 'Vidit Aatrey', value: 800000, status: 'Cold Lead', source: 'Seamless', assigned_to: 'Aarav' },
];

async function seedDemo() {
    console.log("🧹 Wiping staging data...");

    // Clear existing data
    const { error: delLeads } = await db.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delLeads) console.error("Failed to clear leads:", delLeads.message);
    else console.log("  ✅ Leads cleared");

    const { error: delTeam } = await db.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delTeam) console.error("Failed to clear team:", delTeam.message);
    else console.log("  ✅ Team members cleared");

    // Seed Team Members
    console.log("\n👥 Seeding team members...");
    const { error: teamErr } = await db.from('team_members').insert(teamMembers);
    if (teamErr) console.error("  ❌ Team seed failed:", teamErr.message);
    else console.log(`  ✅ ${teamMembers.length} team members inserted`);

    // Seed Leads
    console.log("\n📊 Seeding demo leads...");
    const { error: leadsErr } = await db.from('leads').insert(demoLeads);
    if (leadsErr) console.error("  ❌ Leads seed failed:", leadsErr.message);
    else console.log(`  ✅ ${demoLeads.length} demo leads inserted`);

    console.log("\n🎯 Staging database seeded for demo!");
}

seedDemo();
