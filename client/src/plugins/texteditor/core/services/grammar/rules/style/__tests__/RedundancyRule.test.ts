/**
 * Tests for RedundancyRule
 */

import { RedundancyRule } from '../RedundancyRule';

describe('RedundancyRule', () => {
  let rule: RedundancyRule;

  beforeEach(() => {
    rule = new RedundancyRule();
  });

  describe('redundant phrases', () => {
    it('should detect "свободная вакансия"', () => {
      const errors = rule.check('Есть свободная вакансия');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('свободная вакансия');
      expect(errors[0].suggestions).toContain('вакансия');
    });

    it('should detect "первая премьера"', () => {
      const errors = rule.check('Состоялась первая премьера');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].suggestions).toContain('премьера');
    });

    it('should not flag correct usage', () => {
      const errors = rule.check('Есть вакансия в компании');
      expect(errors).toHaveLength(0);
    });
  });

  describe('excessive intensifiers', () => {
    it('should detect "очень прекрасный"', () => {
      const errors = rule.check('Очень прекрасный день');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('избыточное усиление');
    });

    it('should detect "самый лучший"', () => {
      const errors = rule.check('Самый лучший результат');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('избыточное усиление');
    });
  });

  describe('word repetition', () => {
    it('should detect immediate word repetition', () => {
      const errors = rule.check('Книга книга лежит на столе');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('повтор слова');
    });

    it('should not flag short words', () => {
      const errors = rule.check('Он он пришёл');
      expect(errors).toHaveLength(0);
    });
  });
});
