/**
 * Tests for ShipyashchieRule
 */

import { ShipyashchieRule } from '../ShipyashchieRule';

describe('ShipyashchieRule', () => {
  let rule: ShipyashchieRule;

  beforeEach(() => {
    rule = new ShipyashchieRule();
  });

  describe('жи/ши rule', () => {
    it('should detect жы -> жи errors', () => {
      const errors = rule.check('жызнь');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('После ж пишется и');
      expect(errors[0].suggestions).toEqual(['жи']);
    });

    it('should detect шы -> ши errors', () => {
      const errors = rule.check('шыть');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('После ш пишется и');
      expect(errors[0].suggestions).toEqual(['ши']);
    });

    it('should not flag correct жи/ши', () => {
      const errors = rule.check('жить шить');
      expect(errors).toHaveLength(0);
    });
  });

  describe('ча/ща rule', () => {
    it('should detect чя -> ча errors', () => {
      const errors = rule.check('чясто');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('После ч пишется а');
      expect(errors[0].suggestions).toEqual(['ча']);
    });

    it('should detect щя -> ща errors', () => {
      const errors = rule.check('щявель');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('После щ пишется а');
      expect(errors[0].suggestions).toEqual(['ща']);
    });
  });

  describe('чу/щу rule', () => {
    it('should detect чю -> чу errors', () => {
      const errors = rule.check('чюдо');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('После ч пишется у');
      expect(errors[0].suggestions).toEqual(['чу']);
    });

    it('should detect щю -> щу errors', () => {
      const errors = rule.check('щюка');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('После щ пишется у');
      expect(errors[0].suggestions).toEqual(['щу']);
    });
  });
});
