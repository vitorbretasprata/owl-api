import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/listTeachers", "TeachersController.ListTeachers"),
    Route.post("/schedule", "TeachersController.ScheduleClass"),
    Route.post("/cancel", "TeachersController.CancelClass")
}).prefix("/teachers").middleware('auth');