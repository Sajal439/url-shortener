import { Snowflake } from "nodejs-snowflake";

// ⚠️ Instance ID must be unique per server in production
const INSTANCE_ID = Number(process.env.INSTANCE_ID || 1);

// Custom epoch (optional but good practice)
const CUSTOM_EPOCH = 1704067200000; // Jan 1, 2024

const snowflake = new Snowflake({
  custom_epoch: CUSTOM_EPOCH,
  instance_id: INSTANCE_ID,
});

// Export a clean function (don’t expose raw instance)
export const generateId = (): bigint => {
  return BigInt(snowflake.getUniqueID().toString());
};
