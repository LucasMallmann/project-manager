'use strict'

class SessionController {
  /**
   *
   * @param {import('@adonisjs/framework/src/Request')} ctx.request
   * @param {import('@adonisjs/auth/src/Schemes/Session')} ctx.auth
   */
  async store ({ request, auth }) {
    const { email, password } = request.all()
    const token = await auth.attempt(email, password)

    return token
  }
}

module.exports = SessionController
