/** en, cn */
/**
 * use module
 * module.exports = global.config = {
    i18n: {
        welcome: {
            en: "Welcome",
            fa: "خوش آمدید"
        }
        // rest of your translation object
    }
    // other global config variables you wish
  };
  *import './config';
  *global.config.i18n.welcome.en
 */

const Lang = {
  authentication: {
    logIn: { eng: 'Log In', cn: '登入' },
    signIn: { eng: 'Sign Up', cn: '註冊' },
    logInSuccess: { eng: 'Successfully logged in', cn: '登入成功' },
    signInSuccess: { eng: 'Successfully signed up', cn: '註冊成功' },
    logInFailure: { eng: 'Failed to log in', cn: '登入失敗' },
    signInFailuire: { eng: 'Failed to sign up', cn: '註冊失敗' },
  },
  errorMsg: {
    minWord: { eng: ['At least ', ' words.'], cn: ['至少', '字'] },
    required: { eng: 'Required.', cn: '必填' },
  },
  accountType: {
    eng: ['Normal', 'Cash', 'ForeignCurrency', 'Savings', 'Goals'],
  },
};

export default Lang;
