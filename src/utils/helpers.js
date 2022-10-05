const networkInterfaces = require('os').networkInterfaces();
const fs = require('fs');
const QRCode = require('qrcode');
const PdfPrinter = require('pdfmake');
const { v4:uuidv4 } = require('uuid');

const ip = Object.values(networkInterfaces).flat().find(i => i.family == 'IPv4' && !i.internal).address;

const addMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes*60000);
};

const generateQR = async text => {
  const dir = `./uploads/qrcodes/${text.userId}`
  const uuid = uuidv4();
  let dataUrlQr = '';
  try {
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
    await QRCode.toFile(`${dir}/qrEntry-${new Date().valueOf()}.png`, JSON.stringify(text), {type: 'terminal'})
    dataUrlQr = await QRCode.toDataURL(uuid, JSON.stringify(text), {type: 'terminal'});
    console.log('uuidv4', uuid)
    console.log('text', text)
  } catch (err) {
    console.error(err)
  }

  return {
    dir: dir+`/qrEntry-${new Date().valueOf()}.png`,
    uuid: uuid,
    dataUrl: dataUrlQr
  }
}

const generatePdf = async (lists, count, title, type, code, date) => {
  let pdfGenerate = new Promise((resolve, reject) => {
    const fonts = {
      Roboto: {
        normal: 'src/assets/fonts/Roboto-Regular.ttf',
        bold: 'src/assets/fonts/Roboto-Medium.ttf',
        italics: 'src/assets/fonts/Roboto-Italic.ttf',
        bolditalics: 'src/assets/fonts/Roboto-MediumItalic.ttf'
      }
    };
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [ 40, 100, 10, 40 ],
  
      header: {
        margin: 20,
        columns: [
          {
            image: 'src/assets/images/timing_logo.png',
            width: 100, height: 60,
            // alignment: 'right'
          },
          { text: `${(title).toUpperCase()}\n${date}\n${code}\n${(type).toUpperCase()} LIST\n${(type).toUpperCase()}: ${count}`, alignment: 'center', fontSize: 10, bold: true },
          {
            image: 'src/assets/images/eiev_logo.png',
            width: 80, height: 60,
            // alignment: 'right'
          },
        ]
      },
      
      content: [
        {
          table: {
            widths: [30, 60, 170, 170, '*', 230],
            headerRows: 1,
            height: 5,
            dontBreakRows: true,
            body: [
                [...Object.keys(lists[0]).map((e,v)=>{return {text: e.toString(), style:'tableHeader', alignment:'center', decoration: 'underline'}})],
                ...lists.map((list)=>{
                    return [...Object.keys(list).map((key, val) => {
                      // console.log('eeeee', key)
                      // console.log('vvvvv', val)
                      // console.log('list', list)
                      if (key === 'HORSE' || key === 'RIDER') {
                        let fText = [];
                        let str = list[key].split('\n');
                        str.map((s, i) => {
                          if (i === 0) {
                            fText.push({text: `${s}\n`, style:'tableContentBold', })
                          } else {
                            fText.push({text: s, style:'tableContent',  })
                          }
                        })
                        return {
                          text: fText, 
                        }
                      }
  
                      return {
                        text: list[key].toString(), style: 'tableContent', 
                      }
                    })];
                }),
            ]
          }}
        ],
  
  
        footer: {
          margin: 20,
          columns: [
            { text: `Copyright © 2000 - 2022 Emirates International Endurance Village. All Rights Reserved.`, alignment: 'center', fontSize: 8 },
          ]
        },
        styles: {
          tableHeader: {
            fontSize: 9,
            bold: true
          },
          tableContentBold: {
            fontSize: 9,
            bold: true,
            alignment: 'center'
          },
          tableContent: {
            fontSize: 9,
            alignment: 'center'
          }
        },
        // pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        //   //Here you can change the criteria according to your requirements
        //   if (currentNode.index % 7 === 0) {
        //     return true;
        //   }
       
        //   return false;
        // },
    };
    let printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    let writeStream = fs.createWriteStream(`uploads/pdfs/${type}.pdf`);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
    writeStream.on('finish', () => {
      console.timeEnd('creating pdf');
      resolve(`uploads/pdfs/${type}.pdf`);
    });
  });
  
  console.log(await pdfGenerate)
  return pdfGenerate;
}

const generateXls = async (lists) => {
}

module.exports = { ip, addMinutesToDate, generateQR, generatePdf }