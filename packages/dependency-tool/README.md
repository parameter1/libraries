# Dependency Tool
Command line tool for managing project dependencies.

## Installation
Add `@parameter1/dependency-tool` as a project dependency via Yarn or npm. You can also add this package globally.

## Usage

### Upgrading
Once installed, run via the command line and target the project path you'd like to update:

```sh
p1-dependency-tool upgrade ../path-to-your-project
```

If the package uses Yarn workspaces, all sub-packages will also be updated.
