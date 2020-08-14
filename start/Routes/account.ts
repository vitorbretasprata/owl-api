import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/setAccountInfo", "AccountsController.SetAccountInfo")
}).prefix("/account");