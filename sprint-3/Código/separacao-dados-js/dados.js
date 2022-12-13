const fs = require('fs');
const mongoose = require('mongoose');
const csvParser = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv');
const Registro = require('./models/Registro');

// conexão com o banco de dados (aOnd3yVydERDHZLu)
const dbURICloud = "mongodb+srv://IFBOvnisPraticaIntegrada:aOnd3yVydERDHZLu@ovnis.rw2p3.mongodb.net/?retryWrites=true&w=majority";

const dbURILocal = "mongodb://localhost/registrosOvnis";

mongoose.connect(dbURILocal, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => { console.log('Conexão estabelecida com o banco de dados.'); })
  .catch((err) => console.log(err));

let resultado = [];


async function toCsv(lista, nomeArquivo = 'resultado') {
  const csv = new ObjectsToCsv(lista);
  await csv.toDisk(`./${nomeArquivo}.csv`)
}

// ********************************
// RODAR O CÓDIGO ABAIXO SÓ UMA VEZ, POIS ELE UPA OS DADOS NO ATLAS:
// ********************************

function getDiaSemana(d, m, a) {
    // função que calcula o dia da semana de acordo com uma data informada
    if (a > 90) {
      a += 1900;
    } else {
      a += 2000;
    }

    let t = [ 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4 ];
    a -= (m < 3) ? 1 : 0;
    
    return parseInt(( a + a / 4 - a / 100 + a / 400 + t[m - 1] + d) % 7);
}
 

// fs.createReadStream('OVNI_limpo.csv')
// .pipe(csvParser())
// .on('data', (data) => resultado.push(data))
// .on('end', async () => {

//   console.log('Processo iniciado com sucesso. Aguarde . . .');
  
//   for (let i = 0; i < resultado.length; i++) {
//     let data = resultado[i]['Date / Time'].split(' ')[0];
//     let dia = data.split('/')[1];
//     let mes = data.split('/')[0];
//     let ano = data.split('/')[2];

//     if (parseInt(ano) < 90) {
//       ano = `20${ano}`;
//     } else {
//       ano = `19${ano}`;
//     }

//     let diaSemana = getDiaSemana(parseInt(dia), parseInt(mes), parseInt(ano));
//     let hora = resultado[i]['Date / Time'].split(' ')[1] || '';

//     const registro = await Registro.create({ date: `${ano}-${mes}-${dia}`, day: parseInt(dia), month: parseInt(mes), year: parseInt(ano), weekday: parseInt(diaSemana), time: hora, city: resultado[i]['City'], state: resultado[i]['State'], country: resultado[i]['Country'], shape: resultado[i]['Shape'] });
//   }

//   console.log('Registro feito com sucesso.');

// });

// ********************************
// BUSCA DB:
// ********************************

async function buscasMongodb() {
  let busca = await Registro.aggregate([
                        { $match: {city: "Phoenix"}},
                        { $group: {_id:"$date", count: {$sum: 1}} },
                        { $sort : {_id : 1} }
                    ]);
  console.log(busca);

  toCsv(busca, 'resultado-busca-phoenix');

}

buscasMongodb();