import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Account from "App/Models/Account";
import AccountTypeStudent from "App/Models/AccountTypeStudent";
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";
import AccountBank from "App/Models/AccountBank";
import Bank from "App/Models/Bank";
import LectureName from "App/Models/LectureName";
import Database from '@ioc:Adonis/Lucid/Database';

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
                    rules.unique({ table: "accounts", column: "authentication_id" })
                ]),
                type: schema.number([
                    rules.required(),
                ])
            });

            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: accountInfo
            });

            const newAccount = await Account.create({
                type: validatedSchema.type,
                authenticationId: validatedSchema.authId
            });

            let status;
            switch(type) {
                case 1: 
                    status = await this.setAccountInfoStudent(info, newAccount.id, fullName);
                    break;
                case 2: 
                    status = await this.SetAccountInfoParent(info, newAccount.id);
                    break;
                case 3: 
                    status = await this.setAccountInfoTeacher(info, newAccount.id, fullName);
                    break;
                default:
                    response.abort("Tipo de conta inválida");
                    break;
            }

            if(!status) {
                response.abort("Error ao salvar dados do usuário");
            }

            response.ok(200);

        } catch (error) {
            console.log(error)
            response.abort("Error ao salvar dados do usuário", 500);
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
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
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
                status: 200,
                message: "Matérias atualizadas com sucesso!"
            });

        } catch (error) {
            console.log(error)
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }

    }

    public async UpdateTeacherBankInfo({ response, request, auth } : HttpContextContract) {

        try {

            const authId = auth.user!.id;
            const bankInfo = request.all();

            const accountTeacherId = await this.getIdTeacher(authId);

            if(!accountTeacherId) {
                response.abort("Professor não encontrado.");
            }

            const validationSchema = schema.create({
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

            await this.updateBankAccount(validatedSchema, accountTeacherId);

            response.ok({
                status: 200,
                message: "Dados bancários atualizados com sucesso!"
            });

        } catch (error) {
            console.log(error)
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }

    }

    private async setAccountInfoStudent(Info : Object, idAccount: number, fullName : string) {

        try {

            await AccountTypeStudent.create({
                idAccount: idAccount,
                completeName: fullName
            });

            return true;

        } catch(error) {
            console.log(error);

            return false;
        }
    }

    private async setAccountInfoTeacher(Info : any = {}, idAccount: number, fullName : string) {

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

            return true;

        } catch (error) {
            console.log(error)
        }

    }

    private async updateBankAccount(bankInfo: any = {}, idAccountTeacher: number) {
        try {
            const bank = await Bank.findByOrFail('code', bankInfo.code);

            await AccountBank.updateOrCreate({
                accountTypeTeacherId: idAccountTeacher
            },{
                accountTypeTeacherId: idAccountTeacher,
                completeName: bankInfo.completeName,
                agency: bankInfo.agency,
                accountNumber: bankInfo.bankAccount,
                cpf: bankInfo.cpf,
                bankId: bank.id
            });
        } catch (error) {
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
