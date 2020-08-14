import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator';
import Authentication from "App/Models/authentication";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class AuthenticationController {

    public async Login({ response, request, auth }: HttpContextContract) {
        const { email, password } = request.all();
        const token = await auth.use('api').attempt(email, password);

        response.ok(token.toJSON());
    }

    public async AuthenticateToken({ response, auth }: HttpContextContract) {
        const token = await auth.authenticate(); 

        if(!token) {
            response.abort("Token não encontrado", 500);
        }

        response.ok(token.toJSON());
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
        });

        await Authentication.create({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password
        });

        response.ok("Dados cadastrados com sucesso.");
    }

    public async confirmEmail({ request, response }: HttpContextContract) {

        const { email } = request.all();

        const isEmailRegistered = Authentication.findByOrFail("email", email);

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

    public generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
