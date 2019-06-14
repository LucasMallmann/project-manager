'use strict'

const crypto = require('crypto')
const moment = require('moment')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  /**
   *
   * @param {object} ctx
   * @param {import('@adonisjs/framework/src/Request')} ctx.request
   * @param {import('@adonisjs/framework/src/Response')} ctx.response
   * @param {import('@adonisjs/auth/src/Schemes/Session')} ctx.auth
   */
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()
      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from('mallmann@email.com', 'Lucas Mallmann')
            .subject('Recuperação de senha')
        }
      )
    } catch (error) {
      console.log(error)
      return response.status(error.status).send({
        error: {
          message: 'Algo não deu certo. Esse e-mail existe? '
        }
      })
    }
  }

  /**
   *
   * @param {object} ctx
   * @param {import('@adonisjs/framework/src/Request')} ctx.request
   * @param {import('@adonisjs/framework/src/Response')} ctx.response
   * @param {import('@adonisjs/auth/src/Schemes/Session')} ctx.auth
   */
  async update ({ request, response }) {
    try {
      const { token, password } = request.all()
      const user = await User.findByOrFail('token', token)

      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'O token de recuperação está expirado' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      user.save()
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'Algo deu errado ao resetar sua senha' } })
    }
  }
}

module.exports = ForgotPasswordController
