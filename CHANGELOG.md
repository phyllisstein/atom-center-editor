# Changelog
## v1.0.0
* **New Feature:** Center lines independently of one another, producing a highly poetic effect.
* Rely exclusively on `MutationObserver`s to catch and respond to editor changes.
* Keep observers and subscriptions in memory only for the active editor.

## v0.6.0
* Remove redundant requestAnimationFrame call, _slightly_ improving editor performance.

## v0.5.0
* Fix package description.

## v0.4.1
* Correctly measure hard tabs.

## v0.4.0
* Use `MutationObserver` API to catch and fix all changes to the editor's width.

## v0.3.0
* Recenter on changes to the current grammar or the `editor.softWrap` setting.

## v0.1.0
* Initial implementation and release.
