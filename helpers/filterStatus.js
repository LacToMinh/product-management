module.exports = (query) => {
  let filterStatus = [
    {
      name: "Tất cả",
      status: "",
      class: "",
      type: "warning",
    },
    {
      name: "Hoạt động",
      status: "active",
      class: "",
      type: "success",
    },
    {
      name: "Dừng hoạt động",
      status: "inactive",
      class: "",
      type: "danger",
    },
  ];

  if (query.status) {
    const index = filterStatus.findIndex((item) => item.status == query.status);
    filterStatus[index].class = "active";
  } else {
    const index = filterStatus.findIndex((item) => item.status == "");
    filterStatus[index].class = "active";
  }

  return filterStatus;
};
