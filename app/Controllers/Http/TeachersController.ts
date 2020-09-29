import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";
import Database from '@ioc:Adonis/Lucid/Database';
import Account from 'App/Models/Account';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import AccountTypeStudent from 'App/Models/AccountTypeStudent';
import ScheduledClass from 'App/Models/ScheduledClass';
import { ModelObject } from '@ioc:Adonis/Lucid/Model';
import NotificationClass from 'App/utilities/pushNotifications';
import Notification from 'App/Models/Notification';

export default class TeachersController {

    public async ListTeachers({ response, request } : HttpContextContract) {
        try {
            const { filter, page, limit } = request.all();

            let account : any = "";
            if(filter.lecture_id) {

                account = await Database
                    .from("account_type_teachers")
                    .select([
                        "account_type_teachers.id", 
                        "account_type_teachers.complete_name", 
                        "account_type_teachers.lecture_time", 
                        "account_type_teachers.lecture_value", 
                        "account_type_teachers.movement_value",
                        "teacher_lectures.lecture_id"
                    ])
                    .distinct()
                    .where("teacher_lectures.lecture_id", filter.lecture_id)
                    .innerJoin("teacher_lectures", "account_type_teachers.id", "teacher_lectures.account_teacher_id")
                    .paginate(page, limit);

            }

            response.ok(account)

        } catch(error) {
            response.abort("Ocorreu um error na hora de listar os professores, tente mais tarde.");
        }
    }

    public async ScheduleClass({ response, request, auth  } : HttpContextContract) {
        try {
            const id = auth.user?.id || -1;
            const notification = new NotificationClass();

            const userType = await Database.query()
                .select([
                    "accounts.token_notification",
                    "accounts.id",
                    "accounts.type",
                    "account_type_students.complete_name",
                    "account_type_students.id as id_student"
                ])
                .from("accounts")
                .where("authentication_id", id)
                .innerJoin("account_type_students", "accounts.id", "account_type_students.account_id")
                .first();

            if(userType?.type !== 1) {
                response.abort("Seu tipo de conta não tem permissão para marcar aula.");
            }

            const scheduleInfo = request.all();

            const validationSchema = schema.create({
                idStudent: schema.number([
                    rules.required(),
                ]),
                idTeacher: schema.number([
                    rules.required(),
                ]),
                date: schema.date({
                    format: "yyyy-MM-dd HH:mm"
                }, [
                    rules.required()
                ]),
                location: schema.string({
                    escape: true
                }, [
                    rules.required()
                ]),
                needMovement: schema.boolean([
                    rules.required()
                ]),
                totalValue: schema.number([
                    rules.required()
                ])
            });

            let validatedSchema = await validator.validate({
                schema: validationSchema,
                data: scheduleInfo
            });

            const teacherNotificationToken = await Database.query()
                .select([
                    "accounts.token_notification",
                    "accounts.id"
                ])
                .from("accounts")
                .where("account_type_teachers.id", validatedSchema.idTeacher)
                .innerJoin("account_type_teachers", "accounts.id", "account_type_teachers.account_id")
                .first();


            const solicitationDate = new Date(scheduleInfo.date);

            const res = await this.updateOrCreateClass(validatedSchema, userType?.type);

            if(!res) {
                response.abort("Ocorreu um error na hora de agendar a aula, tente novamente.");
            }

            const notificationMessage = `O estudante ${userType.complete_name} lhe enviou uma solicitação de agendamento de aula para o dia ${solicitationDate.getDate()}/${solicitationDate.getMonth() + 1}/${solicitationDate.getFullYear()} às ${solicitationDate.getHours()}:${solicitationDate.getMinutes()}, deseja aceitar?`;

            notification.sendPushNotifications(teacherNotificationToken.token_notification, notificationMessage);

            await Notification.create({
                idAccount: teacherNotificationToken.id,
                message: notificationMessage,
                idAccountStudent: userType.id_student
            });

            response.ok(userType);

        } catch(error) {
            console.log(error);
            response.abort({
                default: "Ocorreu um error na hora de agendar a aula, tente novamente.",
                detail: error.body
            }, 500);
        }
    }

    public async ConfirmClass({ response, request, auth } : HttpContextContract) {
        try {
            const id = auth.user?.id || -1;
            const notification = new NotificationClass();

            const userType = await Account.query().select(["id", "type", "token_notification"]).where("authentication_id", id).first();

            if(userType?.type !== 3 || !userType?.tokenNotification) {
                response.abort("Seu tipo de conta não tem permissão para marcar aula.");
            }

            const requestData = request.all();

            const validationSchema = schema.create({
                idClass: schema.number([
                    rules.required(),
                ]),
                statusClass: schema.number([
                    rules.required(),
                ])
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: requestData
            });

            const res = await this.updateOrCreateClass(validatedSchema.statusClass, userType?.type, validatedSchema.idClass);

            if(!res) {
                response.abort("Ocorreu um error na hora de confirmar a aula, tente novamente.");
            }

            const student = await Database.query()
                .select([
                    "accounts.token_notification",
                    "accounts.id"
                ])
                .from("accounts")
                .where("account_type_students.id", res?.idStudent)
                .innerJoin("account_type_students", "accounts.id", "account_type_students.account_id")
                .first();


            const solicitationDate = new Date(res?.date);
            const notificationMessage = `Sua aula do dia ${solicitationDate.getDate()}/${solicitationDate.getMonth() + 1}/${solicitationDate.getFullYear()} às ${solicitationDate.getHours()}:${solicitationDate.getMinutes()} foi confirmada.`;

            if(!student?.token_notification) {
                response.abort("Este usuário não possui token de notificação.");
            }

            notification.sendPushNotifications(student?.token_notification, notificationMessage);

            await Notification.create({
                idAccount: student?.id,
                message: notificationMessage
            });

            response.ok("Solicitação de agendamento de aula criada com sucesso, aguarde a resposta do professor.");

        } catch(error) {
            console.log(error);
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    /**
     * 
     * @param param0 
     */
    public async GetClassesDate({ response, request, auth } : HttpContextContract) {
        try {
            const { date } = request.all();

            const userType = await this.getUserId(auth.user?.id);
            if(userType === false) {
                response.abort("Usuário não encontrado");
            }

            const columnType = (userType && userType.type === 1) ? 'student_id' : 'teacher_id';
            const userId = (userType && userType.id) ? userType.id : 0;

            const classes = await Database.rawQuery(`SELECT * FROM scheduled_classes WHERE ${columnType} = ? AND date LIKE ?`, [userId, `${date}%`]);

            response.ok(classes[0]);

        } catch(error) {
            console.log(error);
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    /**
     * 
     * @param param0 
     */
    public async GetSelectedTeacher({ response, params } : HttpContextContract) {
        const { teacherId } = params;

        try {
            const teacher = await AccountTypeTeacher.query().preload("lectures").where("id", teacherId).first();

            if(!teacher) {
                response.abort("Professor não encontrado.");
            }

            response.ok({
                Teacher: teacher
            });

        } catch(error) {
            response.abort({
                default: "Ocorreu um error na hora de buscar a aula, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    /**
     * 
     * @param param0 
     */
    public async SeeNotification({ response, request, auth } : HttpContextContract) {
        const id = auth.user?.id || -1;
        const { notifications } = request.all();

        try {
            const userType = await Account.query().select(["id"]).where("authentication_id", id).first();

            if(!userType) {
                response.abort("Usuário não encontrado.");
            }

            await Notification.query().select("*").whereIn("id", notifications);

        } catch(error) {
            response.abort({
                default: "Ocorreu um error na hora de buscar a aula, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    /**
     * 
     * @param param0 
     */
    public async GetScheduledClass({ response, params } : HttpContextContract) {
        const { classId } = params;

        try {
            const scheduledClass = await ScheduledClass.query().where("id", classId).first();

            if(!scheduledClass) {
                response.abort("Aula não encontrada.");
            }

            const teacherName = await this.GetUserFullName(scheduledClass?.idTeacher, AccountTypeTeacher);
            const studentName = await this.GetUserFullName(scheduledClass?.idStudent, AccountTypeStudent);

            if(!teacherName || !studentName) {
                response.abort("Nome do estudante ou do professor está faltando.");
            }

            response.ok({
                ScheduleClass: scheduledClass,
                teacherName: teacherName.completeName,
                studentName: studentName.completeName
            });

        } catch(error) {
            console.log(error);
            response.abort({
                default: "Ocorreu um error na hora de buscar a aula, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    /**
     * 
     * @param param0 
     */
    public async CancelClass({ response, params, auth } : HttpContextContract) {
        try {
            const { classId } = params;
            const id = auth.user?.id || -1;
            const notification = new NotificationClass();

            const userType = await this.getUserId(id);

            if(userType === false) {
                response.abort("Usuário não encontrado");
            }

            const columnType = (userType && userType.type === 1) ? 'student_id' : 'teacher_id';
            const userId = (userType && userType.id) ? userType.id : 0;

            const cancelingClass = await ScheduledClass.query().where("id", classId).first();

            const userStudent = await Database
                .from("accounts")
                .select([
                    "accounts.id",
                    "accounts.token_notification", 
                    "account_type_students.complete_name"
                ])
                .innerJoin("account_type_students", "account.id", "account_type_students.account_id")
                .where("account_type_students.id", cancelingClass!.idStudent)
                .first();

            const userTeacher = await Database
                .from("accounts")
                .select([
                    "accounts.id",
                    "accounts.token_notification", 
                    "account_type_teachers.complete_name"
                ])
                .innerJoin("account_type_teachers", "account.id", "account_type_teachers.account_id")
                .where("account_type_teachers.id", cancelingClass!.idTeacher)
                .first();

            if(!userStudent || !userStudent || !cancelingClass) {
                response.abort("Aula inválida.");
            }

            let studentNotificationToken : string = userStudent!.tokenNotification || "";
            let teacherNotificationToken : string = userTeacher!.tokenNotification || "";
            let studentName : string = userStudent!.completeName || ""
            let teacherName : string = userTeacher!.completeName || ""

            await Database.rawQuery(`DELETE FROM scheduled_classes WHERE ${columnType} = ? AND id = ?`, [userId, classId]);

            const notificationToStudent = `Sua aula com o professor ${teacherName} foi cancelada.`
            const notificationToTeacher = `Sua aula com o aluno ${studentName} foi cancelada.`


            notification.sendPushNotifications(studentNotificationToken, notificationToStudent);
            notification.sendPushNotifications(teacherNotificationToken, notificationToTeacher);


            await Notification.createMany([
                {
                    idAccount: userStudent?.id,
                    message: notificationToStudent
                },
                {
                    idAccount: userTeacher?.id,
                    message: notificationToTeacher
                }
            ]);

            response.ok(200);

        } catch(error) {
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    /** Private classes */

    private async GetUserFullName(userId : number = 0, model : ModelObject) {
        try {

            const fullName = await model.query().select(["complete_name"]).where("id", userId).first();

            return fullName;
        } catch(error) {
            console.log(error);
            return "";
        }
    }

    private async updateOrCreateClass(data : any, userType : number = 0, idClass : number = 0) {
        try {

            if(typeof data === "object" && userType === 1) {
                const scheduleDate = `${data.date.year}-${data.date.month}-${data.date.day} ${data.date.hour}:${data.date.minute}`;

                const newClass = await ScheduledClass.create({
                    idStudent: data.idStudent,
                    idTeacher: data.idTeacher,
                    date: scheduleDate,
                    needMovement: data.needMovement,
                    totalValue: data.totalValue,
                    location: data.location,
                    status: 1
                });

                return newClass;
            }

            if(typeof data === "number" && userType === 3) {
                const scheduledClass = await this.updateScheduledClass(data, idClass);

                return scheduledClass;
            }

            return false;
        } catch(error) {
            console.log(error);
            return false;
        }
    }

    private async updateScheduledClass(status : number, idClass : number = 0) {
        try {
            if(status === 2) {
                const res = await ScheduledClass.query().select("*").where("id", idClass).first();

                await ScheduledClass.query().where("id", idClass).update({
                    status: status
                });



                return res;
            }

            return false;

        } catch(error) {
            console.log(error)
            return false;
        }
    }

    private async getUserId(authId) {
        try {
            const account = await Account.query().select(["id", "type"]).where("authentication_id", authId).first();

            const accountId = account?.id;

            if(accountId) {
                if(account?.type === 1) {
                    const accountStudentId = await this.getAccountTypeId(accountId, AccountTypeStudent);

                    return {
                        id: accountStudentId.id,
                        type: account?.type
                    };
                }

                if(account?.type === 3) {
                    const accountTeacherId = await this.getAccountTypeId(accountId, AccountTypeTeacher);

                    return {
                        id: accountTeacherId.id,
                        type: account?.type
                    };
                }
            }

            return false;
        } catch(error) {
            console.log(error);

            return false;
        }
    }

    private async getAccountTypeId(accountId : number, model: ModelObject) {
        try {
            const accountTypeId = await model.query().select(["id"]).where("account_id", accountId).first();

           return accountTypeId.toJSON();
        } catch(error) {
            return false;
        }
    }
}
