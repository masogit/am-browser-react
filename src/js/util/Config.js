export const HOST_NAME_DEV = 'http://localhost:8080';
export const HOST_NAME = (typeof NODE_ENV === 'undefined' || NODE_ENV === 'development') ? HOST_NAME_DEV : '';

export function getFormData() {
  let formData = {
    server: "localhost:8081", // "16.165.217.186:8081",
    context: "/AssetManagerWebService/rs/",
    "ref-link": "",     // "db/amLocation/126874",
    collection: "",     // "EmplDepts",
    param: {
      limit: "100",
      offset: "0",
      filter: "",
      orderby: "",
      fields: []
    },

    method: "get",
    user: "", // admin
    password: "",

    pageSize: 10,
    viewStyle: "tile",
    //        showError: false,
    showLabel: false
  };
  return formData;
}
