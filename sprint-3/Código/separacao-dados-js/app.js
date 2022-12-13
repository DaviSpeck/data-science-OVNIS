const fs = require('fs');
const csvParser = require('csv-parser');
const express = require('express');
const ejs = require('ejs');
const cors = require('cors');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));
app.listen(3000, () => {
	console.log('Servidor iniciado na porta 3000.')
});

let resultado = [];

app.get('/', (req, res) => {
	res.render('index', { title: 'Index' });
});


app.get('/dados', (req, res) => {
	fs.createReadStream('resultado-busca-phoenix.csv')
	.pipe(csvParser())
	.on('data', (data) => resultado.push(data))
	.on('end', async () => {
		res.json({ resultado });
	});
});

