
module.exports = async function (req, res, user) {

    res.send({
        success: true,
        message: `Pong! ${user.username}`
    })
}