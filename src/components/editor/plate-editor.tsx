import * as React from "react";

import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor/editor-kit";
import { SettingsDialog } from "@/components/editor/settings-dialog";
import { Editor, EditorContainer } from "@/components/ui/editor";

interface PlateEditorProps {
  value?: any[];
  onChange?: (value: any[]) => void;
}

export const PlateEditor = React.forwardRef<any, PlateEditorProps>(
  ({ value, onChange }, ref) => {
    console.log("PlateEditor received value:", value);

    const editor = usePlateEditor({
      plugins: EditorKit,
      value: value || [
        {
          children: [{ text: "Welcome to the Plate Playground!" }],
          type: "h1",
        },
        {
          children: [
            { text: "Experience a modern rich-text editor built with " },
            {
              children: [{ text: "Slate" }],
              type: "a",
              url: "https://slatejs.org",
            },
            { text: " and " },
            {
              children: [{ text: "React" }],
              type: "a",
              url: "https://reactjs.org",
            },
            {
              text: ". This playground showcases just a part of Plate's capabilities. ",
            },
            {
              children: [{ text: "Explore the documentation" }],
              type: "a",
              url: "/docs",
            },
            { text: " to discover more." },
          ],
          type: "p",
        },
      ],
    });

    // Expose the editor instance via ref
    React.useImperativeHandle(ref, () => editor, [editor]);

    // Handle Plate.js onChange callback
    const handleChange = (changeData: any) => {
      console.log("PlateEditor onChange:", changeData);
      if (onChange && changeData && "value" in changeData) {
        console.log("Calling onChange with value:", changeData.value);
        onChange(changeData.value);
      }
    };

    // Update editor value when prop changes
    React.useEffect(() => {
      if (value && Array.isArray(value) && value.length > 0) {
        console.log("Updating editor value:", value);
        // Force editor to update with new value
        editor.children = value;
        editor.onChange();
      }
    }, [value, editor]);

    return (
      <Plate editor={editor} onChange={handleChange}>
        <EditorContainer variant="default" className="h-full">
          <Editor variant="default" />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    );
  }
);

PlateEditor.displayName = "PlateEditor";
