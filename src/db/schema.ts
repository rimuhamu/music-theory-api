import {
  integer,
  json,
  pgTable,
  serial,
  smallint,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

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

export const scaleDegrees = pgTable('scale_degrees', {
  id: serial('id').primaryKey(),
  scaleId: integer('scale_id')
    .notNull()
    .references(() => scales.id),
  degree: smallint('degree').notNull(), // 1-7
  name: varchar('name', { length: 50 }).notNull(), // Tonic, Supertonic, Mediant, etc.
  romanNumeral: varchar('roman_numeral', { length: 10 }).notNull(), // I, ii, iii, IV, V, etc.
  quality: varchar('quality', { length: 20 }).notNull(), // major, minor, diminished
  function: varchar('function', { length: 50 }), // tonic, dominant, subdominant, etc.
});

export const keys = pgTable('keys', {
  id: serial('id').primaryKey(),
  rootNoteId: integer('root_note_id')
    .notNull()
    .references(() => notes.id),
  scaleId: integer('scale_id')
    .notNull()
    .references(() => scales.id),
  name: varchar('name', { length: 30 }).notNull(), // "C Major", "A Minor", etc.
});

export const chords = pgTable('chords', {
  id: serial('id').primaryKey(),
  rootNoteId: integer('root_note_id')
    .notNull()
    .references(() => notes.id),
  qualityId: integer('quality_id')
    .notNull()
    .references(() => chordQualities.id),
  name: varchar('name', { length: 30 }).notNull(), // "C Major", "G7", etc.
});

export const chordFunctions = pgTable('chord_functions', {
  id: serial('id').primaryKey(),
  keyId: integer('key_id')
    .notNull()
    .references(() => keys.id),
  chordId: integer('chord_id')
    .notNull()
    .references(() => chords.id),
  degreeId: integer('degree_id')
    .notNull()
    .references(() => scaleDegrees.id), // Relates to scale degree (I, ii, etc.)
});

export const progressionPatterns = pgTable('progression_patterns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // "2-5-1", etc.
  romanNumerals: json('roman_numerals').notNull(), // ["ii", "V", "I"] or ["I", "V", "vi", "IV"]
  emotion: varchar('emotion', { length: 50 }), // "happy", "sad", "tense", etc.
});

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
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

export const progressions = pgTable('progressions', {
  id: serial('id').primaryKey(),
  keyId: integer('key_id')
    .notNull()
    .references(() => keys.id),
  genreId: integer('genre_id').references(() => genres.id),
  patternId: integer('pattern_id').references(() => progressionPatterns.id),
  chordSequence: json('chord_sequence').notNull(),
  measures: smallint('measures').default(4),
});

export const keysRelations = relations(keys, ({ one }) => ({
  rootNote: one(notes, {
    fields: [keys.rootNoteId],
    references: [notes.id],
  }),
  scale: one(scales, {
    fields: [keys.scaleId],
    references: [scales.id],
  }),
}));

export const chordsRelations = relations(chords, ({ one }) => ({
  rootNote: one(notes, {
    fields: [chords.rootNoteId],
    references: [notes.id],
  }),
  quality: one(chordQualities, {
    fields: [chords.qualityId],
    references: [chordQualities.id],
  }),
}));

export const chordFunctionsRelations = relations(chordFunctions, ({ one }) => ({
  key: one(keys, {
    fields: [chordFunctions.keyId],
    references: [keys.id],
  }),
  chord: one(chords, {
    fields: [chordFunctions.chordId],
    references: [chords.id],
  }),
  degree: one(scaleDegrees, {
    fields: [chordFunctions.degreeId],
    references: [scaleDegrees.id],
  }),
}));

export const progressionsRelations = relations(progressions, ({ one }) => ({
  key: one(keys, {
    fields: [progressions.keyId],
    references: [keys.id],
  }),
  genre: one(genres, {
    fields: [progressions.genreId],
    references: [genres.id],
  }),
  pattern: one(progressionPatterns, {
    fields: [progressions.patternId],
    references: [progressionPatterns.id],
  }),
}));
