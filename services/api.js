'use strict';

const axios = require('axios')

const usernameApi = "admin";
const passwordApi = "89372f0ddc5de5f99bcaf6b785535090"

const api = axios.create({
    baseURL: 'https://api-function.lyceum.com.br/',
    auth: {
        username: usernameApi,
        password: passwordApi
    }
});

module.exports = api;