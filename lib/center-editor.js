'use babel'

import {
  BlockCenterer,
  LineCenterer,
} from './centerers'
import { CompositeDisposable } from 'atom'

class CenterEditor {
  subscriptions = new CompositeDisposable()

  get config() {
    return {
      centerByLine: {
        default: false,
        description: 'Center each line independently of its siblings.',
        type: 'boolean',
      },
    }
  }

  activate() {
    this.subscriptions.add(atom.workspace.observeTextEditors(editor => this.handleNewEditor(editor)))
  }

  deactivate() {
    this.centerer.deactivate()
    this.subscriptions.dispose()
  }

  handleNewEditor(editor) {
    if (atom.config.get('center-editor.centerByLine')) {
      this.centerer = new LineCenterer(editor)
      return
    }

    this.centerer = new BlockCenterer(editor)
  }
}

export default new CenterEditor()
