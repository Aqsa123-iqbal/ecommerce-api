/**
 * Module 3: Over-fetching fix.
 * Given a resource object/array and a comma-separated `fields` query string,
 * returns only the requested fields. If no `fields` param is given,
 * returns the object/array untouched.
 *
 * Example: ?fields=title,price  ->  { title: "...", price: 4999 }
 */
function selectFields(data, fieldsParam) {
  if (!fieldsParam) return data;

  const allowed = fieldsParam
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const pick = (obj) => {
    const result = {};
    allowed.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(obj, field)) {
        result[field] = obj[field];
      }
    });
    return result;
  };

  return Array.isArray(data) ? data.map(pick) : pick(data);
}

module.exports = selectFields;
