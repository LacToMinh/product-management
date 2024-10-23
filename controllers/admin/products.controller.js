const Products = require("../../models/products.model");
const systemConfig = require("../../config/system.js");
const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search.js");
const paginationHelpers = require("../../helpers/pagination.js");
const moment = require("moment-timezone");

// [GET] /admin/products
module.exports.index = async (req, res) => {
  // Filter
  const filterStatus = filterStatusHelpers(req.query);

  let find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  // Keyword Search
  const objectSearch = searchHelpers(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // Pagination
  const countProducts = await Products.countDocuments(find);

  let objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );

  // End Pagination

  // Sort
  let sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "asc";
  }
  // End Sort

  const products = await Products.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  // console.log(products);

  // VIEW Client
  res.render("admin/pages/products/index", {
    message: req.flash() || {},
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Products.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái thành công!");

  res.redirect("back");
};

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format(); // Lấy thời gian Việt Nam

  switch (type) {
    case "active":
      await Products.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash(
        "success",
        `${ids.length} sản phẩm đã cập nhật trạng thái thành công! `
      );
      break;
    case "inactive":
      await Products.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      req.flash(
        "success",
        `${ids.length} sản phẩm đã cập nhật trạng thái thành công! `
      );
      break;
    case "delete-all":
      await Products.updateMany(
        { _id: { $in: ids } },
        { deleted: true, deletedAt: vietnamTime }
      );
      req.flash("success", `${ids.length} đã xóa thành công! `);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Products.updateOne(
          { _id: id },
          {
            position: position,
          }
        );
        req.flash("success", `${ids.length} đã đổi vị trí thành công! `);
      }
      break;
    default:
      break;
  }

  res.redirect("back");
};

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format(); // Lấy thời gian Việt Nam

  // await Products.deleteOne({ _id: id });
  await Products.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedAt: vietnamTime,
    }
  );
  req.flash("success", "Đã xóa thành công sản phẩm");
  res.redirect("back");
};

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
  });
};

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position == "") {
    const countProducts = await Products.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  const product = new Products(req.body);
  await product.save();

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Products.findOne(find);

    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;

  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = parseInt(req.body.position);

  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  try {
    await Products.updateOne({ _id: id }, req.body);
    // req.flash("success", `Cập nhật sản phẩm thành công!`)
  } catch (error) {}

  res.redirect("back");
};

// [GET] /detail/products/edit/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Products.findOne(find);

    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
