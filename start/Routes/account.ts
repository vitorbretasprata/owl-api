import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/setAccountInfo", "AccountsController.SetAccountInfo"),
    Route.get("/getAccountInfo", "AccountsController.GetAccountInfo"),
    Route.post("/updateTeacherLectures", "AccountsController.UpdateTeacherLectures"),
    Route.put("/updateTeacherInfo", "AccountsController.UpdateTeacherInfo"),
    Route.put("/updateTeacherBankInfo", "AccountsController.UpdateTeacherBankInfo"),
    Route.put("/updatePushToken", "AccountsController.UpdatePushToken")
}).prefix("/account").middleware('auth');