import { theme } from '../theme';

describe('theme', () => {
    it('exports theme object', () => {
        expect(theme).toBeDefined();
        expect(typeof theme).toBe('object');
    });

    it('has correct color structure', () => {
        expect(theme.colors).toBeDefined();
        expect(theme.colors.primary).toBe('#2196F3');
        expect(theme.colors.secondary).toBe('#FF9800');
        expect(theme.colors.error).toBe('#F44336');
        expect(theme.colors.success).toBe('#4CAF50');
    });

    it('has admin-specific colors', () => {
        expect(theme.colors.pending).toBe('#FFC107');
        expect(theme.colors.completed).toBe('#4CAF50');
        expect(theme.colors.cancelled).toBe('#F44336');
        expect(theme.colors.urgent).toBe('#E91E63');
    });

    it('has correct roundness', () => {
        expect(theme.roundness).toBe(8);
    });

    it('has elevation colors', () => {
        expect(theme.colors.elevation).toBeDefined();
        expect(theme.colors.elevation.level0).toBe('transparent');
        expect(theme.colors.elevation.level1).toBe('#FFFFFF');
    });
});

