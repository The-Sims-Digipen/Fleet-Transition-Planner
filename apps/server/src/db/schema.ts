import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const fleets = pgTable("fleets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const scenarios = pgTable("scenarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  fleetId: uuid("fleet_id")
    .references(() => fleets.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  assumptions: jsonb("assumptions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  fleetId: uuid("fleet_id")
    .references(() => fleets.id, { onDelete: "cascade" })
    .notNull(),

  registration: text("registration").notNull(),
  category: text("category").notNull(),
  annualDistanceKm: integer("annual_distance_km").notNull(),
  currentAgeYears: integer("current_age_years").notNull(),
});
