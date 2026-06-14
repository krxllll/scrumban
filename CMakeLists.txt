cmake_minimum_required(VERSION 3.20)
project(scrumban)

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)

add_executable(scrumban
    backend/main.cc
    backend/controllers/AuthController.cc
    backend/controllers/ProjectController.cc
    backend/repositories/BoardColumnRepository.cc
    backend/repositories/ProjectRepository.cc
    backend/repositories/UserRepository.cc
    backend/services/AuthService.cc
    backend/services/ProjectService.cc
    backend/utils/JwtUtils.cc
    backend/utils/PasswordHasher.cc
)

target_compile_features(scrumban PRIVATE cxx_std_17)
target_link_libraries(scrumban PRIVATE Drogon::Drogon OpenSSL::Crypto)

set_target_properties(scrumban PROPERTIES
    CXX_EXTENSIONS OFF
    VS_DEBUGGER_WORKING_DIRECTORY "$<TARGET_FILE_DIR:scrumban>"
)
