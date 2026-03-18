import type { CsvRowParser } from '../../types';

export const createCsvRowParser = (): CsvRowParser => ({
  parse: (input: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    const normalizedInput = input.replace(/^\uFEFF/, '');

    for (let index = 0; index < normalizedInput.length; index += 1) {
      const character = normalizedInput[index];
      const nextCharacter = normalizedInput[index + 1];

      if (character === '"') {
        if (insideQuotes && nextCharacter === '"') {
          currentValue += '"';
          index += 1;
          continue;
        }

        insideQuotes = !insideQuotes;
        continue;
      }

      if (!insideQuotes && character === ',') {
        currentRow.push(currentValue);
        currentValue = '';
        continue;
      }

      if (!insideQuotes && (character === '\n' || character === '\r')) {
        if (character === '\r' && nextCharacter === '\n') {
          index += 1;
        }

        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
        continue;
      }

      currentValue += character;
    }

    if (currentValue.length > 0 || currentRow.length > 0) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    return rows;
  }
});
