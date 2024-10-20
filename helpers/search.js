module.exports = (query) => {
  let objectSearch = {
    keyword: "",
  };

  if (query.keyword) {
    objectSearch.keyword = query.keyword.trim().replace(/\s+/g, " "); // Loại bỏ khoảng trắng ở đầu, cuối và chỉ giữ lại 1 khoảng trắng giữa các từ
    const regex = new RegExp(objectSearch.keyword, "i");
    objectSearch.regex = regex;
  }

  return objectSearch;
};
