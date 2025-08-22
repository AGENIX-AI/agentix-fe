import '@tiptap/react';

declare module '@tiptap/react' {
  interface ChainedCommands {
    aiGenerationShow: () => this;
    aiTextPrompt: (options: { stream?: boolean; format?: 'plain-text' | 'rich-text'; text: string }) => this;
  }
}
