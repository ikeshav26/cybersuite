import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());


app.get('/health', (req, res) => {
	res.send('Health is ok');
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
	console.log(`api-gateway listening on port ${port}`);
});

export default app;
