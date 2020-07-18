const express = require('express')
const app = express();
const fetch = require('node-fetch')

const cors = require('cors')
const volleyball = require('volleyball')
const helmet = require('helmet')

const connectDB = require('./db/mongoDb')

require('dotenv').config()

const port = 3001

connectDB().catch(err => console.log(err))

app.use(volleyball)
app.use(cors())
app.use(helmet())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('API works!')
})

app.get('/api/jira/:issue', async (req, res) => {
    try {
        const issueKey = req.params.issue;
        fetch(`${process.env.JIRA_HOST}/rest/api/2/issue/${issueKey}`, {
            headers: {
                'Authorization': `Basic ${new Buffer(process.env.JIRA_API_TOKEN).toString("base64")}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => res.send(data))
            .catch(err => res.status(400).send(err))
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))