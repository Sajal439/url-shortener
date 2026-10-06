import { env } from "../../config/env.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
const pool = new Pool({ connectionString: env.DATABASE_URL });
// Cast to any to bypass a common TypeScript mismatch between nested versions of @types/pg
// used by @prisma/adapter-pg and the project's local dependency.
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma;
