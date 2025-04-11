# 10. Info & Miscellaneous API

Planning for the Info endpoint and other miscellaneous API calls.

## Go Source Analysis

- `concourse/go-concourse/concourse/info.go`: **Highly Relevant**. Implements the `GetInfo` client method.
- `concourse/go-concourse/concourse/cli.go`: **Relevant**. Implements the `GetCLIReader` method for downloading the `fly` binary. We need to replicate this functionality.
- `concourse/go-concourse/concourse/user.go`: **Highly Relevant**. Implements the `UserInfo` client method.
- `concourse/go-concourse/concourse/users.go`: **Highly Relevant**. Implements the `ListActiveUsersSince` client method.
- Relevant structs in `concourse/atc/info.go`, `concourse/atc/user.go`: **Highly Relevant**. Defines Go structs (`atc.Info`, `atc.User`, `atc.UserInfo`) used in these API endpoints. Needed for TS types.
- `concourse/go-concourse/concourse/volumes.go`, `concourse/go-concourse/concourse/containers.go`: **Potentially Less Relevant**. These seem to relate to lower-level ATC concepts. Need to verify if these correspond to documented, stable client API endpoints or are primarily for internal/fly use. Prioritize other endpoints first.

## Go Client Methods

- `GetInfo()`
- `GetCLIReader(arch, platform string)` (Download `fly` CLI)
- `UserInfo()`
- `ListActiveUsersSince(since time.Time)`
- Potentially others (Volumes, Containers - need investigation if part of public client API)

## Key Areas

- Getting basic Concourse instance information (version, etc.).
- Providing downloads for the `fly` CLI.
- Getting information about the current authenticated user.
- Listing recently active users.

## TypeScript Implementation Plan

- [x] Define `AtcInfo`, `AtcUser`, `AtcUserInfo` interfaces (in `src/types/`).
- [x] Implement `getInfo()` placeholder (and Zod validation).
- [ ] Implement `downloadCli()` (needs to handle streaming response/binary data).
- [ ] Implement `getUserInfo()`.
- [ ] Implement `listActiveUsersSince()` (needs mapping of Go `time.Time`).
- [ ] Investigate if Volumes/Containers APIs (`volumes.go`, `containers.go`) are intended for external client use and implement if necessary.
- [ ] Add tests for these miscellaneous operations. 