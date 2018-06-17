'use babel'

import { CompositeDisposable } from 'atom'

class Centerer {
  mutationObserver = new MutationObserver(mutations => this.handleMutations(mutations))

  subscriptions = new CompositeDisposable()

  constructor(editor) {
    this.activate(editor)
    this.connectMutationObserver()
  }

  activate(editor) {
    this.editor = editor
    this.subscriptions = new CompositeDisposable()
    this.mutationObserver = new MutationObserver(mutations => this.handleMutations(mutations))

    this.subscriptions.add(editor.onDidChangeGrammar(() => this.handleEditorChanged()))
    this.subscriptions.add(
      atom.config.onDidChange(
        'editor.softWrap',
        () => this.handleEditorChanged(),
      ),
    )

    this.handleEditorChanged()
  }

  connectMutationObserver() {
    throw new Error('Unimplemented abstract method #connectMutationObserver!')
  }

  deactivate() {
    this.subscriptions.dispose()
    this.mutationObserver.disconnect()
  }

  handleEditorActivated(nextEditor) {
    this.deactivate()
    if (nextEditor) this.activate(nextEditor)
  }

  handleEditorChanged() {
    throw new Error('Unimplemented abstract method #handleEditorChanged!')
  }

  handleMutations() {
    throw new Error('Unimplemented abstract method #handleMutations!')
  }
}

export default Centerer
