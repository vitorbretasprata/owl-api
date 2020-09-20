import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Authentication from "App/Models/authentication";
import Mail from "@ioc:Adonis/Addons/Mail";
import Account from 'App/Models/Account';

export default class AuthenticationController {

    public async Login({ response, request, auth }: HttpContextContract) {
        try {
            const { email, password } = request.all();

            const validationSchema = schema.create({
                email: schema.string({ trim: true }, [
                    rules.required()
                ]),
                password: schema.string({ trim: true }, [
                  rules.required()
                ])
            });

            const validatedData = await request.validate({
                schema: validationSchema,
                data: {
                    email,
                    password
                }
            });

            const token = await auth.use('api').attempt(validatedData.email, validatedData.password);

            const authUser = await Authentication.query().select("*")
                .where("email", validatedData.email)
                .first();

            const userInfo = await this.getUserInfo(authUser?.id);

            response.ok({
                ...token.toJSON(),
                type: userInfo.type,
                id: userInfo.id
            });
        } catch (error) {

            console.log(error);
            response.abort({
                message: "Credenciais inválidas."
            }, 404);
        }
    }

    public async AuthenticateToken({ response, auth }: HttpContextContract) {
        try {
            const token = await auth.authenticate(); 

            if(!token) {
                response.abort("Token não encontrado", 422);
            }
    
            const accountInfo = await this.getUserInfo(token.id);
    
            response.ok({
                ...token.toJSON(),
                type: accountInfo.type
            });
        } catch(error) {
            response.abort("Token inválido", 500);
        }
    }

    public async Register({ request, response }: HttpContextContract) {

        const validationSchema = schema.create({
            name: schema.string({ trim: true }, [
                rules.minLength(2)
            ]),
            email: schema.string({ trim: true }, [
              rules.email(),
              rules.unique({ table: 'authentications', column: 'email' })
            ]),
            password: schema.string({ trim: true }, [
                rules.confirmed(),
                rules.minLength(6)
            ])
        });

        const validatedData = await request.validate({
            schema: validationSchema,
            reporter: validator.reporters.api,
            messages: {
                'email.unique': 'Email já cadastrado.',
                'password.minLength': 'Senha deve conter no minimo 6 caracteres.',
                'password.confirmed': 'Senhas não batem.',
            }
        });

        await Authentication.create({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password
        });

        response.ok({
            status: 200,
            message: "Dados cadastrados com sucesso."
        });
    }

    public async confirmEmail({ request, response }: HttpContextContract) {

        try {
            const { email } = request.all();

            const isEmailRegistered = await Authentication.query().select(["email"]).where("email", email);

            if(!isEmailRegistered) {
                response.abort("Email não encontrado", 422);
            }

            const resetCode = this.generateRandomNumber(100000, 999999);

            await Mail.send((message) => {
                message
                    .to(email)
                    .from('vitorbretasprata@gmail.com')
                    .subject("Redefinir senha")
                    .htmlView('emails/reset_code', { code: resetCode })
            });

            response.ok({
                code: resetCode,
                email
            });

        } catch (error) {
            response.abort({
                code: 500,
                default: "Ocorreu um error na hora de listar os professores, tente mais tarde.",
                detail: error.body
            });
        }
    }

    public async resetPassword({ request, response }: HttpContextContract) {

        const validationSchema = schema.create({
            email: schema.string({ trim: true }, [
                rules.email()
            ]),
            password: schema.string({ trim: true }, [
                rules.confirmed(),
                rules.minLength(6)
            ])
        });

        const validatedData = await request.validate({
            schema: validationSchema,
            reporter: validator.reporters.api,
        });

        await Authentication.query().where("email", validatedData.email).update({
            password: validatedData.password
        });

        response.ok("Senha atualizada com sucesso.");
    }

    private generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private async getUserInfo(id) {
        let accountUser;
        accountUser = await Account.query().select("*").where("authentication_id", id).first();

        if(!accountUser) {
            accountUser = await Account.create({
                authenticationId: id,
                type: 0
            });
        }

        return accountUser;
    }
}
