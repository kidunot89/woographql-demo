// jest.config.ts
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@woographql(.*)$': '<rootDir>$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['next/babel'] }],
    '\\.svg$': '<rootDir>/testing/jest-svg-transformer.js',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/utils/',
    'graphql/',
    '/pages/',
    'codegen.ts',
    'jest.config.ts',
    'next-env.d.ts',
    '.next/',
    'testing/',
    
  ],
};