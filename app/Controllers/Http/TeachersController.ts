import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";
import Database from '@ioc:Adonis/Lucid/Database';
import Account from 'App/Models/Account';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import AccountTypeStudent from 'App/Models/AccountTypeStudent';
import ScheduledClass from 'App/Models/ScheduledClass';

export default class TeachersController {

    public async ListTeachers({ response, request } : HttpContextContract) {
        try {
            const { filter, page, limit } = request.all();

            let account : any = "";
            if(filter.lecture_id) {

                account = await Database
                    .from("account_type_teachers")
                    .select([
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

            const userType = await Account.query().select(["type"]).where("authentication_id", id).first();

            if(userType?.type !== 1) {
                response.abort("Seu tipo de conta não tem permissão para marcar aula.");
            }

            response.ok(userType);

        } catch(error) {
            console.log(error);
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }
    }

    public async schedule({ response, request, auth } : HttpContextContract) {
        try {

            const { scheduleInfo } = request.all();

            const validationSchema = schema.create({
                idStudent: schema.number([
                    rules.required(),
                ]),
                idTeacher: schema.number([
                    rules.required(),
                ]),
                date: schema.date({}, [
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

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: scheduleInfo
            });

            await ScheduledClass.create({
                ...validatedSchema,
                status: 1
            });

            response.ok(200);

        } catch(error) {
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }
    }

    public async updateScheduledClass({ response, request, auth } : HttpContextContract) {
        const { status, scheduleId } = request.all();

        try {
            if(status === 2 || status === 3) {
                await ScheduledClass.query().where("id", scheduleId).update("status", status);
            } else {                
                await ScheduledClass.query().where("id", scheduleId).delete();
            }

            response.ok(200);

        } catch(error) {
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }
    }

    public async getClassesDate({ response, request, auth } : HttpContextContract) {
        try {
            const { date } = request.all();

            const userId = await this.getUserId(auth.user?.id);

            if(!userId) {
                response.abort("Usuário não encontrado.");
            }


        } catch(error) {
            
        }
    }

    public async getUserId(authId) {
        try {
            const account = await Account.query().select(["id", "type"]).where("authentication_id", authId).first();
            let userTypeId;

            if(account?.type === 1) 
                userTypeId = await AccountTypeStudent.query().select(["id"]).where("student_id", account.id);
            else
                userTypeId = await AccountTypeTeacher.query().select(["id"]).where("teacher_id", account.id);

            return userTypeId.id;
        } catch(error) {
            console.log(error);

            return false;
            
        }
    }



    public async getScheduledClass({ response, request } : HttpContextContract) {
        const { scheduleId } = request.all();

        try {
            const scheduledClass = ScheduledClass.query().where("id", scheduleId).firstOrFail();

            response.ok(scheduledClass);

        } catch(error) {
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }
    }

    public async CancelClass({ response, request, auth } : HttpContextContract) {
        try {
            const { classId } = request.all();
            const id = auth.user?.id || -1;

            const userTypeId = await this.getUserId(id);

            await Database.rawQuery(`DELETE FROM schedule_classes WHERE student_id = ${userTypeId} OR teacher_id = ${userTypeId} AND id = ${classId}`);

            response.ok(200);

        } catch(error) {
            response.abort("Ocorreu um error na hora de listar os professores, tente mais tarde.");
        }
    }
}
