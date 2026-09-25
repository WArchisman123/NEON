const { Client } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const CITY_COORDINATES = {
  Bakersfield: { lat: 35.3733, lng: -119.0187 },
  Barstow: { lat: 34.8958, lng: -117.0173 },
  Fresno: { lat: 36.7468, lng: -119.7726 },
  Truckee: { lat: 39.3280, lng: -120.1833 },
  Coachella: { lat: 33.6803, lng: -116.1739 },
  Eureka: { lat: 40.8021, lng: -124.1637 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
};

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase PostgreSQL.");

  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    const res = await client.query(
      `UPDATE public.sites
       SET latitude = $1, longitude = $2
       WHERE location_city ILIKE $3 AND (latitude IS NULL OR longitude IS NULL)`,
      [coords.lat, coords.lng, `%${city}%`]
    );
    if (res.rowCount > 0) {
      console.log(`Updated ${res.rowCount} site(s) for city: ${city} with (${coords.lat}, ${coords.lng})`);
    }
  }

  // Fallback for any remaining null coordinates
  const fallbackRes = await client.query(
    `UPDATE public.sites
     SET latitude = 19.9975, longitude = 73.7898
     WHERE latitude IS NULL OR longitude IS NULL`
  );
  if (fallbackRes.rowCount > 0) {
    console.log(`Updated ${fallbackRes.rowCount} remaining site(s) with fallback coordinates`);
  }

  const check = await client.query(
    `SELECT id, name, location_city, latitude, longitude FROM public.sites`
  );
  console.log("\nAll sites now configured with coordinates:");
  check.rows.forEach((r) => {
    console.log(`- ${r.name} (${r.location_city}): ${r.latitude}, ${r.longitude}`);
  });

  await client.end();
}

main().catch(console.error);
