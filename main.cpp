#include <drogon/drogon.h>

#include <filesystem>
#include <iostream>
#include <memory>

int main() {
    constexpr auto configPath = "backend/config/config.json";

    if (!std::filesystem::exists(configPath)) {
        std::cerr << "Missing backend configuration file: " << configPath << '\n'
                  << "Create it from backend/config/config.example.json and set local values.\n";
        return 1;
    }

    drogon::app().loadConfigFile(configPath);

    drogon::app().registerHandler(
        "/",
        [](const drogon::HttpRequestPtr&,
           std::function<void (const drogon::HttpResponsePtr &)> &&callback) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setBody("Hello, Drogon!");
            callback(resp);
        });

    drogon::app().registerHandler(
        "/api/health",
        [](const drogon::HttpRequestPtr&,
           std::function<void (const drogon::HttpResponsePtr &)> &&callback) {
            Json::Value body;
            body["status"] = "ok";
            callback(drogon::HttpResponse::newHttpJsonResponse(body));
        },
        {drogon::Get});

    drogon::app().registerHandler(
        "/api/health/db",
        [](const drogon::HttpRequestPtr&,
           std::function<void (const drogon::HttpResponsePtr &)> &&callback) {
            auto responseCallback =
                std::make_shared<std::function<void (const drogon::HttpResponsePtr &)>>(std::move(callback));

            try {
                auto dbClient = drogon::app().getDbClient("default");
                dbClient->execSqlAsync(
                    "SELECT 1;",
                    [responseCallback](const drogon::orm::Result&) {
                        Json::Value body;
                        body["database"] = "ok";
                        (*responseCallback)(drogon::HttpResponse::newHttpJsonResponse(body));
                    },
                    [responseCallback](const drogon::orm::DrogonDbException& error) {
                        Json::Value body;
                        body["database"] = "error";
                        body["message"] = error.base().what();

                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k500InternalServerError);
                        (*responseCallback)(resp);
                    });
            } catch (const std::exception& error) {
                Json::Value body;
                body["database"] = "error";
                body["message"] = error.what();

                auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                resp->setStatusCode(drogon::k500InternalServerError);
                (*responseCallback)(resp);
            }
        },
        {drogon::Get});

    drogon::app().run();
}
