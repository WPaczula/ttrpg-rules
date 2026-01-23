import { describe, it, expect } from 'vitest';
import { listDocuments, getDocument } from './documents.js';

describe('documents service', () => {
  describe('listDocuments', () => {
    it('lists all classes', () => {
      const classes = listDocuments('classes');
      expect(classes).toContain('Bard');
      expect(classes).toContain('Warrior');
      expect(classes.length).toBe(9);
    });

    it('returns empty array for non-existent category', () => {
      const docs = listDocuments('nonexistent');
      expect(docs).toEqual([]);
    });
  });

  describe('getDocument', () => {
    it('returns content for existing document', () => {
      const content = getDocument('classes', 'Bard');
      expect(content).toContain('# BARD');
      expect(content).toContain('Grace');
    });

    it('returns null for non-existent document', () => {
      const content = getDocument('classes', 'NonExistent');
      expect(content).toBeNull();
    });
  });
});
