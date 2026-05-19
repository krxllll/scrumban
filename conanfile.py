from conan import ConanFile
from conan.tools.cmake import cmake_layout

class ScrumbanConan(ConanFile):
    name = "scrumban"
    version = "0.1"
    settings = "os", "compiler", "build_type", "arch"
    requires = "drogon/1.9.12"
    generators = "CMakeDeps", "CMakeToolchain"

    def layout(self):
        cmake_layout(self, generator="Ninja")
