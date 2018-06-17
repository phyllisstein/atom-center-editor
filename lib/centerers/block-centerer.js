'use babel'

import Centerer from './centerer'

class BlockCenterer extends Centerer {
  get container() {
    if (!this._container) {
      const view = atom.views.getView(this.editor)
      this._container = view.querySelector('.scroll-view').firstChild
    }

    return this._container
  }

  connectMutationObserver() {
    this.mutationObserver.observe(this.container, {
      attributeFilter: [
        'style',
      ],
      attributes: true,
      childList: true,
      subtree: true,
    })
  }

  handleEditorChanged() {
    const scope = this.editor.getRootScopeDescriptor()
    const characterWidth = this.editor.getDefaultCharWidth()
    const tabLength = atom.config.get('editor.tabLength', { scope })
    const tab = ' '.repeat(tabLength)

    let viewWidth
    if (atom.config.get('editor.softWrap', { scope }) && atom.config.get('editor.softWrapAtPreferredLineLength', { scope })) {
      const wrapChars = atom.config.get('editor.preferredLineLength', { scope })
      viewWidth = wrapChars * characterWidth + 2 // HACK: Cursor might not always be 2px.
    } else {
      const lineCount = this.editor.getLineCount()

      let wrapChars = 0
      for (let line = 0; line < lineCount; line++) {
        const lineText = this.editor.lineTextForBufferRow(line).replace(/\t/g, tab)
        const lineChars = lineText.length
        wrapChars = lineChars > wrapChars ? lineChars : wrapChars
      }

      viewWidth = wrapChars * characterWidth + 2 // HACK: Cursor might not always be 2px.
    }

    this.container.style.margin = '0 auto'
    this.container.style.width = `${ viewWidth }px`
  }

  handleMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        this.handleEditorChanged()
        return
      } else if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        this.handleEditorChanged()
        return
      }
    }
  }
}

export default BlockCenterer
