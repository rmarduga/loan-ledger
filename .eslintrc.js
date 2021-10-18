module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "plugins": [
        "mocha"
    ],
    "extends": ["eslint:recommended", "plugin:mocha/recommended"],
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "rules": {
    }
};
