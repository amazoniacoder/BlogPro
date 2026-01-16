/**
 * Tests for PunctuationRule
 */

import { PunctuationRule } from '../PunctuationRule';

describe('PunctuationRule', () => {
  let rule: PunctuationRule;

  beforeEach(() => {
    rule = new PunctuationRule();
  });

  describe('subordinate clauses', () => {
    it('should detect missing comma before что', () => {
      const errors = rule.check('Он сказал что придёт');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('что');
      expect(errors[0].suggestions).toContain(', ');
    });

    it('should detect missing comma before чтобы', () => {
      const errors = rule.check('Я пришёл чтобы помочь');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('чтобы');
    });

    it('should not flag correct comma usage', () => {
      const errors = rule.check('Он сказал, что придёт');
      expect(errors).toHaveLength(0);
    });
  });

  describe('compound sentences', () => {
    it('should detect missing comma before но', () => {
      const errors = rule.check('Он работает но устал');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('но');
    });

    it('should not flag simple coordination with и', () => {
      const errors = rule.check('Он читает и пишет');
      expect(errors).toHaveLength(0);
    });
  });

  describe('dash usage', () => {
    it('should detect missing dash in subject-predicate construction', () => {
      const errors = rule.check('Москва столица России.');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('тире');
      expect(errors[0].suggestions).toContain(' — ');
    });
  });
});
