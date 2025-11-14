/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./configs/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
    //old  url: "postgresql://neondb_owner:npg_lfxEUS3LXZ1n@ep-ancient-bread-a8ve4ira.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
   url: "postgresql://neondb_owner:npg_VSeFIQ1yurx0@ep-wild-feather-a8261hym-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  };