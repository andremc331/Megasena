import fs from 'fs';
import csv from 'csv-parser';
import { Mega } from './models/Mega';

// Função para carregar os dados do arquivo CSV
const carregarDadosCSV = (): Promise<Mega[]> => {
  return new Promise((resolve, reject) => {
    const dados: Mega[] = [];

    fs.createReadStream('Megasena.csv')
      .pipe(csv({separator: ';'}))
      .on('data', (row: Record<string, string>) => {
        // Parseando os dados de cada linha
        const concurso = parseInt(row['Concurso']);
        const data = row['Data'];
        const dezenas = [
          parseInt(row['1ª']),
          parseInt(row['2ª']),
          parseInt(row['3ª']),
          parseInt(row['4ª']),
          parseInt(row['5ª']),
          parseInt(row['6ª']),
        ];
        const ganhadores = parseInt(row['Ganhadores']);
        const premio = parseFloat(row['Prêmio']);
        const apostas = parseInt(row['Apostas']);

        // Criando um objeto Mega
        const mega = new Mega(concurso, data, dezenas, ganhadores, premio, apostas);
        dados.push(mega);
      })
      .on('end', () => {
        resolve(dados);
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });
};

// 6 dezenas mais sorteadas
const getTopDezenas = (dados: Mega[]): [number, number][] => {
  const contadorDezenas: Record<number, number> = {};

  // Contar quantas vezes cada dezena foi sorteada
  dados.forEach((concurso) => {
    concurso.dezenas.forEach((dezena) => {
      contadorDezenas[dezena] = (contadorDezenas[dezena] || 0) + 1;
    });
  });

  // Ordenar por frequência e selecionar as 6 mais sorteadas
  const dezenasOrdenadas = Object.entries(contadorDezenas)
    .map(([dezena, count]) => {
      const dezenaNumero = parseInt(dezena); // Converter a chave (dezena) para número
      if (!isNaN(dezenaNumero)) {
        return [dezenaNumero, count] as [number, number]; // Garantir que o tipo seja [number, number]
      }
      return null; // Se a conversão falhar, retorna null
    })
    .filter((item): item is [number, number] => item !== null) // Remover valores nulos e garantir que o tipo seja [number, number]
    .sort((a, b) => b[1] - a[1]);

  return dezenasOrdenadas.slice(0, 6); // Retorna as 6 mais sorteadas
};

// total de premios
const totalPremiosAno = (dados: Mega[]): Record<number, number> => {
  const premiosPorAno: Record<number, number> = {};

  dados.forEach((concurso) => {
    const ano = new Date(concurso.data).getFullYear();
    premiosPorAno[ano] = (premiosPorAno[ano] || 0) + concurso.premio;
  });

  return premiosPorAno;
};

// quantidade total de ganhadores
const ganhadoresSenaEValor = (dados: Mega[]): { ganhadores: number, valorTotal: number } => {
  let totalGanhadores = 0;
  let totalValor = 0;

  dados.forEach((concurso) => {
    if (concurso.ganhadores > 0) {
      totalGanhadores += concurso.ganhadores;
      totalValor += concurso.premio;
    }
  });

  return { ganhadores: totalGanhadores, valorTotal: totalValor };
};

// maiores premios
const topPremios = (dados: Mega[]): { premio: number, ganhadores: number, valorPorGanhador: number }[] => {
  const top3Premios = dados
    .sort((a, b) => b.premio - a.premio)
    .slice(0, 3)
    .map((concurso) => {
      const valorPorGanhador = concurso.premio / concurso.ganhadores;
      return { premio: concurso.premio, ganhadores: concurso.ganhadores, valorPorGanhador };
    });

  return top3Premios;
};

// ano com maior numero de apostas
const anoMaiorApostas = (dados: Mega[]): number => {
  const apostasPorAno: Record<number, number> = {};

  dados.forEach((concurso) => {
    const ano = new Date(concurso.data).getFullYear();
    apostasPorAno[ano] = (apostasPorAno[ano] || 0) + concurso.apostas;
  });

  const anoComMaiorAposta = Object.entries(apostasPorAno)
    .sort((a, b) => b[1] - a[1])[0][0];

  return parseInt(anoComMaiorAposta);
};

const main = async () => {
  const dados = await carregarDadosCSV();

  // Exercícios
  console.log('Top 6 Dezenas:', getTopDezenas(dados));
  console.log('Total de Prêmios por Ano:', totalPremiosAno(dados));
  console.log('Ganhadores da Sena e Total de Prêmios:', ganhadoresSenaEValor(dados));
  console.log('Top 3 Maiores Prêmios:', topPremios(dados));
  console.log('Ano com Maior Número de Apostas:', anoMaiorApostas(dados));
};

main();