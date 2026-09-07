import js from '@eslint/js'
import globals from 'globals'
import ts from 'typescript-eslint'

export default [
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...ts.configs.recommended,
  // rspress builds to doc_build/, not dist/. Naming the wrong directory here
  // meant every generated bundle was linted: 1147 errors from emitted code.
  { ignores: ['doc_build/', 'dist/'] }
]
