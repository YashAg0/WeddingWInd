/**
 * DB Latency Diagnostic Script
 * 
 * Measures each phase of database connectivity separately to distinguish
 * connection establishment latency from query execution latency.
 * 
 * Run: node scripts/db-latency-diagnostic.mjs
 * Does NOT modify production state. Runs read-only SELECT 1 queries and one user lookup.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env manually since we're running outside Next.js
const envPath = join(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

// Mask credentials in output
const dbUrl = process.env.DATABASE_URL || '';
const urlObj = new URL(dbUrl);
const maskedUrl = `${urlObj.protocol}//${urlObj.username.slice(0,4)}***@${urlObj.host}${urlObj.pathname}${urlObj.search}`;
console.log('\n===== DB LATENCY DIAGNOSTIC =====');
console.log(`Host:     ${urlObj.host}`);
console.log(`Database: ${urlObj.pathname}`);
console.log(`Params:   ${urlObj.search}`);
console.log(`Masked:   ${maskedUrl}`);
console.log('==================================\n');

async function measure(label, fn) {
  const t0 = Date.now();
  let result = 'SUCCESS';
  let detail = '';
  try {
    const r = await fn();
    detail = JSON.stringify(r).slice(0, 80);
  } catch (err) {
    result = 'FAILURE';
    detail = `${err.constructor.name}: ${err.message?.slice(0, 120)}`;
  }
  const elapsed = Date.now() - t0;
  console.log(`[${result.padEnd(7)}] [${String(elapsed).padStart(5)}ms] ${label}`);
  if (detail) console.log(`           → ${detail}`);
  return result === 'SUCCESS';
}

// We import PrismaClient dynamically so construction time is measurable
const { PrismaClient } = await import('@prisma/client');

// --- Phase A: PrismaClient construction ---
let prisma;
const tConstruct0 = Date.now();
try {
  prisma = new PrismaClient({ log: [] });
} catch(e) {
  console.error('FATAL: PrismaClient construction failed:', e.message);
  process.exit(1);
}
const tConstructElapsed = Date.now() - tConstruct0;
console.log(`[INFO   ] [${String(tConstructElapsed).padStart(5)}ms] A. PrismaClient construction`);

// --- Phase B: First $queryRaw SELECT 1 (cold connection) ---
await measure('B. First $queryRaw SELECT 1 (cold connection)', () => prisma.$queryRaw`SELECT 1`);

// --- Phase C: Second $queryRaw SELECT 1 (warm connection) ---
await measure('C. Second $queryRaw SELECT 1 (warm connection)', () => prisma.$queryRaw`SELECT 1`);

// --- Phase D: Third $queryRaw SELECT 1 (pooled connection) ---
await measure('D. Third $queryRaw SELECT 1 (pooled connection)', () => prisma.$queryRaw`SELECT 1`);

// --- Phase E: $transaction with trivial query ---
await measure('E. $transaction { SELECT 1 }', () =>
  prisma.$transaction(async (tx) => tx.$queryRaw`SELECT 1`)
);

// --- Phase F: Actual User lookup by email (read-only, non-mutating) ---
await measure('F. User.findFirst({ where: { email: "founder@..." } }) — read-only', () =>
  prisma.user.findFirst({
    where: { email: 'founder@weddingwithindia.com' },
    select: { id: true, email: true, role: true, status: true, clerkUserId: true }
  })
);

// --- Phase G: Repeat User lookup to measure warm vs cold ---
await measure('G. Repeat User.findFirst (warm path)', () =>
  prisma.user.findFirst({
    where: { email: 'founder@weddingwithindia.com' },
    select: { id: true, role: true, status: true }
  })
);

// --- Phase H: Count all users (schema check) ---
await measure('H. user.count() — check schema/table exists', () =>
  prisma.user.count()
);

// Founder record full audit
console.log('\n===== FOUNDER ACCOUNT AUDIT =====');
try {
  const founders = await prisma.user.findMany({
    where: { email: 'founder@weddingwithindia.com' },
    select: {
      id: true,
      email: true,
      clerkUserId: true,
      role: true,
      status: true,
      createdAt: true
    }
  });
  if (founders.length === 0) {
    console.log('⚠️  NO FOUNDER RECORD FOUND in DB');
  } else if (founders.length > 1) {
    console.log(`🚨 DUPLICATE FOUNDER RECORDS FOUND (${founders.length}):`);
    for (const f of founders) {
      console.log(`   id=${f.id} clerkUserId=${f.clerkUserId} role=${f.role} status=${f.status}`);
    }
  } else {
    const f = founders[0];
    console.log('✅ Exactly ONE founder record found:');
    console.log(`   id:          ${f.id}`);
    console.log(`   email:       ${f.email}`);
    console.log(`   clerkUserId: ${f.clerkUserId}`);
    console.log(`   role:        ${f.role}`);
    console.log(`   status:      ${f.status}`);
    console.log(`   createdAt:   ${f.createdAt}`);
    if (f.role !== 'ADMIN') console.log('⚠️  WARNING: Role is NOT ADMIN');
    if (f.status !== 'ACTIVE') console.log('⚠️  WARNING: Status is NOT ACTIVE');
    if (f.clerkUserId?.startsWith('pending_admin')) console.log('🚨 CRITICAL: clerkUserId is still a pending_admin placeholder!');
  }
} catch (err) {
  console.error('Founder audit failed:', err.message);
}

await prisma.$disconnect();
console.log('\n===== DIAGNOSTIC COMPLETE =====\n');
