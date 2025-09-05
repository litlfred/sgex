import { timeAgo, formatTimestamp } from './timeUtils';

describe('timeUtils', () => {
  describe('timeAgo', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 1000); // 1 second ago
      
      expect(timeAgo(recent)).toBe('just now');
    });

    it('should return minutes for recent times', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(timeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return hours for older times', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      expect(timeAgo(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should return days for much older times', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      expect(timeAgo(threeDaysAgo)).toBe('3 days ago');
    });

    it('should handle null input', () => {
      expect(timeAgo(null)).toBe('Never');
    });

    it('should handle invalid dates', () => {
      expect(timeAgo('invalid')).toBe('Invalid date');
    });
  });

  describe('formatTimestamp', () => {
    it('should return formatted timestamp object', () => {
      const date = new Date('2023-12-04T14:30:00Z');
      const result = formatTimestamp(date);
      
      expect(result).toHaveProperty('absolute');
      expect(result).toHaveProperty('relative');
      expect(result).toHaveProperty('full');
      expect(typeof result.absolute).toBe('string');
      expect(typeof result.relative).toBe('string');
      expect(typeof result.full).toBe('string');
    });

    it('should handle null input', () => {
      const result = formatTimestamp(null);
      
      expect(result.absolute).toBe('Never');
      expect(result.relative).toBe('Never');
      expect(result.full).toBe('Never');
    });
  });
});