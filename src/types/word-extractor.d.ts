declare module "word-extractor" {
  type HeaderOptions = {
    includeFooters?: boolean;
  };

  type TextboxOptions = {
    includeBody?: boolean;
    includeHeadersAndFooters?: boolean;
  };

  export interface WordDocument {
    getAnnotations(): string;
    getBody(): string;
    getEndnotes(): string;
    getFooters(): string;
    getFootnotes(): string;
    getHeaders(options?: HeaderOptions): string;
    getTextboxes(options?: TextboxOptions): string;
  }

  export default class WordExtractor {
    extract(input: Buffer | string): Promise<WordDocument>;
  }
}
