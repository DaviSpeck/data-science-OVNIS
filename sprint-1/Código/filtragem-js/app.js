const fs = require('fs');
const csvParser = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv');

async function toCsv(lista, nomeArquivo = 'resultado') {
  const csv = new ObjectsToCsv(lista);
  await csv.toDisk(`./${nomeArquivo}.csv`)
}

function verificaData(data) {
  data = data.split('/'); data[0] = parseInt(data[0]); data[1] = parseInt(data[1]);

  if (data[1] >= 1997 && data[1] <= 2017) {
    if (data[1] === 1997) {
      if (data[0] >= 9) {
        return true;
      }
    } else if (data[1] === 2017) {
      if (data[0] <= 8) {
        return true;
      }
    } else {
      return true;
    }
  }
}

let resultado = []; let filtrados = [];

fs.createReadStream('OVNIS.csv')
.pipe(csvParser())
.on('data', (data) => resultado.push(data))
.on('end', async () => {

  for (let i = 0; i < resultado.length; i++) {
    if (verificaData(resultado[i].Data)) {
      filtrados.push(resultado[i]);
    }
  }


  toCsv(filtrados, 'dados-filtrados');
});