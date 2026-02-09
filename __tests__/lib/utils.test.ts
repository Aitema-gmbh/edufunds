import { cn } from '@/lib/utils';

describe('Utils - cn Funktion', () => {
  describe('Basis-Funktionalität', () => {
    it('sollte einfache Klassen verbinden', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('sollte leere Werte ignorieren', () => {
      const result = cn('class1', '', 'class2', null, undefined);
      expect(result).toBe('class1 class2');
    });

    it('sollte bedingte Klassen unterstützen', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      
      expect(result).toBe('base-class active');
    });

    it('sollte Objekt-Syntax unterstützen', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      });
      
      expect(result).toBe('class1 class3');
    });

    it('sollte gemischte Syntax unterstützen', () => {
      const result = cn(
        'base',
        { active: true, disabled: false },
        'extra',
        null
      );
      
      expect(result).toBe('base active extra');
    });
  });

  describe('Tailwind-Merge Integration', () => {
    it('sollte konfliktierende Klassen zusammenführen', () => {
      const result = cn('px-2 py-1', 'px-4');
      // px-4 sollte px-2 überschreiben
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
      expect(result).toContain('py-1');
    });

    it('sollte Farb-Klassen zusammenführen', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('sollte Größen-Klassen zusammenführen', () => {
      const result = cn('w-10', 'w-20');
      expect(result).toBe('w-20');
    });

    it('sollte Padding-Klassen richtig behandeln', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('sollte Margin-Klassen richtig behandeln', () => {
      const result = cn('m-4', 'm-0');
      expect(result).toBe('m-0');
    });
  });

  describe('Arrays von Klassen', () => {
    it('sollte Arrays auflösen', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('sollte verschachtelte Arrays auflösen', () => {
      const result = cn(['class1', ['class2', 'class3']], 'class4');
      expect(result).toBe('class1 class2 class3 class4');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leerem Input umgehen können', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('sollte mit nur null/undefined umgehen können', () => {
      const result = cn(null, undefined, false);
      expect(result).toBe('');
    });

    it('sollte mit leeren Strings umgehen können', () => {
      const result = cn('', '  ', '\t');
      expect(result).toBe('');
    });

    it('sollte boolesche Werte korrekt filtern', () => {
      const result = cn(true && 'class1', false && 'class2', 'class3');
      expect(result).toBe('class1 class3');
    });

    it('sollte Zahlen als Klassennamen ignorieren', () => {
      const result = cn('class1', 0, 'class2');
      expect(result).toBe('class1 class2');
    });
  });

  describe('Real-World Anwendungen', () => {
    it('sollte Button-Klassen korrekt zusammenführen', () => {
      const isPrimary = true;
      const isLarge = false;
      const isDisabled = true;

      const result = cn(
        'px-4 py-2 rounded font-medium',
        isPrimary && 'bg-blue-500 text-white',
        isLarge && 'text-lg',
        isDisabled && 'opacity-50 cursor-not-allowed',
        'hover:bg-blue-600'
      );

      expect(result).toContain('px-4');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('opacity-50');
      expect(result).not.toContain('text-lg');
    });

    it('sollte Container-Klassen korrekt zusammenführen', () => {
      const isFluid = true;

      const result = cn(
        'container mx-auto px-4',
        isFluid && 'max-w-none',
        'md:px-6 lg:px-8'
      );

      expect(result).toContain('mx-auto');
      expect(result).toContain('max-w-none');
      expect(result).toContain('md:px-6');
    });

    it('sollte Card-Klassen korrekt zusammenführen', () => {
      const variant = 'outlined';

      const result = cn(
        'rounded-lg p-4 shadow-sm',
        {
          'bg-white border border-gray-200': variant === 'outlined',
          'bg-gray-50': variant === 'filled',
        },
        'hover:shadow-md'
      );

      expect(result).toContain('bg-white');
      expect(result).toContain('border');
      expect(result).not.toContain('bg-gray-50');
    });
  });
});
