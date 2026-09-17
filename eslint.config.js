import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  ignores: [
    'vendor/**',
    'runtime/**',
    'web/assets/**',
    'web/dist/**',
    'tests/_output/**',
    'tests/_support/_generated/**',
  ],
}, {
  files: ['resources/js/components/ui/**'],
  rules: {
    // The autofix turns Radix primitives such as <TooltipPrimitive.Provider> into <TooltipPrimitive>,
    // which is a namespace object, not a component
    'react/no-context-provider': 'off',
  },
})
