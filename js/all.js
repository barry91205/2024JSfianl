const baseUrl = "https://livejs-api.hexschool.io";
const apiPath = "barry";
const customerApi = `${baseUrl}/api/livejs/v1/customer/${apiPath}`;
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  
let productData = [];
//  取得產品列表
function getProduct() {
  axios
    .get(`${customerApi}/products`)
    .then((res) => {
      // console.log(res);
      productData = res.data.products;
      renderProduct(productData);
     
    })
    .catch((err) => console.log(err));
}

const productWrap = document.querySelector(".productWrap");
// 渲染產品
function renderProduct(data) {
  let str = "";
  data.forEach((item) => {
    str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${formatNumber(item.price)}</p>
            </li>`;
  });
  productWrap.innerHTML = str;
}

//篩選產品
const productSelect = document.querySelector(".productSelect");
function filterProduct(value) {
  const result = [];
  productData.forEach((item) => {
    if (item.category === value) {
      result.push(item);
    }
  });
  renderProduct(result);
}
productSelect.addEventListener("change", (e) => {
  // renderProduct(result);
  filterProduct(e.target.value);
});

// 刪除購物車
const discardAllBtn = document.querySelector(".discardAllBtn");

function delAllCart() {
  Swal.fire({
    title: "確定要刪除全部商品?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定刪除"
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`${customerApi}/carts`).then((res) => {
        cartData = res.data.carts;
        renderCart();
      });
      Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success"
      });
    }
  });
 
}

discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  delAllCart();
});

// 選染購物車
let cartData = [];
let cartTotal = 0;
function getCart() {
  axios
    .get(`${customerApi}/carts`)
    .then((res) => {
      // console.log(res);
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      renderCart();
    })
    .catch((err) => {
      console.log(err);
    });
}

const shoppingCartTableBody = document.querySelector(
  ".shoppingCart-table tbody"
);
const shoppingCartTableFoot = document.querySelector(
  ".shoppingCart-table tfoot"
);

function renderCart() {
  if (cartData.length === 0) {
    shoppingCartTableBody.innerHTML = "購物車沒有任何商品!QQ</p>";
    shoppingCartTableFoot.innerHTML = `<tfoot>
                    <tr>
                        <td>
                            
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                            <p>總金額</p>
                        </td>
                        <td>NT$ 0</td>
                    </tr>
                </tfoot>`;
    return;
  }
  let str = "";
  cartData.forEach((item) => {
    str += `<tr data-id="${item.id}">
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.origin_price}</td>
                    <td>
                    <button type="button" class="minusBtn"> - </button>
                    ${item.quantity}
                    <button type="button" class="addBtn"> + </button>
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td>
                        <a href="#" class="material-icons discardBtn">
                            clear
                        </a>
                    </td>
                </tr>`;
  });
  shoppingCartTableBody.innerHTML = str;
  shoppingCartTableFoot.innerHTML = `<tr>
                        <td>
                            <a href="#" class="discardAllBtn">刪除所有品項</a>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                            <p>總金額</p>
                        </td>
                        <td>NT$${cartTotal}</td>
                    </tr>`;
}

productSelect.addEventListener("change", (e) => {
  e.preventDefault();
  filterProduct(e.target.value);
});

// 加入購物車
function addCart(id) {
  const addCardBtns = document.querySelectorAll('.addCardBtn');
  addCardBtns.forEach((item)=>item.classList.add('disabled')); 
  const data = {
    data: {
      productId: id,
      quantity: 1,
    },
  };
  axios.post(`${customerApi}/carts`, data).then((res) => {
    // console.log(res);
    cartData = res.data.carts;
    cartTotal = res.data.finalTotal;
    renderCart();
    Toast.fire({
        icon: "success",
        title: "成功加入購物車"
      });
      addCardBtns.forEach((item)=>item.classList.remove('disabled')); 
  });
}

productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  if(e.target.classList.contains('addCardBtn')){
    addCart(e.target.dataset.id);
  }
  // console.log(e.target.dataset.id);
  
});

// 刪除單一商品
function delCart(id) {
  axios.delete(`${customerApi}/carts/${id}`).then((res) => {
    cartData = res.data.carts;
    renderCart();
  });
}

// 編輯產品數量
function updateCart(id, qty) {
  const data = {
    data: {
      id,
      quantity: qty,
    },
  };
  axios.patch(`${customerApi}/carts`, data).then((res) => {
    cartData = res.data.carts;
    renderCart();
  });
}

shoppingCartTableBody.addEventListener("click", (e) => {
  const id = e.target.closest("tr").getAttribute("data-id");
  e.preventDefault();
  if (e.target.classList.contains("discardBtn")) {
    delCart(id);
  }

  if (e.target.classList.contains("addBtn")) {
    let result = {};
    cartData.forEach((item) => {
      if (item.id === id) {
        result = item;
      }
    });
    let qty = result.quantity + 1;
    updateCart(id, qty);
  }
});

shoppingCartTableFoot.addEventListener('click',(e)=>{
  e.preventDefault();
  if(e.target.classList.contains('discardAllBtn')){
    delAllCart();
  }
})

discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  delAllCart();
});

function checkForm(){
    const constraints = {
        姓名: {
          presence: { message: "^必填" },
        },
        電話: {
          presence: { message: "^必填" },
        },
        Email: {
          presence: { message: "^必填" },
          email: { message: "^請輸入正確的信箱格式" },
        },
        寄送地址: {
          presence: { message: "^必填" },
        },
      };
      const error = validate(orderInfoForm,constraints);
      console.log(error);
      return error
}

const orderInfoForm = document.querySelector('.orderInfo-form')
const orderInfoBtn = document.querySelector('.orderInfo-btn');
function sendOrder() {
    if(cartData.length === 0){
        alert("購物車空空的..")
        return
    }
    if(checkForm()){
        alert("資料必填!")
        return
    }
    const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
  let data = {
    data: {
      user: {
        name: customerName.value.trim(),
        tel: customerPhone.value.trim(),
        email: customerEmail.value.trim(),
        address: customerAddress.value.trim(),
        payment: tradeWay.value,
      },
    },
  };
  axios.post(`${customerApi}/orders`, data).then((res) => {
    console.log(res);
    orderInfoForm.reset();
  }).catch(err=>{
    console.log(err);
  })

  
}
orderInfoBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    sendOrder();
    Toast.fire({
      icon: "success",
      title: "成功下單!"
    });
  })
// 初始化
function init() {
  getProduct();
  getCart();
}
init();

function formatNumber(number) {
  let parts = number.toString().split('.'); // 分割整數和小數部分
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 格式化整數部分
  return parts.length > 1 ? parts.join('.') : parts[0]; // 拼接小數部分
}
