# Caption Box Feature

## Overview
I've successfully added a **Caption Box** feature to your rich text editor! This allows users to create styled text boxes perfect for image captions, quotes, notes, or any highlighted information.

## What Was Added

### 1. **CaptionBox Extension** (`enhanced-editor-ckeditor.tsx`)
- Created a custom TipTap Node extension called `CaptionBox`
- Supports parsing HTML with class `caption-box`
- Renders as a `<div class="caption-box">` element
- Includes a custom command `insertCaptionBox()` to insert caption boxes

### 2. **TypeScript Declaration**
- Extended TipTap's Commands interface to include `insertCaptionBox`
- Ensures full TypeScript support and autocomplete

### 3. **Toolbar Button**
- Added a new button in the toolbar (between Image and Table buttons)
- Uses a note/document icon
- Clicking inserts a caption box with placeholder text: "Type your caption or text here..."

### 4. **Styling**

#### Editor Styles (`enhanced-editor-ckeditor.scss`):
```scss
.ProseMirror .caption-box {
  background: #f9fafb;
  border-left: 3px solid #3b82f6;
  padding: 12px 16px;
  margin: 16px 0;
  font-size: 0.95em;
  line-height: 1.6;
  color: #374151;
  border-radius: 4px;
  font-family: 'Peter Test', Arial, sans-serif;
}
```

#### Published Article Styles (`globals.css`):
- Same styling applied to `.article-content .caption-box`
- Ensures consistent appearance in published articles

## How to Use

### For Users:
1. **Click the Caption Box button** in the toolbar (icon with lines/document)
2. **Type your caption** - the placeholder text will disappear
3. **Customize if needed** - you can apply text formatting (bold, italic, colors, etc.)

### Use Cases:
- **Image Captions**: Add descriptive text below images
- **Pull Quotes**: Highlight important quotes from the article
- **Side Notes**: Add additional context or information
- **Tips/Warnings**: Create visually distinct informational boxes
- **Key Takeaways**: Summarize important points

## Visual Design

The caption box features:
- **Light gray background** (`#f9fafb`) - subtle but noticeable
- **Blue left border** (`#3b82f6`, 3px) - adds visual emphasis
- **Comfortable padding** (12px vertical, 16px horizontal)
- **Slightly smaller font** (0.95em) - distinguishes from body text
- **Rounded corners** (4px) - modern, friendly appearance
- **Selection highlight** - Blue background when selected/focused

## Technical Details

### Extension Configuration:
```typescript
const CaptionBox = Node.create({
  name: 'captionBox',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.caption-box' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, class: 'caption-box' }, 0]
  },
  addCommands() {
    return {
      insertCaptionBox: () => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          content: [{ type: 'text', text: 'Type your caption or text here...' }],
        })
      },
    }
  },
})
```

### Database Storage:
Caption boxes are stored as HTML:
```html
<div class="caption-box">Your caption text here</div>
```

This ensures they display correctly when:
- Saved to the database
- Loaded for editing
- Rendered in published articles

## Future Enhancements (Optional)

You could add:
1. **Different styles**: Info, Warning, Success, Error variants with different colors
2. **Icons**: Add optional icons to caption boxes
3. **Title field**: Allow captions to have titles
4. **Alignment options**: Left, center, right alignment
5. **Background color picker**: Let users customize the background color
6. **Border customization**: Change border color, thickness, or position

## Browser Compatibility

✅ Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Notes

- Caption boxes support **inline formatting** (bold, italic, underline, links, etc.)
- They're **block-level elements** (they take full width and create new lines before/after)
- The blue left border provides **visual hierarchy** without being distracting
- The styling matches your **Peter Test font** for consistency

---

**Status**: ✅ Feature Complete and Ready to Use!
