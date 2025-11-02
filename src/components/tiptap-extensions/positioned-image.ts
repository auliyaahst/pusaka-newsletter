import { Image as TiptapImage } from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

export interface ImageOptions {
  HTMLAttributes: Record<string, unknown>
  allowBase64: boolean
  inline: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    positionedImage: {
      /**
       * Add an image with positioning
       */
      setPositionedImage: (options: { 
        src: string
        alt?: string
        title?: string
        align?: 'left' | 'center' | 'right' | 'inline'
        width?: string | number
        height?: string | number
      }) => ReturnType
    }
  }
}

export const PositionedImage = TiptapImage.extend<ImageOptions>({
  name: 'positionedImage',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      allowBase64: false,
      inline: false,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attributes => {
          if (!attributes.align) {
            return {}
          }
          return {
            'data-align': attributes.align,
          }
        },
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { align, ...otherAttributes } = HTMLAttributes
    
    // Create CSS classes based on alignment
    let cssClass = 'positioned-image'
    switch (align) {
      case 'left':
        cssClass += ' image-left'
        break
      case 'right':
        cssClass += ' image-right'
        break
      case 'center':
        cssClass += ' image-center'
        break
      case 'inline':
        cssClass += ' image-inline'
        break
      default:
        cssClass += ' image-center'
    }

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, otherAttributes, {
        class: cssClass,
        'data-align': align,
      }),
    ]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setPositionedImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

export default PositionedImage
