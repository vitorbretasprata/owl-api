import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Account from "App/Models/Account";
import AccountTypeStudent from "App/Models/AccountTypeStudent";
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";
import AccountBank from "App/Models/AccountBank";
import Bank from "App/Models/Bank";
import LectureName from "App/Models/LectureName";
import Database from '@ioc:Adonis/Lucid/Database';
import Notification from "App/utilities/pushNotifications";
import Notifications from "App/Models/Notification";


export default class AccountsController {

    public async SetAccountInfo({ response, request, auth } : HttpContextContract) {
        const { type, info } = request.all();
        const authId = auth.user!.id;
        const fullName = auth.user!.name;

        try {

            const accountInfo = {
                type,
                authId
            }

            const validationSchema = schema.create({
                authId: schema.number([
                    rules.required(),
                ]),
                type: schema.number([
                    rules.required(),
                ])
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: accountInfo
            });

            const userAccount = await Account.query().where("authentication_id", validatedSchema.authId).first();

            if(!userAccount) {
                response.abort("Conta não encontrada, entre em contato com o suporte.", 500);
            }

            let status;
            switch(validatedSchema.type) {
                case 1: 
                    status = await this.setAccountInfoStudent(info, validatedSchema.type, userAccount!.id, fullName);
                    break;
                case 2: 
                    status = await this.SetAccountInfoParent(info, userAccount!.id);
                    break;
                case 3: 
                    status = await this.setAccountInfoTeacher(info, validatedSchema.type, userAccount!.id, fullName);
                    break;
                default:
                    response.abort("Tipo de conta inválida", 400);
                    break;
            }

            if(!status) {
                response.abort("Error ao salvar dados do usuário", 500);
            }

            response.ok(status);

        } catch (error) {
            console.log(error)
            response.abort("Error ao salvar dados do usuário", 500);
        }
    }

    public async GetAccountInfo({ response, auth } : HttpContextContract) {
        const authId = auth.user!.id;

        try {
            const accountInfo = await Account
                .query()
                .select()
                .where("authentication_id", authId)
                .preload("accountTypeTeacher", 
                    acc => acc.preload("bankingAccount").preload("lectures"))
                .first();

            if(!accountInfo) {
                response.abort("Usuário não encontrado", 404);
            }

            response.ok(accountInfo);

        } catch (error) {
            console.log(error)
            response.abort("Usuário não encontrado", 500);
        }
    }

    public async UpdateTeacherInfo({ response, request, auth } : HttpContextContract) {

        try {

            const info = request.all();
            const authId = auth.user!.id;

            const accountTeacherId = await this.getIdTeacher(authId);

            const validationSchema = schema.create({
                lectureTime: schema.number([
                    rules.required()
                ]),
                lectureValue: schema.number([
                    rules.required(),
                ]),
                movementValue: schema.number([
                    rules.required(),
                ]),
                phone: schema.string({
                    trim: true
                },[
                    rules.required(),
                ])
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: info
            });

            await AccountTypeTeacher.updateOrCreate({
                id: accountTeacherId
            },
            {
                ...validatedSchema
            });

            response.ok({
                status: 200,
                message: "Dados atualizados com sucesso!"
            });

        } catch (error) {
            console.log(error)
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }

    }

    public async UpdateTeacherLectures({ response, request, auth } : HttpContextContract) {

        try {
            const authId = auth.user!.id;
            const bankInfo = request.all();

            const accountTeacherId = await this.getIdTeacher(authId);

            if(!accountTeacherId) {
                response.abort("Professor não encontrado.");
            }

            const validationSchema = schema.create({
                lectures: schema.object().members({})
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: bankInfo
            });

            await this.updateLectures(validatedSchema.lectures, accountTeacherId);

            response.ok({
                message: "Matérias atualizadas com sucesso!"
            });

        } catch (error) {
            console.log(error)
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }

    }

    public async UpdateTeacherBankInfo({ response, request, auth } : HttpContextContract) {

        try {

            const bankInfo = request.all();            

            const validationSchema = schema.create({
                accountTypeTeacherId: schema.number(),
                completeName: schema.string({
                    trim: true
                }),
                cpf: schema.string(),
                agency: schema.number(),
                bankAccount: schema.number(),
                code: schema.string({
                    trim: true
                }),
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: bankInfo
            });

            await this.updateBankAccount(validatedSchema);

            response.ok("Dados bancários atualizados com sucesso!");

        } catch (error) {
            console.log(error)
            response.abort({
                default: "Ocorreu um error na hora de atualizar os dados bancários, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    public async UpdatePushToken({ response, request, auth } : HttpContextContract) {

        try {
            const authId = auth.user!.id;
            const data = request.all();

            const validationSchema = schema.create({
                token: schema.string({
                    trim: true
                },[
                    rules.required()
                ])
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: data
            });

            await Account.query().where("authentication_id", authId).update({
                token_notification: validatedSchema.token
            });

            response.ok("Token salvo com sucesso.");

        } catch (error) {
            console.log(error)
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    public async TestePushNotification({ response, request, auth } : HttpContextContract) {

        try {
            const authId = auth.user!.id;
            const notification = new Notification();

            const acc = await Account.query().select(["token_notification", "id"]).where("authentication_id", authId).first();

            if(!acc) {
                response.abort("Usuário não encontrado", 404);
            }

            notification.sendPushNotifications(acc?.tokenNotification, "Teste de notificação");

            await Notifications.create({
                idAccount: acc?.id,
                message: "Teste de notificação"
            });

            response.ok(acc);

        } catch (error) {
            console.log(error)
            response.abort({
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    public async GetNotifications({ response, request, auth } : HttpContextContract) {
        try {
            const authId = auth.user!.id;

            const { page, limit } = request.all()

            const acc = await Account.query().select(["id"]).where("authentication_id", authId).first();

            if(!acc) {
                response.abort("Usuário não encontrado", 404);
            }

            const notification = await Notifications
                .query()
                .select('*')
                .where("account_id", acc?.id)
                .paginate(page, limit);

            response.ok(notification);

        } catch (error) {
            console.log(error)
            response.abort({
                default: "Ocorreu um error na hora de listar os as notificações, tente mais tarde.",
                detail: error.body
            }, 500);
        }
    }

    private async setAccountInfoStudent(Info : Object, type : number, idAccount: number, fullName : string) {

        try {

            await Account.query().where("id", idAccount).update({
                type: type
            });

            const newAcc = await AccountTypeStudent.create({
                idAccount: idAccount,
                completeName: fullName
            });

            return newAcc;

        } catch(error) {
            console.log(error);

            return false;
        }
    }

    private async setAccountInfoTeacher(Info : any = {}, type: number, idAccount: number, fullName : string) {

        try {

            const validationSchema = schema.create({
                phone: schema.string({
                    trim: true
                }, [
                    rules.required(),
                    rules.unique({ table: "account_type_teachers", column: "phone" })
                ]),
                lectureTime: schema.number([
                    rules.required()
                ]),
                lectureValue: schema.number([
                    rules.required()
                ]),
                movementValue: schema.number([
                    rules.required()
                ]),
                bankInfo: schema.object().members({
                    completeName: schema.string({
                        trim: true
                    }),
                    cpf: schema.string(),
                    agency: schema.number(),
                    bankAccount: schema.number(),
                    code: schema.string({
                        trim: true
                    }),
                }),
                lectures: schema.object().members({})
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: Info
            });

            await Account.query().where("id", idAccount).update({
                type: type
            });

            const newAccountTeacher = await AccountTypeTeacher.create({
                accountId: idAccount,
                lectureTime: validatedSchema.lectureTime,
                lectureValue: validatedSchema.lectureValue,
                movementValue: validatedSchema.movementValue,
                phone: validatedSchema.phone,
                completeName: fullName
            });

            await this.updateBankAccount(validatedSchema.bankInfo, newAccountTeacher.id);

            await this.updateLectures(Info.lectures, newAccountTeacher.id);

            return newAccountTeacher;

        } catch (error) {
            console.log(error)
        }

    }

    private async updateBankAccount(bankInfo: any = {}, accountTeacherId : number = 0) {
        try {
            if(accountTeacherId !== 0) {
                bankInfo.accountTypeTeacherId = accountTeacherId
            } 

            const bank = await Bank.query().select("*").where('code', bankInfo.code).first();

            await AccountBank.updateOrCreate({
                accountTypeTeacherId: bankInfo.accountTypeTeacherId
            },{
                completeName: bankInfo.completeName,
                agency: bankInfo.agency,
                accountNumber: bankInfo.bankAccount,
                accountTypeTeacherId: bankInfo.accountTypeTeacherId,
                cpf: bankInfo.cpf,
                bankId: bank.id || 1
            });
        } catch (error) {
            console.log(error)
            throw new Error("Código do banco não encontrado");
        }
    }

    private async updateLectures(lectures: object, idAccountTeacher: number) {
        let teacherLecture : LectureName[] = []

        Object.entries(lectures).forEach((lecture : Array<any>) => {
            const lectureId = lecture[0];
            const years = lecture[1];

            years.forEach(e => {
                const element : any = {
                    account_teacher_id: idAccountTeacher,
                    lecture_id: parseInt(lectureId, 10),
                    year_code: e
                }

                teacherLecture.push(element)
            });
        });

        const teacher = await AccountTypeTeacher.find(idAccountTeacher);

        await teacher?.related("lectures").detach();

        teacherLecture.forEach((lecture: any) => {
            teacher?.related('lectures').attach({
                [lecture.lecture_id]: {
                    year_code: lecture.year_code,
                }
            }).catch(err => {
                console.log(err)
            });
        });
    }

    private async getIdTeacher(authId : number) {

        const account = await Database
            .from("account_type_teachers")
            .select([
                "account_type_teachers.id"
            ])
            .innerJoin("accounts as acc", "acc.id", "account_type_teachers.account_id")
            .where("acc.authentication_id", authId)
            .first();

            return account.id;
    }

    public async SetAccountInfoParent(Info : Object, idAccount: number) {

        return true;
    }
}
