import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Account from "App/Models/Account";
import AccountTypeStudent from "App/Models/AccountTypeStudent";
import AccountTypeTeacher from "App/Models/AccountTypeTeacher";



export default class AccountsController {

    public async SetAccountInfo({ response, request } : HttpContextContract) {
        const { type, info } = request.all();
        let status;
        switch(type) {
            case 1: 
                status = await this.SetAccountInfoStudent(type, info);
                break;
            case 2: 
                status = await this.SetAccountInfoParent(type, info);
                break;
            case 3: 
                status = await this.SetAccountInfoTeacher(type, info);
                break;
            default:
                response.abort("Tipo de conta inválida");
                break;
        }

        if(!status) {
            response.abort("Error ao salvar dados do usuário");
        }

        response.ok(200);
    }

    public async SetAccountInfoStudent(type : Number, Info : Object) {

        return true;

    }

    public async SetAccountInfoTeacher(type : Number, Info : Object) {

        const validationSchema = schema.create({
            phone: schema.number([
                rules.required()
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
                completeName: schema.string(),
                cpf: schema.string(),
                agency: schema.number(),
                bankAccount: schema.number()
            }),
            lectures: schema.object([
            ]).members({
                "1": schema.array().anyMembers(),
                "5": schema.array().anyMembers(),
            })
        });

        try {
            const validatedSchema = await validator.validate({
                schema: validationSchema,
                data: Info
            });

            const lecturesInfo = Object.entries(validatedSchema.lectures).map(lecture => {
                return {
                    name: lecture[0],
                    classes: lecture[1]
                }
            });

            console.log(lecturesInfo)

            return true;

        } catch (error) {
            console.log(error)
        }

    }

    public async SetAccountInfoParent(type : Number, Info : Object) {

        return true;
    }
}
