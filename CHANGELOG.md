# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com)
and this project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.30.0] 2025-11-03

### Added

- Full TypeScript implementation of the Concourse client, including Zod-backed schemas and typed sub-clients.
- New documentation set in `docs/` mirroring the original concourse.js guides but updated for the typed API.
- Shared support helpers (`src/http/headers.ts`, `src/http/transformers.ts`, `src/support/date.ts`) reused across clients and auth flows.

### Changed

- Build and test tooling now uses Biome, Vitest, and Husky instead of the previous Babel/Mocha pipeline.
- Package metadata and scripts updated to reflect the TypeScript toolchain and build process.

### Removed

- Legacy JavaScript runtime, Mocha tests, and Ruby-based release/CI scripts (git-crypt, CircleCI helpers, rake tasks).

## [0.27.0] 2022-12-22

### Changed

* All NPM dependencies have been updated.
* All Rubygems have been updated.

## [0.26.0] 2022-01-17

### Added

* concourse.js is now a native ES module and as such can be `import`ed without
  any transpilation in ES module-friendly projects. Consumers using require are
  unaffected and can continue using `require`.

### Fixed

* Fix `(0 , _formUrlencoded.default) is not a function` error.

### Security

* Dependency `follow-redirects` has been updated to
  prevent [CVE-2022-0155](https://nvd.nist.gov/vuln/detail/CVE-2022-0155)
