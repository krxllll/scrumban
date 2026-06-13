from conan import ConanFile
from conan.tools.cmake import cmake_layout

class ScrumbanConan(ConanFile):
    name = "scrumban"
    version = "0.1"
    settings = "os", "compiler", "build_type", "arch"
    requires = (
        "drogon/1.9.12",
        "libpq/17.7",
    )
    generators = "CMakeDeps", "CMakeToolchain"

    default_options = {
        "drogon/*:with_postgres": True,
    }

    def layout(self):
        cmake_layout(self, generator="Ninja")
