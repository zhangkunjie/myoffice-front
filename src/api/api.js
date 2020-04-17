import axios from 'axios';
let base = '/api';
/*日程管理接口*/
export const getActicityListPage = params => {
    return axios.post(`${base}/myoffice/activity/findPage/${params.pageSize}/${params.pageNo}`, params).then(res => res.data);
};
export const addActivity = params => {
    return axios.post(`${base}/myoffice/activity/insertBatch`, params).then(res => res.data);
};
export const deleteActivity = params => {
    return axios.post(`${base}/myoffice/activity/delete`, params).then(res => res.data);
};
export const  findAvgImplementRate = params => {
    return axios.post(`${base}/myoffice/report/findAvgImplementRate`, params).then(res => res.data);
};
export const  updateActivity = params => {
    return axios.post(`${base}/myoffice/activity/update`, params).then(res => res.data);
};
export const getCategoryList = params => {
    return axios.post(`${base}/myoffice/category/findAll`, params).then(res => res.data);
};
/*图书管理接口*/
//图书查询接口
export const getBookListPage = params => {
    return axios.post(`${base}/myoffice/book/findPage/${params.pageSize}/${params.pageNo}`, params).then(res => res.data);
};
//图书新增接口
export const addBook = params => {
    return axios.post(`${base}/myoffice/book/insert`, params).then(res => res.data);
};
//根据id查询图书接口
//图书编辑接口
export const  updateBook = params => {
    return axios.post(`${base}/myoffice/book/update`, params).then(res => res.data);
};
//图书删除接口
export const deleteBook= params => {
    return axios.post(`${base}/myoffice/book/delete`, params).then(res => res.data);
};


export const requestLogin = params => {
    return axios.post(`${base}/login`, params).then(res => res.data);
};

export const getUserList = params => {
    return axios.get(`${base}/user/list`, {
        params: params
    });
};

export const getUserListPage = params => {
    return axios.get(`${base}/user/listpage`, {
        params: params
    });
};

export const removeUser = params => {
    return axios.get(`${base}/user/remove`, {
        params: params
    });
};

export const batchRemoveUser = params => {
    return axios.get(`${base}/user/batchremove`, {
        params: params
    });
};

export const editUser = params => {
    return axios.get(`${base}/user/edit`, {
        params: params
    });
};

export const addUser = params => {
    return axios.get(`${base}/user/add`, {
        params: params
    });
};