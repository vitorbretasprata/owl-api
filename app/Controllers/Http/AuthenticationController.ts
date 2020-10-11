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
                complete_name: authUser?.name,
                type: userInfo.type,
                id: userInfo.id
            });
        } catch (error) {

            console.log(error)
            if(error.messages && error.messages.errors) {
                response.abort({
                    message: error.messages.errors[0].message
                }, 400);
            }

            response.abort({
                message: "Houve um error no servidor, tente denovo mais tarde."
            }, 500);
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
        try {
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
                    'name.minLength': 'O nome deve conter pelo menos 2 letras.',
                    'email.unique': 'Email já cadastrado.',
                    'password.minLength': 'Senha deve conter no minimo 6 caracteres.',
                    'password_confirmation.confirmed': 'Senhas não batem.',
                }
            });
    
            await Authentication.create({
                name: validatedData.name,
                email: validatedData.email,
                password: validatedData.password
            });
    
            response.ok("Dados cadastrados com sucesso.");
        } catch(error) {
            console.log(error)
            if(error.messages && error.messages.errors) {
                response.abort({
                    message: error.messages.errors[0].message
                }, 400);
            }

            response.abort({
                message: "Houve um error no servidor, tente denovo mais tarde."
            }, 500);
        }

        
    }

    public async confirmEmail({ request, response }: HttpContextContract) {

        try {
            const { email } = request.all();

            const trimedEmail = email.trim();

            const isEmailRegistered = await Authentication.query().select(["email"]).where("email", trimedEmail).first();

            if(!isEmailRegistered) {
                response.abort({
                    message: "Email inválido ou não encontrado."
                }, 404);
            }

            const resetCode = this.generateRandomNumber(100000, 999999);

            await Mail.send((message) => {
                message
                    .to(trimedEmail)
                    .from('vitorbretasprata@gmail.com')
                    .subject("Redefinir senha")
                    .htmlView('emails/reset_code', { code: resetCode })
            });

            response.ok({
                code: resetCode,
                email
            });

        } catch (error) {
            if(error.body && error.body.message) {
                response.abort(error.body, error.status);
            }

            response.abort({
                message: "Houve um error no servidor, tente denovo mais tarde."
            }, 500);
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
