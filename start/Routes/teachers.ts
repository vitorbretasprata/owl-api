import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get("/listTeachers", "TeachersController.ListTeachers"),
    Route.get("/getScheduledClass/:classId", "TeachersController.GetScheduledClass"),
    Route.post("/getDate", "TeachersController.GetClassesDate"),
    Route.post("/schedule", "TeachersController.ScheduleClass"),
    Route.put("/confirm", "TeachersController.ConfirmClass"),
    Route.delete("/cancel/:classId", "TeachersController.CancelClass")
}).prefix("/teachers").middleware('auth');