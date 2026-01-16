/**
 * Tests for VerbConjugationRule
 */

import { VerbConjugationRule } from '../VerbConjugationRule';

describe('VerbConjugationRule', () => {
  let rule: VerbConjugationRule;

  beforeEach(() => {
    rule = new VerbConjugationRule();
  });

  describe('first conjugation errors', () => {
    it('should detect incorrect -аит ending', () => {
      const errors = rule.check('он читаит');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('1-м спряжении');
      expect(errors[0].suggestions).toContain('читает');
    });

    it('should detect incorrect -аят ending', () => {
      const errors = rule.check('они играят');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].suggestions).toContain('играют');
    });
  });

  describe('second conjugation errors', () => {
    it('should detect incorrect -ет ending for 2nd conjugation', () => {
      const errors = rule.check('он говорет');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('2-м спряжении');
      expect(errors[0].suggestions).toContain('говорит');
    });

    it('should detect incorrect -ешь ending for 2nd conjugation', () => {
      const errors = rule.check('ты говорешь');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].suggestions).toContain('говоришь');
    });
  });

  describe('correct forms', () => {
    it('should not flag correct conjugations', () => {
      const errors = rule.check('он читает она говорит');
      expect(errors).toHaveLength(0);
    });
  });
});
