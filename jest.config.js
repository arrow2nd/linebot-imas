export default {
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/', '/.yarn/', '/public/'],

  /** @link https://stackoverflow.com/questions/64582674/jest-mock-of-es6-class-yields-referenceerror-require-is-not-defined */
  transform: {}
}
