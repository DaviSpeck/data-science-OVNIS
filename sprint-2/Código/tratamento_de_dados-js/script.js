const fs = require('fs');
const csvParser = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv')

async function toCsv(lista, nomeArquivo = 'resultado') {
	const csv = new ObjectsToCsv(lista);
	await csv.toDisk(`./${nomeArquivo}.csv`)
}

function thereIs(lista, elemento) {
	for (let i = 0; i < lista.length; i++) {
		if (lista[i] === elemento) {
			return true;
		}
	}	
	return false;
}

function filtraDadosOvnis(lista, resultadoOcorrenciasTodasFormas) {
	let resultado = [];
	for (let i = 0; i < lista.length; i++) {

		delete lista[i].Duration; delete lista[i].Summary; delete lista[i].Posted; delete lista[i].Images;

		let formaInvalida = false;
		for (let j = 0; j < resultadoOcorrenciasTodasFormas.length; j++) {
			if (lista[i].Shape === resultadoOcorrenciasTodasFormas[j].forma && resultadoOcorrenciasTodasFormas[j].ocorrencias <= 1000) {
				formaInvalida = true;
			}
		}

		if (!formaInvalida && lista[i].Country === 'USA') {
			if (!(lista[i].City === 'None' || lista[i].City === 'Unknown' || lista[i].City === '')) {
				if (!(lista[i].State === 'None' || lista[i].State === 'Unknown' || lista[i].State === '')) {
					if (!(lista[i].Shape === 'None' || lista[i].Shape === 'Unknown' || lista[i].Shape === '')) {
						resultado.push(lista[i]);
					}				
				}			
			}
		}
	}

	return resultado;
}

function distingueEstados(lista) {
	let estadosDistinguidos = [];
	for (let i = 0; i < lista.length; i++) {
		if (!thereIs(estadosDistinguidos, lista[i].State)) {
			estadosDistinguidos.push(lista[i].State);
		}
	}

	return estadosDistinguidos;
}

function distingueCidades(lista, pais = 'USA') {
	let cidadesDistinguidas = [];
	for (let i = 0; i < lista.length; i++) {
		if (lista[i].Country === pais && !thereIs(cidadesDistinguidas, lista[i].City)) {
			cidadesDistinguidas.push(lista[i].City);
		}
	}

	return cidadesDistinguidas;
}

function distingueFormas(lista) {
	let formasDistinguidas = [];
	for (let i = 0; i < lista.length; i++) {
		if (!thereIs(formasDistinguidas, lista[i].Shape)) {
			formasDistinguidas.push(lista[i].Shape);
		}
	}

	return formasDistinguidas;
}

function quantidadeOcorrenciasEstado(lista, estado) {
	let total = 0;
	for (let i = 0; i < lista.length; i++) {
		if (lista[i].State === estado) {
			total++;
		}
	}

	return total;
}

function quantidadeOcorrenciasCidade(lista, cidade) {
	let total = 0;
	for (let i = 0; i < lista.length; i++) {
		if (lista[i].City === cidade) {
			total++;
		}
	}

	return total;
}

function quantidadeOcorrenciasForma(lista, forma) {
	let total = 0;
	for (let i = 0; i < lista.length; i++) {
		if (lista[i].Shape === forma) {
			total++;
		}
	}

	return total;
}

function quantidadeFormaPorEstado(lista, estado, forma) {
	let total = 0;
	for (let i = 0; i < lista.length; i++) {
		if (lista[i].State === estado && lista[i].Shape === forma) {
			total++;
		}
	}

	return total;
}



function formasUmEstado(lista, estado, formasDistinguidas) {
	let obj = {};
	obj['estado'] = estado;
	for (let i = 0; i < formasDistinguidas.length; i++) {
		obj[formasDistinguidas[i]] = quantidadeFormaPorEstado(lista, estado, formasDistinguidas[i]);
	}

	return obj;
}

function formasEstados(lista, estadosDistinguidos, formasDistinguidas) {
	let resultado = [];
	for (let i = 0; i < estadosDistinguidos.length; i++) {
		resultado.push(formasUmEstado(lista, estadosDistinguidos[i], formasDistinguidas));
	}

	return resultado;
}

function ocorrenciasTodosEstados(estadosDistinguidos, lista) {
	let resultado = [];
	for (let i = 0; i < estadosDistinguidos.length; i++) {
		resultado.push({
			estado: estadosDistinguidos[i],
			ocorrencias: quantidadeOcorrenciasEstado(lista, estadosDistinguidos[i])
		});
	}	

	return resultado;
}

function ocorrenciasTodasCidades(cidadesDistinguidas, lista) {
	let resultado = [];
	for (let i = 0; i < cidadesDistinguidas.length; i++) {
		resultado.push({
			cidade: cidadesDistinguidas[i],
			ocorrencias: quantidadeOcorrenciasCidade(lista, cidadesDistinguidas[i])
		});
	}	

	return resultado;
}

function ocorrenciasTodasFormas(formasDistinguidas, lista) {
	let resultado = [];
	for (let i = 0; i < formasDistinguidas.length; i++) {
		resultado.push({
			forma: formasDistinguidas[i],
			ocorrencias: quantidadeOcorrenciasForma(lista, formasDistinguidas[i])
		});
	}	

	return resultado;
}

let resultado = [];

fs.createReadStream('todos_ovnis.csv')
.pipe(csvParser())
.on('data', (data) => resultado.push(data))
.on('end', () => {
	// coloca os nomes das formas em letras minúsculas, para não haver problemas de distinção
	for (let i = 0; i < resultado.length; i++) {
		resultado[i].Shape = resultado[i].Shape.toLowerCase();
	}

	let estadosDistinguidos = distingueEstados(resultado);
	let cidadesDistinguidas = distingueCidades(resultado);
	let formasDistinguidas = distingueFormas(resultado);

	let resultadoOcorrenciasTodosEstados = ocorrenciasTodosEstados(estadosDistinguidos, resultado);
	let resultadoOcorrenciasTodasCidadesUSA = ocorrenciasTodasCidades(cidadesDistinguidas, resultado);
	let resultadoOcorrenciasTodasFormas = ocorrenciasTodasFormas(formasDistinguidas, resultado);

	resultadoOcorrenciasTodosEstados.sort((a, b) => {
	    return a.ocorrencias - b.ocorrencias;
	}).reverse();

	resultadoOcorrenciasTodasCidadesUSA.sort((a, b) => {
	    return a.ocorrencias - b.ocorrencias;
	}).reverse();

	resultadoOcorrenciasTodasFormas.sort((a, b) => {
	    return a.ocorrencias - b.ocorrencias;
	}).reverse();
	
	// toCsv(filtraDadosOvnis(resultado, resultadoOcorrenciasTodasFormas), 'OVNI_limpo');

	// console.log(resultadoOcorrenciasTodasCidadesUSA);

	// toCsv(resultadoOcorrenciasTodasCidadesUSA, 'resultadoOcorrenciasTodasCidades');

	// toCsv(resultadoOcorrenciasTodosEstados, 'resultadoOcorrenciasTodosEstados');
	// toCsv(resultadoOcorrenciasTodasFormas, 'resultadoOcorrenciasTodasFormas');

	// console.log(resultadoOcorrenciasTodasFormas);
	// console.log(resultadoOcorrenciasTodosEstados);
	let resultadoFormasEstados = formasEstados(resultado, estadosDistinguidos, formasDistinguidas);
	let estadosMaioresQuantidades = [];
	for (let i = 0; i < resultadoFormasEstados.length; i++) {
		switch(resultadoFormasEstados[i].estado) {
			case 'CA':
			case 'WA':
			case 'FL':
			case 'TX':
				estadosMaioresQuantidades.push(resultadoFormasEstados[i]);
				break;
		}
	}

	console.log(estadosMaioresQuantidades);
});




