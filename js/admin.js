let orderData = [];
const orderPageTableBody = document.querySelector('.orderPage-table tbody')
// 取得訂單
function getOrders(){
    adminInstance.get("/orders").then(res=>{
        console.log(res);
        orderData = res.data.orders;
        orderData.sort((a,b)=>{
            return b.createdAt - a.createdAt
        })
        renderOrders();
        // calcProductCategory();
        calcProductTitle();
    }).catch(err=>{
        console.log(err);
    })
}

// 時間格式化
function formatTime(timestamp){
    
    const time = new Date(timestamp * 1000);
    // 方法1  比較麻煩但可以隨意組合變化
    // return `${time.getFullYear()}/${time.getMonth()+1}/${time.getDate()} ${String(time.getHours()).padStart(2,0)}:${time.getMinutes()}:${time.getSeconds()}`
    // 方法2 比較方便但格式不能改
    return time.toLocaleString('zh-TW',{
        hours: false
    });
}
// padStart(2,0) => 第一個數字 : 希望這個字串長度是2 // 第二個數字 : 如果沒有達到字串長度會補什麼字

// 刪除單一訂單
function deleteSingleOrder(id){
    adminInstance.delete(`/orders/${id}`).then(res=>{
        console.log(res);
        orderData = res.data.orders;
        renderOrders();
    }).catch(err=>{
        console.log(err);
    })
}

// 修改訂單狀態
function updateOrderStatus(id){
    let result = {};
    orderData.forEach((order)=>{
        if(order.id === id){
            result = order
        }
    })
    const data = {
        data:{
            id: id,
            paid: !result.paid
        }
    }
    adminInstance.put('/orders',data).then((res)=>{
        console.log(res)
        orderData = res.data.orders;
        renderOrders();
    })
}

// LV1 全產品類別營收 
// 1. 組成資料
// 2. 渲染圖表
function calcProductCategory(){
    const resultObj = {};
    orderData.forEach((order)=>{
        order.products.forEach(product=>{
            if(resultObj[product.category] === undefined){
                resultObj[product.category] = product.price * product.quantity;
            }else{
                resultObj[product.category] += product.price * product.quantity;
            }
        })
    })
    renderChart( );
}

// LV2 圓餅圖 - 全品項營收比重
function calcProductTitle(){
    const resultObj = {};
    orderData.forEach((order)=>{
        order.products.forEach(product=>{
            if(resultObj[product.title] === undefined){
                resultObj[product.title] = product.price * product.quantity;
            }else{
                resultObj[product.title] += product.price * product.quantity;
            }
        })
    })
    const resultArr = Object.entries(resultObj);
    const sortResultArr = resultArr.sort((a,b)=>{
        return b[1] - a[1]; 
    });
    const rankOfThree = [];
    let otherTotal = 0;
    sortResultArr.forEach((product, index)=>{
        if(index <= 2){
            rankOfThree.push(product);
        }
        if(index > 2){
            otherTotal += product[1];
        }
    });
    // 當資料超過3筆才會被推進名次
    if(sortResultArr.length > 3){
        rankOfThree.push(['其他',otherTotal])
    }
    renderChart(rankOfThree);
}


orderPageTableBody.addEventListener('click',(e)=>{
    e.preventDefault();
    const id = e.target.closest('tr').getAttribute('data-id')
    if(e.target.classList.contains('delSingleOrder-Btn')){
       deleteSingleOrder(id);
    }
    if(e.target.nodeName === "SPAN"){
        updateOrderStatus(id);
    }
})

// 初始化
function init(){
    getOrders();
}

init();


// 渲染資料
function renderOrders(){
    let str= ""
    orderData.forEach((order)=>{
        let productStr = "";
        order.products.forEach(product=>{
            productStr += `<p>${product.title} x ${product.quantity}</p>`
        })
        str += `<tr data-id="${order.id}">
                    <td>${order.id}</td>
                    <td>
                      <p>${order.user.name}</p>
                      <p>${order.user.tel}</p>
                    </td>
                    <td>${order.user.address}</td>
                    <td>${order.user.email}</td>
                    <td>
                      ${productStr}
                    </td>
                    <td>${formatTime(order.createdAt)}</td>
                    <td class="orderStatus">
                      <a href="#">${order.paid ? `<span style="color:green">已處理</span>` : `<span style="color:red">未處理</span>`}</a>
                    </td>
                    <td>
                      <input type="button" class="delSingleOrder-Btn" value="刪除">
                    </td>
                </tr>`
    })
    orderPageTableBody.innerHTML = str;
}

// C3.js
function renderChart(data){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        color: {
            pattern: ['#DACBFF', '#9D7FEA', "#5434A7", "#301E5F"]
          },
        data: {
            type: "pie",
            columns: data,
            colors:{
                "Louvre 雙人床架":"#DACBFF",
                "Antony 雙人床架":"#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}
