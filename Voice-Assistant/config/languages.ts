export interface Language {
  id: string;
  name: string;
  extension: string;
  executable: boolean;
  renderAs: 'text' | 'html';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', extension: 'js', executable: true, renderAs: 'text' },
  { id: 'python', name: 'Python', extension: 'py', executable: true, renderAs: 'text' },
  { id: 'html', name: 'HTML', extension: 'html', executable: true, renderAs: 'html' },
  { id: 'css', name: 'CSS', extension: 'css', executable: true, renderAs: 'html' },
];

export const getLanguageConfig = (id: string): Language =>
  SUPPORTED_LANGUAGES.find(lang => lang.id === id) || SUPPORTED_LANGUAGES[0];