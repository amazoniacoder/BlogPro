/**
 * Tests for NounAdjectiveAgreementRule
 */

import { NounAdjectiveAgreementRule } from '../NounAdjectiveAgreementRule';

describe('NounAdjectiveAgreementRule', () => {
  let rule: NounAdjectiveAgreementRule;

  beforeEach(() => {
    rule = new NounAdjectiveAgreementRule();
  });

  describe('gender agreement', () => {
    it('should detect masculine-feminine disagreement', () => {
      const errors = rule.check('красивый девочка');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('не согласуется');
      expect(errors[0].subtype).toBe('gender_agreement');
    });

    it('should not flag correct gender agreement', () => {
      const errors = rule.check('красивая девочка');
      expect(errors).toHaveLength(0);
    });

    it('should detect feminine-masculine disagreement', () => {
      const errors = rule.check('хорошая мальчик');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].subtype).toBe('gender_agreement');
    });
  });

  describe('adjective-noun order', () => {
    it('should check adjective before noun', () => {
      const errors = rule.check('красивый девочка');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should check noun before adjective', () => {
      const errors = rule.check('девочка красивый');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('suggestions', () => {
    it('should provide correction suggestions', () => {
      const errors = rule.check('красивый девочка');
      if (errors.length > 0) {
        expect(errors[0].suggestions).toBeDefined();
        expect(errors[0].suggestions.length).toBeGreaterThan(0);
      }
    });
  });
});
