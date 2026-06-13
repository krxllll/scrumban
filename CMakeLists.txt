cmake_minimum_required(VERSION 3.20)
project(scrumban)

find_package(Drogon REQUIRED)

add_executable(scrumban backend/main.cc)

target_compile_features(scrumban PRIVATE cxx_std_17)
target_link_libraries(scrumban PRIVATE Drogon::Drogon)

set_target_properties(scrumban PROPERTIES
    CXX_EXTENSIONS OFF
    VS_DEBUGGER_WORKING_DIRECTORY "$<TARGET_FILE_DIR:scrumban>"
)
