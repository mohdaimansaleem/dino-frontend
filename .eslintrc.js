module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Relax some rules that are too strict for development
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    'react-hooks/exhaustive-deps': 'warn',
    'no-useless-escape': 'warn',
    'import/no-anonymous-default-export': 'warn',
    
    // Keep important rules as errors
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'off', // Allow console.log in development
    
    // Disable some overly strict rules
    'no-throw-literal': 'warn',
    '@typescript-eslint/no-useless-constructor': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off'
      }
    }
  ]
};