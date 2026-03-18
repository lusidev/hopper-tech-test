export interface CsvRowParser {
  parse: (input: string) => string[][];
}