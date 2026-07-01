import pg from 'pg'
const { Client } = pg

const DATABASE_URL = 'postgresql://neondb_owner:npg_KX7D2fWpgFSs@ep-late-term-aplyo381.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require'

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
})

async function migrate() {
  console.log('Connecting to Neon...')
  await client.connect()
  console.log('✅ Connected!\n')

  // ── Enums ────────────────────────────────────────────────────────────────
  await client.query(`DO $$ BEGIN CREATE TYPE "BookingStatus" AS ENUM ('confirmed','cancelled','rescheduled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`)
  await client.query(`DO $$ BEGIN CREATE TYPE "BookingQuestionType" AS ENUM ('short_text','long_text','select'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`)
  await client.query(`DO $$ BEGIN CREATE TYPE "NotificationType" AS ENUM ('booking_confirmed','booking_cancelled','booking_rescheduled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`)
  await client.query(`DO $$ BEGIN CREATE TYPE "NotificationStatus" AS ENUM ('logged','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`)
  console.log('✅ Enums created')

  // ── User ─────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id"                         TEXT NOT NULL DEFAULT gen_random_uuid(),
      "name"                       TEXT,
      "email"                      TEXT,
      "emailVerified"              TIMESTAMP(3),
      "image"                      TEXT,
      "timezone"                   TEXT NOT NULL DEFAULT 'America/New_York',
      "activeAvailabilitySchedule" TEXT NOT NULL DEFAULT 'Default Schedule',
      "createdAt"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
  `)
  try { await client.query(`ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");`) } catch {}
  console.log('✅ User table')

  // ── Account ──────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Account" (
      "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
      "userId"            TEXT NOT NULL,
      "type"              TEXT NOT NULL,
      "provider"          TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token"     TEXT,
      "access_token"      TEXT,
      "expires_at"        INTEGER,
      "token_type"        TEXT,
      "scope"             TEXT,
      "id_token"          TEXT,
      "session_state"     TEXT,
      CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider","providerAccountId"),
      CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
  `)
  console.log('✅ Account table')

  // ── Session ───────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Session" (
      "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
      "sessionToken" TEXT NOT NULL,
      "userId"       TEXT NOT NULL,
      "expires"      TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Session_sessionToken_key" UNIQUE ("sessionToken"),
      CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
  `)
  console.log('✅ Session table')

  // ── VerificationToken ────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token"      TEXT NOT NULL,
      "expires"    TIMESTAMP(3) NOT NULL,
      CONSTRAINT "VerificationToken_token_key" UNIQUE ("token"),
      CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier","token")
    );
  `)
  console.log('✅ VerificationToken table')

  // ── EventType ─────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "EventType" (
      "id"                  TEXT NOT NULL DEFAULT gen_random_uuid(),
      "title"               TEXT NOT NULL,
      "description"         TEXT NOT NULL,
      "duration"            INTEGER NOT NULL,
      "slug"                TEXT NOT NULL,
      "color"               TEXT NOT NULL DEFAULT 'bg-blue-500',
      "bufferBeforeMinutes" INTEGER NOT NULL DEFAULT 0,
      "bufferAfterMinutes"  INTEGER NOT NULL DEFAULT 0,
      "userId"              TEXT NOT NULL,
      "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EventType_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "EventType_slug_key" UNIQUE ("slug"),
      CONSTRAINT "EventType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
  `)
  console.log('✅ EventType table')

  // ── Availability ──────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Availability" (
      "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
      "scheduleName" TEXT NOT NULL DEFAULT 'Default Schedule',
      "dayOfWeek"    INTEGER NOT NULL,
      "startTime"    TIME(0) NOT NULL,
      "endTime"      TIME(0) NOT NULL,
      "userId"       TEXT NOT NULL,
      "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Availability_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
  `)
  await client.query(`CREATE INDEX IF NOT EXISTS "Availability_userId_scheduleName_dayOfWeek_idx" ON "Availability"("userId","scheduleName","dayOfWeek");`)
  console.log('✅ Availability table')

  // ── Booking ───────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Booking" (
      "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
      "name"              TEXT NOT NULL,
      "email"             TEXT NOT NULL,
      "notes"             TEXT,
      "date"              DATE NOT NULL,
      "startTime"         TIME(0) NOT NULL,
      "endTime"           TIME(0) NOT NULL,
      "status"            "BookingStatus" NOT NULL,
      "eventTypeId"       TEXT NOT NULL,
      "rescheduledFromId" TEXT,
      "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Booking_eventTypeId_date_startTime_status_key" UNIQUE ("eventTypeId","date","startTime","status"),
      CONSTRAINT "Booking_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE CASCADE,
      CONSTRAINT "Booking_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Booking"("id") ON DELETE SET NULL
    );
  `)
  await client.query(`CREATE INDEX IF NOT EXISTS "Booking_eventTypeId_date_idx" ON "Booking"("eventTypeId","date");`)
  console.log('✅ Booking table')

  // ── BookingQuestion ───────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "BookingQuestion" (
      "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
      "label"       TEXT NOT NULL,
      "type"        "BookingQuestionType" NOT NULL,
      "required"    BOOLEAN NOT NULL DEFAULT false,
      "position"    INTEGER NOT NULL DEFAULT 0,
      "optionsJson" TEXT,
      "eventTypeId" TEXT NOT NULL,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BookingQuestion_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "BookingQuestion_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE CASCADE
    );
  `)
  await client.query(`CREATE INDEX IF NOT EXISTS "BookingQuestion_eventTypeId_position_idx" ON "BookingQuestion"("eventTypeId","position");`)
  console.log('✅ BookingQuestion table')

  // ── BookingAnswer ─────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "BookingAnswer" (
      "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
      "value"             TEXT NOT NULL,
      "bookingId"         TEXT NOT NULL,
      "bookingQuestionId" TEXT NOT NULL,
      "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BookingAnswer_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "BookingAnswer_bookingId_bookingQuestionId_key" UNIQUE ("bookingId","bookingQuestionId"),
      CONSTRAINT "BookingAnswer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
      CONSTRAINT "BookingAnswer_bookingQuestionId_fkey" FOREIGN KEY ("bookingQuestionId") REFERENCES "BookingQuestion"("id") ON DELETE CASCADE
    );
  `)
  console.log('✅ BookingAnswer table')

  // ── DateOverride ──────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "DateOverride" (
      "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
      "date"      DATE NOT NULL,
      "blocked"   BOOLEAN NOT NULL DEFAULT false,
      "startTime" TIME(0),
      "endTime"   TIME(0),
      "userId"    TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DateOverride_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "DateOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
  `)
  await client.query(`CREATE INDEX IF NOT EXISTS "DateOverride_userId_date_idx" ON "DateOverride"("userId","date");`)
  console.log('✅ DateOverride table')

  // ── NotificationLog ───────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS "NotificationLog" (
      "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
      "type"        "NotificationType" NOT NULL,
      "recipient"   TEXT NOT NULL,
      "subject"     TEXT NOT NULL,
      "payloadJson" TEXT NOT NULL,
      "status"      "NotificationStatus" NOT NULL DEFAULT 'logged',
      "bookingId"   TEXT NOT NULL,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE
    );
  `)
  console.log('✅ NotificationLog table')

  await client.end()
  console.log('\n🎉 Full schema migration complete! All tables created.')
}

migrate().catch((err) => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
