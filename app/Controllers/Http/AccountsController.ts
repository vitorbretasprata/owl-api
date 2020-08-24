import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Account from "App/Models/Account";
import AccountTypeStudent from "App/Models/AccountTypeStudent";
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";
import AccountBank from "App/Models/AccountBank";
import Bank from "App/Models/Bank";
import LectureName from "App/Models/LectureName";

export default class AccountsController {

    public async SetAccountInfo({ response, request, auth } : HttpContextContract) {
        const { type, info } = request.all();
        const authId = auth.user!.id;
        try {

            /*
                const accountInfo = {
                    type,
                    authId,
                    city: info.city || null,
                    countryId: info.countryId || null,
                    stateId: info.stateId || null
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
            */

            const newAccount = {
                id: 5
            }

            let status;
            switch(type) {
                case 1: 
                    status = await this.SetAccountInfoStudent(info, newAccount.id);
                    break;
                case 2: 
                    status = await this.SetAccountInfoParent(info, newAccount.id);
                    break;
                case 3: 
                    status = await this.SetAccountInfoTeacher(info, newAccount.id);
                    break;
                default:
                    response.abort("Tipo de conta inválida");
                    break;
            }

            if(!status) {
                response.abort("Error ao salvar dados do usuário");
            }

            //const account = await AccountTypeTeacher.query().where("id", 8).preload("bankingAccount").preload("lectures");

            response.ok(200);

        } catch (error) {
            console.log(error)
            response.abort("Error ao salvar dados do usuário", 500);
        }
    }

    public async SetAccountInfoStudent(Info : Object, idAccount: number) {

        return true;

    }

    public async SetAccountInfoTeacher(Info : any = {}, idAccount: number) {


        
        /*
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
        */
        

        try {
            /*
            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: Info
            });


            
                const newAccountTeacher = await AccountTypeTeacher.create({
                    accountId: idAccount,
                    lectureTime: validatedSchema.lectureTime,
                    lectureValue: validatedSchema.lectureValue,
                    movementValue: validatedSchema.movementValue,
                    phone: validatedSchema.phone
                });
            */

            const newAccountTeacher = {
                id: 8
            }
            

            // await this.updateBankAccount(validatedSchema.bankInfo, newAccountTeacher.id);

            await this.updateLectures(Info.lectures, newAccountTeacher.id);

            return true;

        } catch (error) {
            console.log(error)
        }

    }

    public async updateBankAccount(bankInfo: any = {}, idAccountTeacher: number) {
        const bank = await Bank.findByOrFail('code', bankInfo.code);

        await AccountBank.updateOrCreate({
            accountTypeTeacherId: idAccountTeacher,
            completeName: bankInfo.completeName,
            agency: bankInfo.agency,
            accountNumber: bankInfo.bankAccount,
            cpf: bankInfo.cpf,
            bankId: bank.id
        }, {
            accountTypeTeacherId: idAccountTeacher
        });
    }

    public async updateLectures(lectures: object, idAccountTeacher: number) {
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

    public async SetAccountInfoParent(Info : Object, idAccount: number) {

        return true;
    }
}
