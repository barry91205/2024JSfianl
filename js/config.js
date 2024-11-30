const baseUrl = "https://livejs-api.hexschool.io";
const apiPath = "barry";

// 前台
const customerApi = `${baseUrl}/api/livejs/v1/customer/${apiPath}`;

// 後台
const token = "rowp0jQ0pATXljK5zZmectikx5A2";
const adminApi = `${baseUrl}/api/livejs/v1/admin/${apiPath}`;

const headers = {
    headers:{
        authorization: token
    }
}

// Set config defaults when creating the instance
const adminInstance = axios.create({
    baseURL: adminApi,
    headers:{
        authorization: token
    }
  });