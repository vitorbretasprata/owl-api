import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/listTeachers", "TeachersController.ListTeachers"),
    Route.get("/getSelectedTeacher/:teacherId", "TeachersController.GetSelectedTeacher"),
    Route.get("/getScheduledClass/:classId", "TeachersController.GetScheduledClass"),
    Route.post("/getDate", "TeachersController.GetClassesDate"),
    Route.post("/schedule", "TeachersController.ScheduleClass"),
    Route.put("/confirm", "TeachersController.ConfirmClass"),
    Route.delete("/cancel/:classId", "TeachersController.CancelClass"),
    Route.post("/seeNotification", "TeachersController.SeeNotification")
}).prefix("/teachers").middleware('auth');