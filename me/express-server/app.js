//* create a server
const express = require('express')
const app = express()
const port = 4000

app.get(`/`, (req, res) => {
    res.json({
        status: "success",
        data: {
            name: `sultan`
        }
    })
})

/// 0.0.0.0 is the IP can reachable from any device
app.listen(port, `0.0.0.0`, () => {
    console.log(`Example app listening on port ${port}!`)
})