module.exports = async function (req, res) {
    res.send({
        "status": "up",
        "message": "The hostname is up",
        "hostname": req.hostname
    })
}