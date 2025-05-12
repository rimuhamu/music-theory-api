import {
  integer,
  json,
  pgTable,
  serial,
  smallint,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 10 }).notNull(), // C, C#, Db, etc.
  position: smallint('position').notNull(), // 0-11 (C=0, C#=1, etc.)
});

export const chordQualities = pgTable('chord_qualities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(), // Major, Minor, Dominant 7th, etc.
  symbol: varchar('symbol', { length: 20 }).notNull(), // M, m, 7, maj7, etc.
  intervals: json('intervals').notNull(), // [0,4,7] for major, [0,3,7] for minor, etc.
  category: varchar('category', { length: 30 }), // basic, extended, altered, etc.
});

export const scales = pgTable('scales', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(), // Major, Natural Minor, Harmonic Minor, etc.
  pattern: varchar('pattern', { length: 50 }).notNull(), // [0,2,4,5,7,9,11] for major scale
});

export const keys = pgTable('keys', {
  id: serial('id').primaryKey(),
  rootNoteId: integer('root_note_id')
    .notNull()
    .references(() => notes.id),
  name: varchar('name', { length: 50 }).notNull(),
});

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
});

export const progressionPatterns = pgTable('progression_patterns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // "2-5-1", etc.
  romanNumerals: json('roman_numerals').notNull(), // ["ii", "V", "I"] or ["I", "V", "vi", "IV"]
  emotion: varchar('emotion', { length: 50 }), // "happy", "sad", "tense", etc.
});

// Genres to Progression Patterns Many-to-Many Relationship
export const genreProgressions = pgTable(
  'genre_progressions',
  {
    genreId: integer('genre_id')
      .notNull()
      .references(() => genres.id),
    progressionPatternId: integer('progression_pattern_id')
      .notNull()
      .references(() => progressionPatterns.id),
  },
  (table) => [
    primaryKey({ columns: [table.genreId, table.progressionPatternId] }),
  ]
);
