# Scrumban

C++ Drogon application configured for Conan and CLion.

## Before opening in CLion

Run Conan install from the project root:

```powershell
conan profile detect --force
conan install . --output-folder=build --build=missing -s build_type=Debug -c tools.cmake.cmaketoolchain:generator=Ninja
conan install . --output-folder=build --build=missing -s build_type=Release -c tools.cmake.cmaketoolchain:generator=Ninja
```

These commands generate:

```text
build/Debug/generators/conan_toolchain.cmake
build/Release/generators/conan_toolchain.cmake
```

## CLion setup

Open the project folder in CLion and choose the CMake preset:

```text
conan-debug
```

Use `conan-release` only when you want to run an optimized Release build.

Each preset uses a separate single-config build directory. That avoids Debug/Release imported-target mismatch errors such as:

```text
IMPORTED_LOCATION not set for imported target "CONAN_LIB::boost..." configuration "Debug"
```

Use the `scrumban` target in CLion's Run/Debug configuration. The app starts a Drogon server on:

```text
http://localhost:8080/
```
