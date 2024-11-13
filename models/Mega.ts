export class Mega{
    concurso: number;
    data: string;
    dezenas: number[];
    ganhadores: number;
    premio: number;
    apostas: number;

    constructor (
        concurso: number,
        data: string,
        dezenas: number[],
        ganhadores: number,
        premio: number,
        apostas: number,
    )   {
        this.concurso = concurso;
        this.data = data;
        this.dezenas = dezenas;
        this.ganhadores = ganhadores;
        this.premio = premio;
        this.apostas = apostas;
    }
}