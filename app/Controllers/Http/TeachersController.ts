import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";
import Database from '@ioc:Adonis/Lucid/Database';
import Account from 'App/Models/Account';

export default class TeachersController {

    public async ListTeachers({ response, request } : HttpContextContract) {
        try {
            const { filter, page, limit } = request.all();

            // const teachers = await AccountTypeTeacher.query().paginate(page, limit);
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

    public async schedule() {
        try {
            

        } catch(error) {
            
        }
    }

    public async CancelClass({ response, request } : HttpContextContract) {
        try {
            // const { filter, page, limit } = request.all();


            response.ok(200);

        } catch(error) {
            response.abort("Ocorreu um error na hora de listar os professores, tente mais tarde.");
        }
    }
}
