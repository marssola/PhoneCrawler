import { readFile, WorkBook, WorkSheet } from 'xlsx';
import XLSX from 'xlsx';
import { existsSync, mkdirSync } from 'fs';
import slugify from 'slugify';

const outputPath = './output';

export interface ContentRow {
    t: string,
    v: string
}

export interface WorkBookRow {
    name: string,
    address: string,
    phone: string
}

interface ObjectContentRow {
    address: string,
    number: string,
    until?: string,
    condominium?: string
}

export interface WorkSheetList {
    'Endereço': string,
    'Número': string,
    'Até'?: string,
    'Cidade': string,
    'Condominio'?: string,
    'Status'?: string
}

export function readXLSX (filename: string): WorkBook {
    return readFile(filename);
}

export function getWorkSheetJSON(worksheet: WorkSheet): Array<WorkSheetList> {
    return XLSX.utils.sheet_to_json(worksheet);
}

export function getFirstSheetName (workbook: WorkBook): string {
    const [sheetname] = workbook.SheetNames;
    return sheetname;
}

export function getLastRow (sheet: WorkSheet) {
    const range = sheet['!ref'];
    let [, second] = range?.split(':') || [];
    if (second) {
        const last = parseInt(second.replace(/\D/g, ''))
        return last;
    }
    return 0;
}

export function getContentRow (worksheet: WorkSheet, row: number, columns: Array<string>): Array<ContentRow> {
    const rows: Array<ContentRow> = [];
    for (let column of columns) {
        rows.push(worksheet[`${column}${row}`]);
    }
    return rows;
}

function maxLength (arrayStr: Array<string>): number {
    return Math.max(...arrayStr.map(str => str.length));
}

export function createWorkbook (data: Array<WorkBookRow>): WorkBook {
    const workbook: WorkBook = XLSX.utils.book_new();
    const sheetname = 'Telefones';
    workbook.SheetNames.push(sheetname);

    const sheet = [
        ['Nome', 'Endereço', 'Telefone']
    ];
    for (const { name, address, phone } of data) {
        sheet.push([name, address, phone]);
    }
    const worksheet: WorkSheet = XLSX.utils.aoa_to_sheet(sheet);
    worksheet['!cols'] = [
        { wch: maxLength(data.map(item => item.name)) },
        { wch: maxLength(data.map(item => item.address)) },
        { wch: maxLength(data.map(item => item.phone)) },
    ];

    workbook.Sheets[sheetname] = worksheet
    return workbook;
}

export function createXLSX (filename: string, workbook: WorkBook) {
    if (!existsSync(outputPath))
        mkdirSync(outputPath);
    const pathname = `${outputPath}/${filename}.xlsx`;
    XLSX.writeFile(workbook, pathname);
}

export function createFileName(obj: ObjectContentRow): string {
    const { address, number, until, condominium } = obj;
    return slugify(`${address}, ${number}${until ? ` - ${until}` : ''}${condominium ? ` (${condominium})`: ''}`);
}

export function saveSheetJSON (sheetJSON: Array<WorkSheetList>, filename: string) {
    const sheet: Array<any> = [
        ['Endereço', 'Número', 'Até', 'Cidade', 'Condominio', 'Status']
    ];

    for (const row of sheetJSON) {
        const { Endereço, Número, Até, Cidade, Condominio, Status } = row;
        sheet.push([Endereço, Número, Até || '', Cidade, Condominio || '', Status || '']);
    }

    const worksheet: WorkSheet = XLSX.utils.aoa_to_sheet(sheet);
    worksheet['!cols'] = [
        { wch: maxLength(sheet.map(item => String(item[0]))) },
        { wch: maxLength(sheet.map(item => String(item[1]))) },
        { wch: maxLength(sheet.map(item => String(item[2]))) },
        { wch: maxLength(sheet.map(item => String(item[3]))) },
        { wch: maxLength(sheet.map(item => String(item[4]))) },
        { wch: maxLength(sheet.map(item => String(item[5]))) },
    ];
    const workbook: WorkBook = XLSX.utils.book_new();
    workbook.SheetNames.push('Lista');
    workbook.Sheets['Lista'] = worksheet;

    XLSX.writeFile(workbook, filename);
}
