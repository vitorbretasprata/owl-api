import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/setAccountInfo", "AccountsController.SetAccountInfo"),
    Route.post("/updateTeacherLectures", "AccountsController.UpdateTeacherLectures"),
    Route.put("/updateTeacherInfo", "AccountsController.UpdateTeacherInfo"),
    Route.put("/updateTeacherBankInfo", "AccountsController.UpdateTeacherBankInfo")
}).prefix("/account").middleware('auth');