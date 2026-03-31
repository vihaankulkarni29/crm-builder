import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Point strictly to the staging environment file
dotenv.config({ path: '.env.staging' });

const db = neon(process.env.DATABASE_URL!);

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

    try {
        await db`DELETE FROM leads`;
        console.log("  ✅ Leads cleared");
        await db`DELETE FROM team_members`;
        console.log("  ✅ Team members cleared");

        console.log("\n👥 Seeding team members...");
        for (const tm of teamMembers) {
            const avatarId = Math.floor(Math.random() * 8) + 1;
            await db`INSERT INTO team_members (name, role, status, efficiency, avatar) 
                     VALUES (${tm.name}, ${tm.role}, 'Online', '100%', ${'/avatars/0' + avatarId + '.png'})`;
        }
        console.log(`  ✅ ${teamMembers.length} team members inserted`);

        console.log("\n📊 Seeding demo leads...");
        for (const lead of demoLeads) {
            await db`INSERT INTO leads (company, contact_person, value, status, source, assigned_to) 
                     VALUES (${lead.companyName}, ${lead.poc}, ${lead.value}, ${lead.status}, ${lead.source}, ${lead.assigned_to})`;
        }
        console.log(`  ✅ ${demoLeads.length} demo leads inserted`);

        console.log("\n🎯 Staging database seeded for demo!");
    } catch (error: any) {
        console.error("❌ Seed failed:", error.message);
    }
}

seedDemo();
