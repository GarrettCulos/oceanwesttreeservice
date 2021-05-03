import { promises as fsPromises } from 'fs';

export async function createCsv(outputFileName: string, header: string[], body: string[][]) {
  const bodyStrings: string[] = [];
  const acceptRows = body.every((row) => {
    bodyStrings.push(row.join(';'));
    return row.length === header.length;
  });
  if (!acceptRows) {
    throw new Error(
      'Unable to create csv file because there is a row that does not have the correct amount of columns.'
    );
  }
  try {
    const headerString = header.join(';') + '\n';
    const bodyString = bodyStrings.join('\n') + '\n';
    const fullString = headerString + bodyString;
    await fsPromises.writeFile(outputFileName, fullString);
  } catch (err) {
    throw new Error(err);
  }
}
