import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands {
    aiGenerationShow: () => boolean;
    aiTextPrompt: (options: { stream?: boolean; format?: 'plain-text' | 'rich-text'; text: string }) => boolean;
  }

  interface ChainedCommands {
    aiGenerationShow: () => this;
    aiTextPrompt: (options: { stream?: boolean; format?: 'plain-text' | 'rich-text'; text: string }) => this;
  }
}
