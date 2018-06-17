'use babel'

import Centerer from './centerer'

class LineCenterer extends Centerer {
  get cursors() {
    return this.view.querySelector('.cursors')
  }

  get highlights() {
    return this.view.querySelector('.highlights')
  }

  get line() {
    return this.view.querySelectorAll('.line')
  }

  get lines() {
    return this.view.querySelector('.lines')
  }

  get scrollView() {
    if (!this._scrollView) {
      this._scrollView = this.view.querySelector('.scroll-view')
    }

    return this._scrollView
  }

  get view() {
    if (!this._view) {
      this._view = atom.views.getView(this.editor)
    }

    return this._view
  }

  connectMutationObserver() {
    this.mutationObserver.observe(this.lines, {
      attributeFilter: [
        'class',
        'style',
      ],
      attributes: true,
      childList: true,
      subtree: true,
    })
  }

  handleEditorChanged(target) {
    if (target) {
      this.updateLine(target)
      return
    }

    this.updateEditor()
  }

  handleMutations(mutations) {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'style' &&
        !!mutation.target.classList &&
        mutation.target.classList.contains('line') &&
        !mutation.target.classList.contains('dummy')
      ) {
        this.handleEditorChanged(mutation.target)
      } else if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        !!mutation.target.classList &&
        mutation.target.classList.contains('cursor-line')
      ) {
        this.handleLineChanged(mutation.target)
      } else if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        Array.from(mutation.addedNodes)
          .filter(node => !!node.classList && node.classList.contains('line') && !node.classList.contains('dummy'))
          .forEach(node => this.handleEditorChanged(node))
      }
    }
  }

  updateEditor() {
    Array.from(this.line)
      .filter(line => !line.classList.contains('dummy'))
      .forEach(line => this.updateLine(line))
  }

  updateLine(line) {
    const characterWidth = this.editor.getDefaultCharWidth()

    const tabLength = atom.config.get('editor.tabLength', { scope: this.editor.getRootScopeDescriptor() })
    const tab = ' '.repeat(tabLength)

    const lineNumber = line.dataset.screenRow
    if (!lineNumber) return

    let lineText = this.editor.lineTextForScreenRow(Number(lineNumber))
    lineText = lineText && lineText.replace(/\t/g, tab)
    if (lineText === null || lineText === undefined) return

    const lineWidth = lineText.length * characterWidth + 2 // HACK: Cursor might not always be 2px.

    line.style.margin = '0 auto'
    line.style.width = `${ lineWidth }px`

    if (line.classList.contains('cursor-line')) this.handleLineChanged(line)
  }

  handleLineChanged(cursorLine) {
    let longestLineWidth = 0
    Array.from(this.line).forEach(line => {
      const currentLineWidth = parseInt(window.getComputedStyle(line).width, 10)
      longestLineWidth = currentLineWidth > longestLineWidth ? currentLineWidth : longestLineWidth
    })

    const w = parseInt(window.getComputedStyle(this.scrollView).width, 10)
    const left = (w / 2) - (longestLineWidth / 2)

    const cursorLineWidth = parseInt(window.getComputedStyle(cursorLine).width, 10)
    const cursorLineLeft = (w / 2) - (cursorLineWidth / 2)

    this.cursors.style.left = `${ cursorLineLeft }px`
    this.cursors.style.width = `${ cursorLineWidth }px`
    this.cursors.style.margin = '0 auto'
    this.highlights.style.left = `${ cursorLineLeft }px`
    this.highlights.style.width = `${ cursorLineWidth }px`
    this.highlights.style.margin = '0 auto'
  }
}

export default LineCenterer
