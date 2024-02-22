const db = require("../models");
const Transaksi = db.transaksi;
const Op = db.Sequelize.Op;
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const bufferPlugin = require("buffer-serializer");
const multer = require('multer');

exports.create = async (req, res) => {
  try {
    const file = req.files;

      // Ambil nama file dan buat URL gambar
      const ktpNameSatu = `${file.filename}`;
      const ktpNameDua = `${file.filename}`;
      const NpwpNameSatu = `${file.filename}`;
      const NpwpNameDua = `${file.filename}`;
      // const npwpName = files.find(file => files.fieldname == 'npwp').filename;

      const ktpImageUrl = `${req.protocol}://${req.get('host')}/transaksi/${ktpNameSatu}`;
      const npwpImageUrl = `${req.protocol}://${req.get('host')}/transaksi/${npwpName}`;

      const transaksi = {
        id_transaksi: req.body.id_transaksi,
        ktp: ktpName,
        npwp: npwpName,
        url_ktp: ktpImageUrl,
        url_npwp: npwpImageUrl,
        phone: req.body.phone,
        domisili: req.body.domisili,
        status_transaksi: 1,
      };
      // Respon sukses jika semuanya berhasil
    const newTransaksi = await Transaksi.create(transaksi);
    res.status(201).send(newTransaksi); // Atau respons yang diinginkan
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}


  const transaksiSerializer = new JSONAPISerializer('transaksi', {
    attributes: ['id_transaksi', 'ktp_satu', 'ktp_dua', 'npwp_satu', 'npwp_dua', 'url_ktp_satu', 'url_ktp_dua', 'url_npwp_satu', 'url_npwp_dua', 'phone', 'domisili'],
    keyForAttribute: 'camelCase',

  });

// Retrieve all transaksis from the database.
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const keyword = req.query.keyword || '';

    // pencarian
    const searchQuery = {
      where: {
        [Op.or]: [
          { phone: { [Op.like]: `%${keyword}%` } },
          { domisili: { [Op.like]: `%${keyword}%` } },
        ]
      },
      limit: pageSize,
      offset: offset
    };

    // Mengambil data transaksi dengan pagination dan pencarian menggunakan Sequelize
    const transaksis = await Transaksi.findAll(searchQuery);
    const totalCount = await Transaksi.count(searchQuery);

    const totalPages = Math.ceil(totalCount / pageSize);
    const transaksi = transaksiSerializer.serialize(transaksis);

    res.send({
      data: transaksi,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error retrieving transaksis.' });
  }
};


// Find a single admin with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Transaksi.findByPk(id)
    .then(data => {
      if (data) {
        const serializedData = transaksiSerializer.serialize(data);
        res.send(serializedData);
      } else {
        res.status(404).send({
          message: `Cannot find transaksi with id=${id}.`
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        message: "Error retrieving transaksi with id=" + id
      });
    });
};

// Update a transaksi by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Transaksi.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "transaksi was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update transaksi with id=${id}. Maybe transaksi was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating transaksi with id=" + id
        });
      });
  };

// Delete a transaksi with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Transaksi.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "transaksi was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete transaksi with id=${id}. Maybe transaksi was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete transaksi with id=" + id
        });
      });
  };

// Delete all transaksis from the database.
exports.deleteAll = (req, res) => {
    Transaksi.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} transaksis were deleted successfully!` });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all transaksis."
        });
      });
  };

// Find all filter transaksis (phone)
// exports.findAllPublished = (req, res) => {
//     transaksi.findAll({ where: { phone: true } })
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while retrieving transaksis."
//         });
//       });
//   };