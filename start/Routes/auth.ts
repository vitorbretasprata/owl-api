import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/login", "AuthenticationController.Login"),
    Route.post("/register", "AuthenticationController.Register"),
    Route.get("/authenticate", "AuthenticationController.AuthenticateToken")
    Route.post("/confirmEmail", "AuthenticationController.confirmEmail")
}).prefix("/auth");