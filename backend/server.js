const express = require('express');
const cors = require('cors');
const path = require('path');


const tasksRouter = require('./src/routes/tasks.router');
const { getInsights } = require('./src/services/insight.service');


const app = express();
app.use(cors());
app.use(express.json());


app.use('/tasks', tasksRouter);


app.get('/insights', async (req, res) => {
    try {
        const insights = getInsights();
        res.json(insights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to compute insights' });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));