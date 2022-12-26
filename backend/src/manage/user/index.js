const getUser = require("./get")
const postUser = require("./post")
const patchUser = require("./patch")
const deleteUser = require("./delete")

module.exports = {
    getUser, patchUser, postUser, deleteUser
}