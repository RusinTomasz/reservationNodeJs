const User = require("../models/user");
const Client = require("../models/client");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

class UserService {
  constructor() {}

  signUp = async (email, name, password, phoneNumber) => {
    const emailToken = crypto.randomBytes(64).toString("hex");
    const isVerified = false;
    let user;
    const createdUserName = await bcrypt
      .hash(password, 12)
      .then(async (hashedPw) => {
        user = await User.create(
          {
            email: email,
            emailToken: emailToken,
            isVerified: isVerified,
            password: hashedPw,
            name: name,
            client: {
              client_name: name,
              contact_mobile: phoneNumber,
              contact_mail: email,
            },
          },
          {
            include: [Client],
          }
        );
        return name;
      })
      .then(async (result) => {
        const isEmailSend = await this.sendVerificationEmail(emailToken, email);
        return result;
      })
      .catch((error) => {
        if (error.removeUser === true) {
          user.destroy();
          return error;
        } else {
          return error;
        }
      });
    return createdUserName;
  };

  login = async (email, password) => {
    let loadeduser;
    const user = User.findOne({
      where: {
        email: email,
      },
    })
      .then((user) => {
        if (!user) {
          throw createError(401, "A user with this email could not be found.");
        }
        loadeduser = user;
        return bcrypt.compare(password, user.password);
      })
      .then((isEqual) => {
        if (!isEqual) {
          throw createError(401, "Wrong password!");
        }
        const token = jwt.sign(
          {
            email: loadeduser.email,
            userId: loadeduser.id.toString(),
            role: loadeduser.role,
          },
          "dbapasmwij",
          { expiresIn: "1h" }
        );
        const user = {
          token: token,
          userId: loadeduser.id.toString(),
          role: loadeduser.role,
        };
        return user;
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return user;
  };

  verifyEmail = async (token) => {
    const verifiedUser = await User.findOne({
      where: { emailToken: token },
    })
      .then(async (user) => {
        if (!user) {
          throw createError(
            401,
            "Token is invalid. Please contact us for assistance"
          );
        }
        user.emailToken = null;
        user.isVerified = true;

        const verifiedUser = await user.save().then((result) => {
          return result.id;
        });
        return verifiedUser;
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return verifiedUser;
  };

  forgotPassword = async (email) => {
    const resetPasswordToken = crypto.randomBytes(64).toString("hex");

    const userWithForgottenPass = await User.findOne({
      where: {
        email: email,
      },
    })
      .then((user) => {
        if (!user) {
          throw createError(401, "A user with this email could not be found.");
        }
        user.resetPasswordToken = resetPasswordToken;
        user.save();
        return user;
      })
      .then(async (user) => {
        const isEmailSend = await this.sendResetPasswordEmail(
          resetPasswordToken,
          email
        );

        return user.id;
      })
      .catch((error) => {
        if (error.removeUserPasswordToken === true) {
          user.resetPasswordToken = null;
          user.save();
          return error;
        } else {
          return error;
        }
      });

    return userWithForgottenPass;
  };

  resetPassword = async (resetPassToken, newPass) => {
    const userWhosePassIsToBeReset = await User.findOne({
      where: {
        resetPasswordToken: resetPassToken,
      },
    })
      .then((user) => {
        if (!user) {
          throw createError(
            401,
            "Reset token is invalid. Please contact us for assistance"
          );
        }
        return user;
      })
      .then(async (user) => {
        const userWhosePassIsToBeReset = await bcrypt
          .hash(newPass, 12)
          .then(async (hashedNewPass) => {
            user.password = hashedNewPass;
            user.resetPasswordToken = null;
            const userWhosePassIsToBeReset = await user
              .save()
              .then((result) => {
                return result.id;
              })
              .catch((error) => error);
            return userWhosePassIsToBeReset;
          })
          .catch((error) => {
            if (!error.statusCode) {
              error.statusCode = 500;
            }
            return error;
          });
        return userWhosePassIsToBeReset;
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        return error;
      });
    return userWhosePassIsToBeReset;
  };

  sendVerificationEmail = async (emailToken, email) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const msg = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email",
      text: `
        Hello, thanks for registering on our site.
        Please copy and paste the addres below to verify yor account.
        http://${process.env.CLIENT_URL}/mail-verify?token=${emailToken}
      `,
      html: mailVerifyHtmlTemplate(
        `${process.env.CLIENT_URL}/mail-verify?token=${emailToken}`
      ),
    };

    return new Promise(function (resolve, reject) {
      transporter.sendMail(msg, (err, info) => {
        if (err) {
          reject(createError(422, err, { removeUser: true }));
        } else {
          resolve(true);
        }
      });
    });
  };

  sendResetPasswordEmail = async (resetPasswordToken, email) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const msg = {
      from: process.env.EMAIL,
      to: email,
      subject: "Resset your password",
      text: `
        Hello,
        Please copy and paste the addres below to reset your password.
        ${process.env.CLIENT_URL}/reset-password?resetPassToken=${resetPasswordToken}
      `,
      html: mailResetPasswordHtmlTemplate(
        `${process.env.CLIENT_URL}/reset-password?resetPassToken=${resetPasswordToken}`
      ),
    };

    return new Promise(function (resolve, reject) {
      transporter.sendMail(msg, (err, info) => {
        if (err) {
          reject(createError(422, err, { removeUserPasswordToken: true }));
        } else {
          resolve(true);
        }
      });
    });
  };
}

module.exports = {
  UserService: UserService,
};

const mailVerifyHtmlTemplate = (link) => `
<style type="text/css">

@media screen {
@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
}

@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 700;
  src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
}

@font-face {
  font-family: 'Lato';
  font-style: italic;
  font-weight: 400;
  src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
}

@font-face {
  font-family: 'Lato';
  font-style: italic;
  font-weight: 700;
  src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
}
}

/* CLIENT-SPECIFIC STYLES */
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; }

/* RESET STYLES */
img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
table { border-collapse: collapse !important; }
body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

/* iOS BLUE LINKS */
a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
}

/* ANDROID CENTER FIX */
div[style*="margin: 16px 0;"] { margin: 0 !important; }
</style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">

<!-- HIDDEN PREHEADER TEXT -->
<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
Looks like you tried signing in a few too many times. Let's see if we can get you back into your account.
</div>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
<!-- LOGO -->
<tr>
    <td bgcolor="#7c72dc" align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <tr>
                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                    <a style="font-size: 38px; font-weight: 400; text-decoration:none; color:fff; href="" target="_blank">
                        BookingApp
                    </a>
                </td>
            </tr>
        </table>
    </td>
</tr>
<!-- HERO -->
<tr>
    <td bgcolor="#7c72dc" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <tr>
                <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                  <h1 style="font-size: 32px; font-weight: 400; margin: 0;">Aktywuj swoje konto</h1>
                </td>
            </tr>
        </table>
    </td>
</tr>
<!-- COPY BLOCK -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
          <!-- COPY -->
          <tr>
            <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
              <p style="margin: 0;">Aktywacja konta jest bardzo prosta. Kliknij w poniższy link aktywacyjny, a Twoje konto zostanie natychmiast aktywowane.</p>
            </td>
          </tr>
          <!-- BULLETPROOF BUTTON -->
          <tr>
            <td bgcolor="#ffffff" align="left">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                          <td align="center" style="border-radius: 3px;" bgcolor="#7c72dc"><a href="${link}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #7c72dc; display: inline-block;">Aktywuj konto</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
    </td>
</tr>
<!-- COPY CALLOUT -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <!-- HEADLINE -->
            <tr>
              <td bgcolor="#111111" align="left" style="padding: 40px 30px 20px 30px; color: #ffffff; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <h2 style="font-size: 24px; font-weight: 400; margin: 0;">Nie możesz kliknąć w link powyżej?</h2>
              </td>
            </tr>
            <!-- COPY -->
            <tr>
              <td bgcolor="#111111" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <p style="margin: 0;">Skopiuj i wklej poniższy address w do okna przeglądarki.</p>
              </td>
            </tr>
            <!-- COPY -->
            <tr>
              <td bgcolor="#111111" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <p style="margin: 0; color: #7c72dc;">ADDRESS DO SKOPIOWANIA</p>
              </td>
            </tr>
        </table>
    </td>
</tr>
<!-- SUPPORT CALLOUT -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <!-- HEADLINE -->
            <tr>
              <td bgcolor="#C6C2ED" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Potrzebujesz więcej pomocy?</h2>
                <p style="margin: 0;"><a href="" target="_blank" style="color: #7c72dc;">Skontaktuj się z nami</a></p>
              </td>
            </tr>
        </table>
    </td>
</tr>
<!-- FOOTER -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >

          <!-- PERMISSION REMINDER -->
          <tr>
            <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;" >
              <p style="margin: 0;">Otrzymałeś ten email ponieważ założyłeś konto w serwisie BookingApp, jeśli nie <a href="" target="_blank" style="color: #111111; font-weight: 700;">skontaktuj się z nami</a>.</p>
            </td>
          </tr>

        </table>
    </td>
</tr>
</table>
`;

const mailResetPasswordHtmlTemplate = (link) => `
<style type="text/css">

@media screen {
@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 400;
  src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
}

@font-face {
  font-family: 'Lato';
  font-style: normal;
  font-weight: 700;
  src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
}

@font-face {
  font-family: 'Lato';
  font-style: italic;
  font-weight: 400;
  src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
}

@font-face {
  font-family: 'Lato';
  font-style: italic;
  font-weight: 700;
  src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
}
}

/* CLIENT-SPECIFIC STYLES */
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; }

/* RESET STYLES */
img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
table { border-collapse: collapse !important; }
body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

/* iOS BLUE LINKS */
a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
}

/* ANDROID CENTER FIX */
div[style*="margin: 16px 0;"] { margin: 0 !important; }
</style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">

<!-- HIDDEN PREHEADER TEXT -->
<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
Looks like you tried signing in a few too many times. Let's see if we can get you back into your account.
</div>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
<!-- LOGO -->
<tr>
    <td bgcolor="#7c72dc" align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <tr>
                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                    <a style="font-size: 38px; font-weight: 400; text-decoration:none; color:fff; href="" target="_blank">
                        BookingApp
                    </a>
                </td>
            </tr>
        </table>
    </td>
</tr>
<!-- HERO -->
<tr>
    <td bgcolor="#7c72dc" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <tr>
                <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                  <h1 style="font-size: 32px; font-weight: 400; margin: 0;">Zmień swoje hasło</h1>
                </td>
            </tr>
        </table>
    </td>
</tr>
<!-- COPY BLOCK -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
          <!-- COPY -->
          <tr>
            <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
              <p style="margin: 0;">Zmiana hasła jest bardzo prosta. Kliknij w poniższy link, a zostaniesz przekierowany do strony, gdzie będziesz mógł zmienić swoje hasło.</p>
            </td>
          </tr>
          <!-- BULLETPROOF BUTTON -->
          <tr>
            <td bgcolor="#ffffff" align="left">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                          <td align="center" style="border-radius: 3px;" bgcolor="#7c72dc"><a href="${link}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #7c72dc; display: inline-block;">Zmień hasło</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
    </td>
</tr>
<!-- COPY CALLOUT -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <!-- HEADLINE -->
            <tr>
              <td bgcolor="#111111" align="left" style="padding: 40px 30px 20px 30px; color: #ffffff; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <h2 style="font-size: 24px; font-weight: 400; margin: 0;">Nie możesz kliknąć w link powyżej?</h2>
              </td>
            </tr>
            <!-- COPY -->
            <tr>
              <td bgcolor="#111111" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <p style="margin: 0;">Skopiuj i wklej poniższy address w do okna przeglądarki.</p>
              </td>
            </tr>
            <!-- COPY -->
            <tr>
              <td bgcolor="#111111" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <p style="margin: 0; color: #7c72dc;">ADDRESS DO SKOPIOWANIA</p>
              </td>
            </tr>
        </table>
    </td>
</tr>
<!-- SUPPORT CALLOUT -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >
            <!-- HEADLINE -->
            <tr>
              <td bgcolor="#C6C2ED" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Potrzebujesz więcej pomocy?</h2>
                <p style="margin: 0;"><a href="" target="_blank" style="color: #7c72dc;">Skontaktuj się z nami</a></p>
              </td>
            </tr>
        </table>
    </td>
</tr>
<!-- FOOTER -->
<tr>
    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="480" >

          <!-- PERMISSION REMINDER -->
          <tr>
            <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;" >
              <p style="margin: 0;">Otrzymałeś ten email ponieważ założyłeś konto w serwisie BookingApp i chcesz zmienić swoje dotychczasowe hasło, jeśli nie <a href="" target="_blank" style="color: #111111; font-weight: 700;">skontaktuj się z nami</a>.</p>
            </td>
          </tr>

        </table>
    </td>
</tr>
</table>
`;
