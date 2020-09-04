import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get("/listTeachers", "TeachersController.ListTeachers"),
    Route.post("/getDate", "TeachersController.getClassesDate"),
    Route.get("/getScheduledClass", "TeachersController.getScheduledClass"),
    Route.put("/confirm", "TeachersController.ConfirmClass"),
    Route.post("/schedule", "TeachersController.ScheduleClass"),
    Route.delete("/cancel/:classId", "TeachersController.CancelClass")
}).prefix("/teachers").middleware('auth');