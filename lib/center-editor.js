'use babel'

import { CompositeDisposable } from 'atom'

const changeSubscriptions = new WeakMap()
const configSubscriptions = new WeakMap()
const destructionSubscriptions = new WeakMap()
const grammarSubscriptions = new WeakMap()
const mutationObservers = new WeakMap()

class DrawCentered {
  subscriptions = new CompositeDisposable()

  activate() {
    const workspaceDisposable = atom.workspace.observeTextEditors(this.handleNewEditor.bind(this))
    this.subscriptions.add(workspaceDisposable)
  }

  deactivate() {
    for (const editor of atom.workspace.getTextEditors()) {
      if (destructionSubscriptions.has(editor)) {
        const destructionDisposable = destructionSubscriptions.get(editor)
        destructionDisposable.dispose()
      }

      if (changeSubscriptions.has(editor)) {
        const changeDisposable = changeSubscriptions.get(editor)
        changeDisposable.dispose()
      }

      if (grammarSubscriptions.has(editor)) {
        const grammarDisposable = grammarSubscriptions.get(editor)
        grammarDisposable.dispose()
      }

      if (mutationObservers.has(editor)) {
        const mutationObserver = mutationObservers.get(editor)
        mutationObserver.disconnect()
      }
    }

    this.subscriptions.dispose()
  }

  getContainer(editor) {
    const view = atom.views.getView(editor)
    const container = view.querySelector('.scroll-view').firstChild
    return container
  }

  handleEditorChanged(editor) {
    const scope = editor.getRootScopeDescriptor()
    const characterWidth = editor.getDefaultCharWidth()
    const tabLength = atom.config.get('editor.tabLength', { scope })
    const tab = ' '.repeat(tabLength)

    let viewWidth
    if (atom.config.get('editor.softWrap', { scope }) && atom.config.get('editor.softWrapAtPreferredLineLength', { scope })) {
      const wrapChars = atom.config.get('editor.preferredLineLength', { scope })
      viewWidth = wrapChars * characterWidth + 2 // HACK: Cursor might not always be 2px.
    } else {
      const lineCount = editor.getLineCount()

      let wrapChars = 0
      for (let line = 0; line < lineCount; line++) {
        const lineText = editor.lineTextForBufferRow(line).replace(/\t/g, tab)
        const lineChars = lineText.length
        wrapChars = lineChars > wrapChars ? lineChars : wrapChars
      }

      viewWidth = wrapChars * characterWidth + 2 // HACK: Cursor might not always be 2px.
    }

    const container = this.getContainer(editor)

    container.style.margin = '0 auto'
    container.style.width = `${ viewWidth }px`
  }

  handleEditorDestroyed(editor) {
    const destructionDisposable = destructionSubscriptions.get(editor)
    destructionDisposable.dispose()

    const changeDisposable = changeSubscriptions.get(editor)
    changeDisposable.dispose()

    const grammarDisposable = grammarSubscriptions.get(editor)
    grammarDisposable.dispose()

    const configDisposable = configSubscriptions.get(editor)
    configDisposable.dispose()

    const mutationObserver = mutationObservers.get(editor)
    mutationObserver.disconnect()
  }

  handleNewEditor(editor) {
    const destructionDisposable = editor.onDidDestroy(this.handleEditorDestroyed.bind(this, editor))
    destructionSubscriptions.set(editor, destructionDisposable)

    const changeDisposable = editor.onDidChange(this.handleEditorChanged.bind(this, editor))
    changeSubscriptions.set(editor, changeDisposable)

    const grammarDisposable = editor.onDidChangeGrammar(this.handleEditorChanged.bind(this, editor))
    grammarSubscriptions.set(editor, grammarDisposable)

    const configDisposable = atom.config.observe('editor.softWrap', this.handleEditorChanged.bind(this, editor))
    configSubscriptions.set(editor, configDisposable)

    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          requestAnimationFrame(() => this.handleEditorChanged(editor))
          return
        }
      }
    })

    const container = this.getContainer(editor)
    mutationObserver.observe(container, { attributes: true })
    mutationObservers.set(editor, mutationObserver)

    requestAnimationFrame(() => this.handleEditorChanged(editor))
  }
}

export default new DrawCentered()
