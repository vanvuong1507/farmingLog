module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@reduxjs/toolkit|immer)/)',
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@locales/(.*)$': '<rootDir>/src/locales/$1',
  },
};
