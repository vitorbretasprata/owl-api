import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get("/listTeachers", "TeachersController.ListTeachers"),
    Route.post("/getDate", "TeachersController.getClassesDate"),
    Route.get("/getScheduledClass", "TeachersController.getScheduledClass"),
    Route.put("/updateScheduledClass", "TeachersController.updateScheduledClass"),
    Route.post("/schedule", "TeachersController.ScheduleClass"),
    Route.post("/cancel", "TeachersController.CancelClass")
}).prefix("/teachers").middleware('auth');