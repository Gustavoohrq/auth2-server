'use strict';

const axios = require('axios')

const username = "usernameApi";
const password = "89372f0ddc5de5f99bcaf6b785535090"

const api = axios.create({
    baseURL: 'https://gfa.unip.br/api/',
    auth: {
        username: usernameApi,
        password: passwordApi
    }
});

module.exports = api;