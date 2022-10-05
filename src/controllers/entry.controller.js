const entry = require("../services/entry.services");
const ticket = require('../services/ticket.services');
const { Parser } = require('json2csv');
const createError = require("http-errors");
const { ip, generateQR, generatePdf } = require("../utils/helpers");
const excel = require("exceljs");
const path = require('path');

class entryController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }

      const response = await entry.create(data);

      res.status(200).json({
        status: true,
        message: "Entry Created successfully",
      });
    } catch (err) {
      console.log("error1", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static list = async (req, res, next) => {
    try {
      // console.log("req.query", req);
      const params = req.query;
      const { data, count } = await entry.fetchAll(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all entries",
        data,
        count,
      });
    } catch (err) {
        res.status(404).json({
            error: true,
            message: err.message,
        });
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await entry.getEntryDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch Entry",
        data,
      });
    } catch (err) {
      console.log("error", err)
      next(createError(err.statusCode, err.message));
    }
  };

  static manage = async (req, res, next) => {
    try {
      console.log("req.query", req.query);
      const params = req.query;
      const data = await entry.fetchManageEntries(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all entries",
        data,
      });
    } catch (err) {
        res.status(404).json({
            error: true,
            message: err.message,
        });
    }
  };

  static update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      let { data } = req.body;
      data = JSON.parse(data);

      const detail = await event.updateEvent(id, data);
      res.status(200).json({
        status: true,
        message: "Event updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("err", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const status = req.body.status;
      const raceId = req.body.raceId;
      console.log('start')
      const params = {
        status,
        raceId
      }

      const data = await entry.updateStatus(parseInt(id), params);


    generateQR(data)
// QRCode.toDataURL([data], function (err, url) {
//   if (err) throw err;
//   console.log(url)
// })
      // // console.log('entry approved', data)
      // // const detail = await ticket.create(data);
      res.status(200).json({
        status: true,
        message: "entry status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };

  /**
   * UPDATE ENTRY LIST SEQUENCE
   */
  static updateList = async (req, res, next) => {
    try {
      const { id } = req.params;
      const entries = req.body.entries;
      console.log(req.body.entries)

      const data = await entry.updateEntryList(parseInt(id), entries);

      // // // console.log('entry approved', data)
      // // // const detail = await ticket.create(data);
      res.status(200).json({
        status: true,
        message: "entry status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };

  /**
   * EXPORT ENTRIES PDF
   */
  static exportPdf = async (req, res, next) => {
    try {
      const { id, type } = req.params;
      // const fields = ["user", "horse", "rider"]

      const { lists, count, title, code, date } = await entry.fetchPdfList(id, type);
      // let exportList = {};
      console.log('raceTitle', title)
      
      const pdfList = await generatePdf(lists, count, title, type, code, date);
      console.log('pdfList', pdfList)
      // console.log('asdasdasd', docDefinition)
      
      // const json2csv = new Parser({ fields: fields });
      // const csv = json2csv.parse(exportList);
      // const filename = ['Entries-', Date.now()].join('');
      
      // res.set('Content-Disposition', ["attachment; filename=", filename, '.csv'].join(''))
      // console.log(path.resolve('uploads/pdfs/tables.pdf'))
      res.set("Content-Type", "application/pdf");
      // console.log(`localhost:7331/${path.resolve(pdfList)}`)
      res.status(200).download(path.resolve(pdfList));
    } catch (error) {
      console.log(error)
    }
  };

  /**
   * EXPORT ENTRIES PDF
   */
  static exportExcel = async (req, res, next) => {
    try {
      const { id, type } = req.params;
      const { lists } = await entry.fetchXlsList(id, type);
      // const xlsList = await generateXls(lists);
console.log('lists', lists)
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet('sample');
      worksheet.columns = [
        { header: 'SERIES', key: 'series', width: 10 },
        { header: 'STATUS', key: 'status', width: 10 },
        { header: 'HORSE', key: 'horse', width: 32 },
        { header: 'RIDER', key: 'rider', width: 32 },
        { header: 'STABLE', key: 'stable', width: 32 },
        { header: 'HORSE FEI EEF', key: 'eefFeiHorse', width: 32 },
        { header: 'RIDER FEI EEF', key: 'eefFeiRider', width: 32 },
        { header: 'TRAINER', key: 'trainer', width: 32 },
      ];
      lists.forEach((list) => {
        worksheet.addRow(list);
      })
      // worksheet.addRows(lists);
      // worksheet.commit();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "sample.xlsx"
      );
      
      // console.log(await workbook.xlsx.write(res))
      await workbook.xlsx.write(res).then((data) => {
        res.end();
        console.log('adadada', data)
      })

      // res.status(201).download(lists);
    } catch (error) {
      console.log(error)
    }

  };

  static showRaceEntriesOnKiosk = async (req, res, next) => {
    try {
      const { raceId } = req.params;
      console.log('raceda', raceId)
      const data = await entry.getEntriesByRaceId(parseInt(raceId));
      res.status(200).json({
        status: "Ok",
        message: "Fetch Entries",
        data,
      });
    } catch (error) {
      
    }
  };

  static sendOtp = async (req, res, next) => {
    try {
      const { entryId } = req.params;
      console.log(req.params);
      const data = await entry.saveOtp(parseInt(entryId));
      // TODO: setup queue job for sending otp for mobile user
      res.status(200).json({
        status: "Ok",
        message: "OTP sent",
        data: {
          otp: data.otp
        }
      });
    } catch (error) {
      console.log(error)
    }
  };

  static verifyOtp = async (req, res, next) => {
    try {
      const { otp } = req.params;
      console.log('otp', otp)
      const data = await entry.verifyEntryOtp(otp);
      
    } catch (error) {
      console.log(error)
    }
  };
}

module.exports = entryController;
